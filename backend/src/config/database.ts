/**
 * MongoDB Configuration
 */

import dns from "dns";
import mongoose from "mongoose";
import { Logger } from "../utils/logger.js";

// Ensure IPv4 first to avoid IPv6 DNS delays on Windows
try {
  dns.setDefaultResultOrder?.("ipv4first");
} catch (_) {}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      Logger.info("✓ MongoDB connected successfully");
      return;
    } catch (error) {
      Logger.warn(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error instanceof Error ? error.message : String(error)}`);
      if (attempt >= maxRetries) {
        Logger.error("✗ All MongoDB connection attempts failed", error);
        process.exit(1);
      }
      // Wait before retrying (1s, 2s, 3s...)
      await new Promise(res => setTimeout(res, attempt * 1500));
    }
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    Logger.info("✓ MongoDB disconnected");
  } catch (error) {
    Logger.error("✗ MongoDB disconnection failed", error);
  }
}

export function getMongooseConnection() {
  return mongoose;
}
