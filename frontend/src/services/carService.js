import api from "../api/axios.js";

export async function fetchCars(params = {}) {
  const response = await api.get("/cars", {
    params: {
      page: 1,
      limit: 1000,
      ...params,
    },
  });

  return response.data;
}

export async function fetchCarById(carId) {
  const response = await api.get(`/cars/${carId}`);
  return response.data;
}

export async function fetchCarReviews(carId) {
  const response = await api.get(`/cars/${carId}/reviews`);
  return response.data;
}
