import mongoose from "mongoose";
import config from "./index.js";

export const connectDB = async () => {
  if (mongoose.connection.readyState > 0) {
    return mongoose.connection;
  }

  await mongoose.connect(config.mongoUri);
  return mongoose.connection;
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export default connectDB;
