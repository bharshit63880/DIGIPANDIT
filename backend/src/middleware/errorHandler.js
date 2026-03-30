const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");

module.exports = (error, req, res, next) => {
  let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = error.message || "Internal server error";
  let details = error.details || null;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation failed";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    message = "Duplicate value found";
    details = error.keyValue;
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};
