import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME?.trim();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH?.trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface LockoutRecord {
  count: number;
  lockedUntil: number;
}

const attempts = new Map<string, LockoutRecord>();

const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Za-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
};

const getAdminHash = (): string | undefined => {
  if (ADMIN_PASSWORD_HASH) {
    return ADMIN_PASSWORD_HASH;
  }
  if (ADMIN_PASSWORD) {
    if (!isStrongPassword(ADMIN_PASSWORD)) {
      logger.error(
        "[auth] ADMIN_PASSWORD does not meet the security policy (>= 8 characters, letters and numbers). " +
          "Generate a bcrypt hash with a strong password and set ADMIN_PASSWORD_HASH instead."
      );
      return undefined;
    }
    return bcrypt.hashSync(ADMIN_PASSWORD, 10);
  }
  return undefined;
};

const adminHash = getAdminHash();

const isLocked = (key: string): boolean => {
  const record = attempts.get(key);
  if (!record) return false;
  if (record.lockedUntil && record.lockedUntil > Date.now()) return true;
  if (record.lockedUntil && record.lockedUntil <= Date.now()) {
    attempts.delete(key);
  }
  return false;
};

const recordFailure = (key: string) => {
  const record = attempts.get(key) ?? { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
    logger.warn(
      `[auth] account locked for ${key} until ${new Date(
        record.lockedUntil
      ).toISOString()}`
    );
  }
  attempts.set(key, record);
};

const recordSuccess = (key: string) => {
  attempts.delete(key);
};

const parseBasicAuth = (
  header: string
): { username: string; password: string } | null => {
  if (!header.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    if (!username) return null;
    return { username, password };
  } catch {
    return null;
  }
};

/**
 * Basic-auth middleware with bcrypt password verification and brute-force
 * account lockout. Credentials are configured via ADMIN_USERNAME and either
 * ADMIN_PASSWORD_HASH (recommended) or ADMIN_PASSWORD (will be hashed at startup).
 */
export const withAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!ADMIN_USERNAME || !adminHash) {
    logger.warn(
      "[auth] ADMIN_USERNAME / ADMIN_PASSWORD not configured; request allowed without authentication"
    );
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.set("WWW-Authenticate", "Basic");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const credentials = parseBasicAuth(authHeader);
  if (!credentials) {
    res.set("WWW-Authenticate", "Basic");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const key = `${req.ip ?? "unknown"}:${credentials.username}`;

  if (isLocked(key)) {
    return res
      .status(423)
      .json({ message: "Account locked. Try again later." });
  }

  if (credentials.username !== ADMIN_USERNAME) {
    recordFailure(key);
    res.set("WWW-Authenticate", "Basic");
    return res.status(401).json({ message: "Unauthorized" });
  }

  bcrypt.compare(credentials.password, adminHash, (err, ok) => {
    if (err || !ok) {
      recordFailure(key);
      res.set("WWW-Authenticate", "Basic");
      return res.status(401).json({ message: "Unauthorized" });
    }

    recordSuccess(key);
    res.locals.user = { name: credentials.username };
    next();
  });
};
