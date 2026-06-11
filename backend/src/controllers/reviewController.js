import reviewService from "../services/reviewService.js";

export const addReview = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const reviewData = req.body;

    const car = await reviewService.addReview(carId, reviewData);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const reviews = await reviewService.getReviews(carId);

    if (!reviews) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { carId, reviewIndex } = req.params;
    const car = await reviewService.deleteReview(carId, reviewIndex);

    if (!car) {
      return res
        .status(404)
        .json({ success: false, message: "Car or review not found" });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
      data: car,
    });
  } catch (error) {
    next(error);
  }
};
