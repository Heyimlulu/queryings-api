import { Router } from "express";
import { getTrendings, getTrending } from "../../controllers/trendings";
import { apiPaths } from "../../utils/paths";

const trendingsRoute = Router();

trendingsRoute.get(apiPaths.getTrendings, getTrendings);
trendingsRoute.get(apiPaths.getTrending, getTrending);

export default trendingsRoute;