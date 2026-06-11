import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCars } from "../services/carService.js";

const CarsContext = createContext(null);

export function CarsProvider({ children }) {
  const [cars, setCars] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const loadCars = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const payload = await fetchCars();
      const nextCars = Array.isArray(payload?.data) ? payload.data : [];

      setCars(
        [...nextCars].sort(
          (a, b) => Number(b.recommendationScore || 0) - Number(a.recommendationScore || 0),
        ),
      );
      setStatus("success");
    } catch (requestError) {
      setCars([]);
      setStatus("error");
      setError(requestError?.message || "Failed to load car data.");
    }
  }, []);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const carsById = useMemo(() => {
    return new Map(cars.map((car) => [car.id, car]));
  }, [cars]);

  const value = useMemo(
    () => ({
      cars,
      carsById,
      status,
      isLoading: status === "loading",
      isError: status === "error",
      error,
      refreshCars: loadCars,
      totalCars: cars.length,
    }),
    [cars, carsById, error, loadCars, status],
  );

  return <CarsContext.Provider value={value}>{children}</CarsContext.Provider>;
}

export function useCars() {
  const context = useContext(CarsContext);

  if (!context) {
    throw new Error("useCars must be used inside CarsProvider");
  }

  return context;
}
