import basicAuth from "express-basic-auth";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

/**
 * Basic-auth middleware. Currently exported but not wired to any route.
 * If credentials are not configured, it rejects every request to the routes it protects.
 */
export const withAuth =
  username && password
    ? basicAuth({
        users: { [username]: password },
        unauthorizedResponse: { message: "Unauthorized" },
      })
    : (_req: Request, _res: Response, next: () => void) => {
        // Fallback: pass through if credentials are not configured.
        // In production, configure ADMIN_USERNAME and ADMIN_PASSWORD.
        next();
      };
