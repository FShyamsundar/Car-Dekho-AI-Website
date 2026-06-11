import carService from "../services/carService.js";

export const getAllCars = async (req, res, next) => {
  try {
    const {
      make,
      bodyType,
      fuelType,
      priceMin,
      priceMax,
      page = 1,
      limit = 10,
    } = req.query;
    const filters = {};

    if (make) filters.make = make;
    if (bodyType) filters.bodyType = bodyType;
    if (fuelType) filters.fuelType = fuelType;
    if (priceMin || priceMax) {
      filters.priceExShowroom = {};
      if (priceMin) filters.priceExShowroom.$gte = Number(priceMin);
      if (priceMax) filters.priceExShowroom.$lte = Number(priceMax);
    }

    const cars = await carService.getCars(filters, page, limit);
    const total = await carService.countCars(filters);

    res.json({
      success: true,
      data: cars,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const car = await carService.getCarById(id);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
};

export const createCar = async (req, res, next) => {
  try {
    const carData = req.body;
    const car = await carService.createCar(carData);
    res.status(201).json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
};

export const updateCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const carData = req.body;
    const car = await carService.updateCar(id, carData);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
};

export const deleteCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const car = await carService.deleteCar(id);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    next(error);
  }
};
