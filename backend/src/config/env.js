const dotenv = require("dotenv");

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

function requiredInProduction(name, value) {
  if (isProduction && !value) {
    throw new Error(`${name} must be configured in production`);
  }

  return value;
}

const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/digipandit",
  corsOrigins: (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  jwtSecret: requiredInProduction("JWT_SECRET", process.env.JWT_SECRET) || "change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  emailFrom: process.env.EMAIL_FROM || "no-reply@digipandit.local",
  smtpHost: requiredInProduction("SMTP_HOST", process.env.SMTP_HOST) || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: requiredInProduction("SMTP_USER", process.env.SMTP_USER) || "",
  smtpPassword: requiredInProduction("SMTP_PASSWORD", process.env.SMTP_PASSWORD) || "",
  payuMerchantKey: process.env.PAYU_MERCHANT_KEY || "",
  payuMerchantSalt: process.env.PAYU_MERCHANT_SALT || "",
  payuBaseUrl: process.env.PAYU_BASE_URL || "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  adminName: process.env.ADMIN_NAME || "DigiPandit Admin",
  adminEmail: process.env.ADMIN_EMAIL || "admin@digipandit.com",
  adminPassword: requiredInProduction("ADMIN_PASSWORD", process.env.ADMIN_PASSWORD) || "Admin@12345",
};

if (isProduction && env.jwtSecret === "change_me") {
  throw new Error("JWT_SECRET must not use the development default in production");
}

module.exports = env;
