import { Router} from "express";

import pingRoute from "../controllers/ping";

const defaultRoute = Router();

defaultRoute.use("/", pingRoute);

export default defaultRoute;