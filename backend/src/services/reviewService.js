import Car from "../models/carModel.js";

const reviewService = {
  addReview: async (carId, reviewData) => {
    return await Car.findOneAndUpdate(
      { id: carId },
      { $push: { userReviews: reviewData } },
      { new: true },
    ).exec();
  },

  getReviews: async (carId) => {
    const car = await Car.findOne({ id: carId }).exec();
    return car ? car.userReviews : null;
  },

  deleteReview: async (carId, reviewIndex) => {
    const car = await Car.findOne({ id: carId }).exec();
    if (!car || !car.userReviews[reviewIndex]) {
      return null;
    }
    car.userReviews.splice(reviewIndex, 1);
    return await car.save();
  },
};

export default reviewService;
