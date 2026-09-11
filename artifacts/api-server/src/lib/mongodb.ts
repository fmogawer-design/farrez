import mongoose from "mongoose";
import { logger } from "./logger";

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectMongoDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    throw new Error("MONGODB_URI is required.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).then((connection) => {
      logger.info("Connected to MongoDB");
      return connection;
    }).catch((error: unknown) => {
      connectionPromise = null;
      logger.error({ err: error }, "Failed to connect to MongoDB");
      throw error;
    });
  }

  return connectionPromise;
}