import express from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import cors from "cors";
import { name, version } from "../package.json";

const middlewares = (app: express.Application) => {
    app.use(cors());
    app.use(express.json());
    
    app.use((req, res, next) => {
      // set the CORS policy
      res.header("Access-Control-Allow-Origin", "*");
      // set the CORS headers
      res.header(
        "Access-Control-Allow-Headers",
        "origin, X-Requested-With,Content-Type,Accept, Authorization"
      );
      // set the CORS method headers
      res.header("Access-Control-Allow-Methods", "GET,POST");
      if (req.method === "OPTIONS") {
        return res.status(200).json({});
      }
      // Only allow GET and POST methods
      if (req.method !== "GET" && req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }
      // set the client
      res.header("Client", `${name}:${version}`);
      next();
    });

    const limiter = rateLimit({
	    windowMs: 60 * 1000, // 1 minutes
	    max: 120,
      // Use a custom keyGenerator that properly handles IPv6 addresses
      keyGenerator: (req) => {
        // First try to use Cloudflare IP if available
        const cfIp = req.headers['cf-connecting-ip'];
        if (cfIp) {
          const ip = Array.isArray(cfIp) ? cfIp[0] : cfIp;
          return ip.toString();
        }
        
        return ipKeyGenerator(req.ip)
      },
      message: { error: "Too many requests, please try again later. (120 reqs/min/IP)" }
	  });

    app.use(limiter);
}

export default middlewares;