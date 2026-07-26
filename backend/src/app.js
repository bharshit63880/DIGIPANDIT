const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = new Set([
  ...env.corsOrigins,
  ...(!env.isProduction ? ["http://localhost:5173", "http://127.0.0.1:5173"] : []),
  `https://${process.env.VERCEL_URL || ""}`.replace(/\/$/, ""),
].filter(Boolean));

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps / curl
    const normalizedOrigin = origin.replace(/\/$/, "");
    const isLocalDevelopmentOrigin =
      !env.isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d{2,5}$/.test(normalizedOrigin);
    const ok = allowedOrigins.has(normalizedOrigin) || isLocalDevelopmentOrigin;
    return ok ? callback(null, true) : callback(new Error("Origin is not allowed by CORS"));
  },
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});

app.use("/api/auth", authRateLimit);

// Basic root responder so hitting "/" doesn't 404 on the API project
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "DigiPandit backend",
    health: "ok",
    docs: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DigiPandit API is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
