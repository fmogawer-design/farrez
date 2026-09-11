import { Router, type IRouter } from "express";
import healthRouter from "./health";
import comparisonsRouter from "./comparisons";
import billingRouter from "./billing";
import vendorsRouter from "./vendors";

const router: IRouter = Router();

router.use(healthRouter);
router.use(comparisonsRouter);
router.use(billingRouter);
router.use(vendorsRouter);

export default router;
