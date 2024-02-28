import { Router, Request, Response } from "express";
import {
  generatePersonalAccessToken,
  verifyPersonalAccessToken,
} from "../utils/security";

const authRoute = Router();

authRoute.post("/generate-personal-token", (req: Request, res: Response) => {
  const { username }: { username: string } = req.body;
  const token = generatePersonalAccessToken(username);
  return res.json({ token });
});

authRoute.post("/verify-personal-token", (req: Request, res: Response) => {
  const { token }: { token: string } = req.body;
  return res.json({ isValid: verifyPersonalAccessToken(token) });
});

export default authRoute;
