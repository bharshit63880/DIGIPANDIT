const { StatusCodes } = require("http-status-codes");
const Booking = require("../models/Booking");
const StoreOrder = require("../models/StoreOrder");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { createGatewayOrder } = require("../services/paymentService");
const env = require("../config/env");

const getEntityModel = (entityType) => {
  if (entityType === "BOOKING") {
    return Booking;
  }

  if (entityType === "STORE_ORDER") {
    return StoreOrder;
  }

  return null;
};

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.validated.body;
  const Model = getEntityModel(entityType);
  const entity = await Model.findById(entityId);

  if (!entity) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payable entity not found");
  }

  const order = await createGatewayOrder({
    amount: entity.payment.amount,
    receipt: `${entityType.toLowerCase()}_${entity._id.toString().slice(-8)}`,
    notes: {
      entityType,
      entityId: entity._id.toString(),
    },
  });

  entity.payment.gatewayOrderId = order.id;
  await entity.save();

  res.json({
    success: true,
    message: "Payment order created",
    data: {
      ...order,
      keyId: env.razorpayKeyId || null,
    },
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { entityType, entityId, razorpayPaymentId, razorpayOrderId } = req.validated.body;
  const Model = getEntityModel(entityType);
  const entity = await Model.findById(entityId);

  if (!entity) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payable entity not found");
  }

  if (entity.payment.gatewayOrderId !== razorpayOrderId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Payment order mismatch");
  }

  entity.payment.status = "PAID";
  entity.payment.gatewayPaymentId = razorpayPaymentId;
  entity.payment.paidAt = new Date();

  if (entityType === "STORE_ORDER") {
    entity.orderStatus = "PROCESSING";
  }

  await entity.save();

  res.json({
    success: true,
    message: "Payment verified successfully",
    data: entity,
  });
});

module.exports = { createPaymentOrder, verifyPayment };
