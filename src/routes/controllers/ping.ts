import { Router, Response } from "express";
import { apiPaths } from "../../utils/paths";

const pingRoute = Router();

/**
 * Ping the server
 */
pingRoute.get(apiPaths.ping, (_, res: Response) =>
  res.json({ message: "Server is up and running!" })
);

export default pingRoute;