import Car from "../models/carModel.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { carSeedData } from "../data/cars.seed.js";

const dayInMilliseconds = 24 * 60 * 60 * 1000;

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const average = (values) => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const toFixedNumber = (value, digits = 1) => Number(value.toFixed(digits));

const buildUserReviews = (reviews, carIndex) =>
  reviews.map((review, reviewIndex) => ({
    ...review,
    createdAt: new Date(Date.now() - (carIndex * 2 + reviewIndex) * dayInMilliseconds),
  }));

const calculateRecommendationScore = (car, reviewScore) => {
  const safetyScore = (car.safetyRating / 5) * 40;
  const reliabilityScore = (car.reliabilityRating / 5) * 20;
  const mileageScore = clamp((car.mileage - 10) / 20, 0, 1) * 15;
  const featureScore = clamp(car.features.length / 6, 0, 1) * 15;
  const reviewComponent = (reviewScore / 5) * 10;

  return toFixedNumber(safetyScore + reliabilityScore + mileageScore + featureScore + reviewComponent, 1);
};

const buildSeedDocument = (car, index) => {
  const userReviews = buildUserReviews(car.userReviews, index);
  const reviewScore = toFixedNumber(average(userReviews.map((review) => review.rating)), 1);

  return {
    ...car,
    id: slugify(`${car.make}-${car.model}-${car.variant}`),
    reviewScore,
    recommendationScore: calculateRecommendationScore(car, reviewScore),
    userReviews,
  };
};

const seedCars = async () => {
  const shouldReset = process.argv.includes("--reset");
  const documents = carSeedData.map(buildSeedDocument);
  const totalReviews = documents.reduce((count, car) => count + car.userReviews.length, 0);

  try {
    await connectDB();

    if (shouldReset) {
      await Car.deleteMany({});
    }

    await Car.createIndexes();

    const operations = documents.map((car) => ({
      updateOne: {
        filter: { id: car.id },
        update: { $set: car },
        upsert: true,
      },
    }));

    const result = await Car.bulkWrite(operations, { ordered: false });

    console.log(
      `Seeded ${documents.length} cars with ${totalReviews} reviews. Upserted: ${result.upsertedCount || 0}, modified: ${result.modifiedCount || 0}, matched: ${result.matchedCount || 0}.`,
    );
  } catch (error) {
    console.error("Seed failed", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

await seedCars();
