export function formatPrice(value) {
  const number = Number(value || 0);

  if (number >= 10000000) {
    return `Rs. ${(number / 10000000).toFixed(2)} crore`;
  }

  return `Rs. ${(number / 100000).toFixed(2)} lakh`;
}

export function formatMileage(car) {
  if (!car) {
    return "-";
  }

  return car.fuelType === "Electric"
    ? `${car.mileage} km range`
    : `${car.mileage} km/l`;
}

export function formatEngine(car) {
  if (!car) {
    return "-";
  }

  return car.engineCC === 0 ? "Battery EV" : `${(car.engineCC / 1000).toFixed(1)}L`;
}

export function formatScore(value) {
  const number = Number(value || 0);
  return number.toFixed(1);
}

export function formatRatingLabel(value) {
  return `${formatScore(value)} / 5`;
}

export function averageReviewScore(reviews = []) {
  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return total / reviews.length;
}
