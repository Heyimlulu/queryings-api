import express, { Request, Response, NextFunction } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import cors from "cors";
import { name, version } from "../package.json";
import { logger } from "./utils/logger";

const ALLOWED_METHODS = ["GET", "POST", "OPTIONS"];

const DEFAULT_ORIGINS = [
  "http://localhost:4200",
  "http://localhost:4000",
];

const getAllowedOrigins = (): (string | RegExp)[] => {
  const env = process.env.ALLOWED_ORIGINS;
  if (!env) return DEFAULT_ORIGINS;
  return env
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => (origin.includes("*") ? new RegExp(origin) : origin));
};

const methodFilter = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!ALLOWED_METHODS.includes(req.method)) {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  next();
};

const addClientHeader = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.header("Client", `${name}:${version}`);
  next();
};

const requestLogger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      `[http] ${req.ip ?? "unknown"} ${req.method} ${req.path} ${
        res.statusCode
      } ${Date.now() - start}ms`
    );
  });
  next();
};

const genericErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`[http] unhandled error: ${err.message}`);
  res.status(500).json({ message: "Internal server error" });
};

const middlewares = (app: express.Application) => {
  app.use(
    cors({
      origin: getAllowedOrigins(),
      methods: ["GET", "POST"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
      ],
      credentials: false,
    })
  );
  app.use(express.json());
  app.use(methodFilter);
  app.use(addClientHeader);
  app.use(requestLogger);

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    // Use a custom keyGenerator that properly handles IPv6 addresses.
    // trust proxy is enabled in index.ts, so req.ip is the real client IP
    // when the request comes through the SSR proxy or another trusted hop.
    keyGenerator: (req) => {
      // Prefer Cloudflare's header if present, otherwise the client IP.
      const cfIp = req.headers["cf-connecting-ip"];
      const cfIpString = Array.isArray(cfIp) ? cfIp[0] : cfIp;
      if (cfIpString) {
        return ipKeyGenerator(cfIpString);
      }

      return ipKeyGenerator(req.ip ?? "unknown");
    },
    message: {
      error: "Too many requests, please try again later. (30 reqs/min/IP)",
    },
  });

  app.use(limiter);
  app.use(genericErrorHandler);
};

export default middlewares;
