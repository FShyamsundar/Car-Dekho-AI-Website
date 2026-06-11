import mongoose from "mongoose";

const userReviewSchema = new mongoose.Schema(
  {
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const carSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    variant: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    bodyType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fuelType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    transmission: {
      type: String,
      required: true,
      trim: true,
    },
    priceExShowroom: {
      type: Number,
      required: true,
      index: true,
    },
    mileage: {
      type: Number,
      required: true,
    },
    engineCC: {
      type: Number,
      required: true,
    },
    powerBhp: {
      type: Number,
      required: true,
    },
    torqueNm: {
      type: Number,
      required: true,
    },
    seatingCapacity: {
      type: Number,
      required: true,
    },
    bootSpaceLitres: {
      type: Number,
      required: true,
    },
    groundClearanceMm: {
      type: Number,
      required: true,
    },
    safetyRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      index: true,
    },
    airbags: {
      type: Number,
      required: true,
    },
    esc: {
      type: Boolean,
      default: false,
    },
    adasLevel: {
      type: Number,
      default: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    reliabilityRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    resaleRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    serviceCostRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewScore: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      index: true,
    },
    userReviews: {
      type: [userReviewSchema],
      default: [],
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    recommendationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

carSchema.index({ make: 1, model: 1, variant: 1 }, { unique: true });
carSchema.index({
  make: "text",
  model: "text",
  variant: "text",
  features: "text",
  pros: "text",
  cons: "text",
});

const Car = mongoose.model("Car", carSchema);

export default Car;
