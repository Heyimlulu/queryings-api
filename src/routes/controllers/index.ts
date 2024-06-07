import { Router} from "express";

import pingRoute from "./ping";
import queryRoute from "./queries";
import trendRoute from "./trendings";

const router = Router();

router.use("/", pingRoute);
router.use("/", queryRoute);
router.use("/", trendRoute);

export default router;