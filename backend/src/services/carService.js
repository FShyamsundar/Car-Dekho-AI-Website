import Car from "../models/carModel.js";

const carService = {
  getCars: async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await Car.find(filters).skip(skip).limit(limit).exec();
  },

  countCars: async (filters = {}) => {
    return await Car.countDocuments(filters);
  },

  getCarById: async (id) => {
    return await Car.findOne({ id }).exec();
  },

  createCar: async (carData) => {
    const car = new Car(carData);
    return await car.save();
  },

  updateCar: async (id, carData) => {
    return await Car.findOneAndUpdate({ id }, carData, { new: true }).exec();
  },

  deleteCar: async (id) => {
    return await Car.findOneAndDelete({ id }).exec();
  },
};

export default carService;
