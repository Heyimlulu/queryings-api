import { Router } from "express";
import { getQueries } from "../../controllers/queries";
import { apiPaths } from "../../utils/paths";

const queriesRoute = Router();

queriesRoute.get(apiPaths.getQueries, getQueries);

export default queriesRoute;