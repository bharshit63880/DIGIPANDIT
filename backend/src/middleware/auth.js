const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/jwt");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "User not found or inactive"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "You are not allowed to access this resource"));
  }

  next();
};

module.exports = { protect, authorize };
