import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import carRoutes from "./carRoutes.js";
import reviewRoutes from "./reviewRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/cars", carRoutes);
router.use("/cars/:carId/reviews", reviewRoutes);

export default router;
