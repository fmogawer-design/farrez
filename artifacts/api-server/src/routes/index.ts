import { Router, type IRouter } from "express";
import healthRouter from "./health";
import comparisonsRouter from "./comparisons";

const router: IRouter = Router();

router.use(healthRouter);
router.use(comparisonsRouter);

export default router;
