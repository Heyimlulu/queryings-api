import express from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import cors from "cors";
import { name, version } from "../package.json";

const ALLOWED_METHODS = ["GET", "POST", "OPTIONS"];

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

const middlewares = (app: express.Application) => {
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
      ],
    })
  );
  app.use(express.json());
  app.use(methodFilter);
  app.use(addClientHeader);

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120,
    // Use a custom keyGenerator that properly handles IPv6 addresses
    keyGenerator: (req) => {
      // First try to use Cloudflare IP if available
      const cfIp = req.headers["cf-connecting-ip"];
      if (cfIp) {
        const ip = Array.isArray(cfIp) ? cfIp[0] : cfIp;
        return ip.toString();
      }

      return ipKeyGenerator(req.ip);
    },
    message: {
      error: "Too many requests, please try again later. (120 reqs/min/IP)",
    },
  });

  app.use(limiter);
};

export default middlewares;