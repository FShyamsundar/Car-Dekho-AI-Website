import { averageReviewScore, formatMileage } from "./carFormatters.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function bodyTypeScore(car, usage) {
  const type = String(car.bodyType || "").toLowerCase();

  if (usage === "city") {
    return ["hatchback", "micro suv", "compact suv", "ev"].includes(type) ? 8 : 0;
  }

  if (usage === "highway") {
    return ["sedan", "suv", "mid-size suv", "mpv"].includes(type) ? 8 : 0;
  }

  if (usage === "family") {
    return car.seatingCapacity >= 5 ? 10 : 0;
  }

  return 6;
}

export function scoreQuizMatch(car, answers = {}) {
  let score = Number(car.recommendationScore || 0);

  if (answers.budget) {
    const { minPrice, maxPrice } = answers.budget;

    if (minPrice && car.priceExShowroom < minPrice) {
      score -= clamp((minPrice - car.priceExShowroom) / 100000, 2, 14);
    }

    if (maxPrice) {
      if (car.priceExShowroom <= maxPrice) {
        score += 12;
      } else {
        score -= clamp((car.priceExShowroom - maxPrice) / 100000, 2, 18);
      }
    }
  }

  score += bodyTypeScore(car, answers.usage);

  if (answers.fuel && answers.fuel !== "Any") {
    score += car.fuelType === answers.fuel ? 10 : -3;
  }

  if (answers.transmission && answers.transmission !== "Any") {
    score += car.transmission === answers.transmission ? 8 : -2;
  }

  if (answers.seating && answers.seating !== "Any") {
    const desiredSeats = Number(answers.seating);
    score += car.seatingCapacity >= desiredSeats ? 8 : -4;
  }

  const priorities = Array.isArray(answers.priorities) ? answers.priorities : [];

  if (priorities.includes("safety")) {
    score += car.safetyRating * 3;
  }

  if (priorities.includes("mileage")) {
    score += car.fuelType === "Electric" ? 10 : clamp(car.mileage / 2, 3, 14);
  }

  if (priorities.includes("space")) {
    score += clamp(car.bootSpaceLitres / 40, 2, 15);
  }

  if (priorities.includes("tech")) {
    score += car.adasLevel * 5 + clamp(car.features.length, 2, 12);
  }

  if (priorities.includes("performance")) {
    score += clamp(car.powerBhp / 8, 3, 14);
  }

  if (priorities.includes("value")) {
    score += car.serviceCostRating * 2 + car.reliabilityRating * 2;
  }

  return Math.round(clamp(score, 0, 100));
}

export function buildRecommendationReasons(car, answers = {}) {
  const reasons = [];
  const avgReview = averageReviewScore(car.userReviews);

  if (answers.budget?.maxPrice && car.priceExShowroom <= answers.budget.maxPrice) {
    reasons.push("fits your budget");
  }

  if (answers.usage === "city" && ["Hatchback", "EV", "Micro SUV", "Compact SUV"].includes(car.bodyType)) {
    reasons.push("works well in the city");
  }

  if (answers.usage === "highway" && ["Sedan", "SUV", "Mid-size SUV", "MPV"].includes(car.bodyType)) {
    reasons.push("feels suitable for highways");
  }

  if (answers.usage === "family" && car.seatingCapacity >= 5 && car.bootSpaceLitres >= 300) {
    reasons.push("looks family friendly");
  }

  if (answers.fuel && answers.fuel !== "Any" && car.fuelType === answers.fuel) {
    reasons.push(`${car.fuelType.toLowerCase()} preference matched`);
  }

  if (answers.transmission && answers.transmission !== "Any" && car.transmission === answers.transmission) {
    reasons.push(`${car.transmission.toLowerCase()} preference matched`);
  }

  if (answers.seating && answers.seating !== "Any" && car.seatingCapacity >= Number(answers.seating)) {
    reasons.push(`offers at least ${answers.seating} seats`);
  }

  if ((answers.priorities || []).includes("safety") && car.safetyRating >= 4) {
    reasons.push("strong safety score");
  }

  if ((answers.priorities || []).includes("mileage") && formatMileage(car)) {
    reasons.push("good efficiency profile");
  }

  if ((answers.priorities || []).includes("space") && car.bootSpaceLitres >= 300) {
    reasons.push("practical boot space");
  }

  if ((answers.priorities || []).includes("tech") && car.adasLevel >= 1) {
    reasons.push("useful technology on board");
  }

  if ((answers.priorities || []).includes("performance") && car.powerBhp >= 100) {
    reasons.push("has healthy performance numbers");
  }

  if ((answers.priorities || []).includes("value") && car.recommendationScore >= 80) {
    reasons.push("strong ownership value");
  }

  if (avgReview >= 4) {
    reasons.push("well-reviewed by owners");
  }

  if (reasons.length === 0) {
    reasons.push("balanced across the main ownership factors");
  }

  return [...new Set(reasons)].slice(0, 4);
}
