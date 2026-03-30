const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/digipandit",
  jwtSecret: process.env.JWT_SECRET || "change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  emailFrom: process.env.EMAIL_FROM || "no-reply@digipandit.local",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  adminName: process.env.ADMIN_NAME || "DigiPandit Admin",
  adminEmail: process.env.ADMIN_EMAIL || "admin@digipandit.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@12345",
};

module.exports = env;
