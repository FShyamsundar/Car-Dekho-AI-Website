import { averageReviewScore } from "./carFormatters.js";

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildSearchableText(car) {
  const reviewText = (car.userReviews || [])
    .map((review) => [review.reviewerName, review.title, review.comment].join(" "))
    .join(" ");

  return [
    car.make,
    car.model,
    car.variant,
    car.bodyType,
    car.fuelType,
    car.transmission,
    (car.features || []).join(" "),
    (car.pros || []).join(" "),
    (car.cons || []).join(" "),
    reviewText,
  ]
    .join(" ")
    .toLowerCase();
}

export function getUniqueValues(cars, key) {
  return [...new Set(cars.map((car) => car[key]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}

export function filterCars(cars, filters = {}) {
  const query = normalize(filters.q);

  return cars.filter((car) => {
    if (query && !buildSearchableText(car).includes(query)) {
      return false;
    }

    if (filters.make && normalize(car.make) !== normalize(filters.make)) {
      return false;
    }

    if (filters.model && !normalize(car.model).includes(normalize(filters.model))) {
      return false;
    }

    if (filters.variant && !normalize(car.variant).includes(normalize(filters.variant))) {
      return false;
    }

    if (filters.bodyType && normalize(filters.bodyType) !== "all") {
      if (normalize(car.bodyType) !== normalize(filters.bodyType)) {
        return false;
      }
    }

    if (filters.fuelType && normalize(filters.fuelType) !== "all") {
      if (normalize(car.fuelType) !== normalize(filters.fuelType)) {
        return false;
      }
    }

    if (filters.transmission && normalize(filters.transmission) !== "all") {
      if (normalize(car.transmission) !== normalize(filters.transmission)) {
        return false;
      }
    }

    const minPrice = toNumber(filters.minPrice);
    const maxPrice = toNumber(filters.maxPrice);
    const minMileage = toNumber(filters.minMileage);
    const maxMileage = toNumber(filters.maxMileage);
    const minSafety = toNumber(filters.minSafety);
    const minReviewScore = toNumber(filters.minReviewScore);
    const minSeatingCapacity = toNumber(filters.minSeatingCapacity);
    const minAdasLevel = toNumber(filters.minAdasLevel);
    const minAirbags = toNumber(filters.minAirbags);
    const minReliability = toNumber(filters.minReliability);
    const minResale = toNumber(filters.minResale);
    const minServiceCost = toNumber(filters.minServiceCost);
    const minRecommendationScore = toNumber(filters.minRecommendationScore);
    const minBootSpace = toNumber(filters.minBootSpace);
    const minPower = toNumber(filters.minPower);
    const minTorque = toNumber(filters.minTorque);

    if (minPrice !== null && car.priceExShowroom < minPrice) return false;
    if (maxPrice !== null && car.priceExShowroom > maxPrice) return false;
    if (minMileage !== null && car.mileage < minMileage) return false;
    if (maxMileage !== null && car.mileage > maxMileage) return false;
    if (minSafety !== null && car.safetyRating < minSafety) return false;

    const reviewScore = averageReviewScore(car.userReviews);
    if (minReviewScore !== null && reviewScore < minReviewScore) return false;

    if (minSeatingCapacity !== null && car.seatingCapacity < minSeatingCapacity) {
      return false;
    }

    if (minAdasLevel !== null && car.adasLevel < minAdasLevel) return false;
    if (minAirbags !== null && car.airbags < minAirbags) return false;
    if (minReliability !== null && car.reliabilityRating < minReliability) return false;
    if (minResale !== null && car.resaleRating < minResale) return false;
    if (minServiceCost !== null && car.serviceCostRating < minServiceCost) return false;
    if (
      minRecommendationScore !== null &&
      car.recommendationScore < minRecommendationScore
    ) {
      return false;
    }
    if (minBootSpace !== null && car.bootSpaceLitres < minBootSpace) return false;
    if (minPower !== null && car.powerBhp < minPower) return false;
    if (minTorque !== null && car.torqueNm < minTorque) return false;

    return true;
  });
}

export function sortCars(cars, sort = "recommendation_desc") {
  const cloned = [...cars];

  cloned.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.priceExShowroom - b.priceExShowroom;
      case "price_desc":
        return b.priceExShowroom - a.priceExShowroom;
      case "mileage_desc":
        return b.mileage - a.mileage;
      case "safety_desc":
        return b.safetyRating - a.safetyRating;
      case "review_desc":
        return averageReviewScore(b.userReviews) - averageReviewScore(a.userReviews);
      case "newest_desc":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "recommendation_desc":
      default:
        return b.recommendationScore - a.recommendationScore;
    }
  });

  return cloned;
}

export function paginateCars(cars, page = 1, limit = 12) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 12);
  const start = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    total: cars.length,
    pages: Math.max(1, Math.ceil(cars.length / safeLimit)),
    results: cars.slice(start, start + safeLimit),
  };
}

export function getActiveFilterCount(filters = {}) {
  return Object.values(filters).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== "" && value !== null && value !== undefined && value !== "All";
  }).length;
}
