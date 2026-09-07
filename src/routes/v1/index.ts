import { Router} from "express";

import queriesRoute from "./queries";
import trendingsRoute from "./trendings";

const v1Route = Router();

v1Route.use("/", queriesRoute);
v1Route.use("/", trendingsRoute);

export default v1Route;