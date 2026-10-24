/**
 * Environment Configuration
 */

export interface Config {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpire: string;
  jwtRefreshExpire: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  frontendUrl: string;
  adminEmail: string;
  adminPassword: string;
}

export function loadConfig(): Config {
  const nodeEnv = process.env.NODE_ENV || "development";
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campus-lost-found";
  const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_key_campus_lost_found";
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "default_jwt_refresh_secret_key_campus_lost_found";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@campus.edu";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin@12345";

  return {
    nodeEnv,
    port: parseInt(process.env.PORT || "5000", 10),
    mongoUri,
    jwtSecret,
    jwtRefreshSecret,
    jwtExpire: process.env.JWT_EXPIRE || "24h",
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || "7d",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
    frontendUrl,
    adminEmail,
    adminPassword,
  };
}

let configInstance: Config | null = null;

export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}
