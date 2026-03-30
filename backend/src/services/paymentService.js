const { StatusCodes } = require("http-status-codes");
const dayjs = require("dayjs");
const razorpay = require("../config/razorpay");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

const hasUsableRazorpayCredentials = () => {
  if (!razorpay) {
    return false;
  }

  const keyId = env.razorpayKeyId || "";
  const secret = env.razorpayKeySecret || "";

  if (
    !keyId ||
    !secret ||
    keyId.includes("your_key") ||
    secret.includes("your_razorpay_secret") ||
    keyId.includes("placeholder") ||
    secret.includes("placeholder")
  ) {
    return false;
  }

  return true;
};

const buildMockOrder = ({ amount, receipt, notes = {} }) => ({
  id: `mock_order_${Date.now()}`,
  amount: amount * 100,
  currency: "INR",
  receipt,
  notes,
  mock: true,
  createdAt: dayjs().toISOString(),
});

const createGatewayOrder = async ({ amount, receipt, notes = {} }) => {
  if (!hasUsableRazorpayCredentials()) {
    return buildMockOrder({ amount, receipt, notes });
  }

  try {
    return await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt,
      notes,
    });
  } catch (error) {
    if (env.nodeEnv !== "production") {
      console.warn("Razorpay order creation failed, falling back to mock order:", error.message);
      return buildMockOrder({ amount, receipt, notes });
    }

    throw error;
  }
};

const assertPaymentCredentials = () => {
  if (!razorpay) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Razorpay credentials are missing. Configure them in backend/.env before live payments."
    );
  }
};

module.exports = { createGatewayOrder, assertPaymentCredentials };
