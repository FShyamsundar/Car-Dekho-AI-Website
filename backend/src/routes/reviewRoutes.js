import { Router } from "express";
import {
  addReview,
  getReviews,
  deleteReview,
} from "../controllers/reviewController.js";

const router = Router({ mergeParams: true });

router.post("/", addReview);
router.get("/", getReviews);
router.delete("/:reviewIndex", deleteReview);

export default router;
