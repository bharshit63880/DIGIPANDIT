const { StatusCodes } = require("http-status-codes");
const Booking = require("../models/Booking");
const StoreOrder = require("../models/StoreOrder");
const User = require("../models/User");
const WalletTopup = require("../models/WalletTopup");
const WalletTransaction = require("../models/WalletTransaction");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { buildPayURequest, verifyPayUResponseHash } = require("../services/paymentService");
const env = require("../config/env");

function roundCurrency(value) {
  return Number(value.toFixed(2));
}

function getEntityModel(entityType) {
  if (entityType === "BOOKING") {
    return Booking;
  }

  if (entityType === "STORE_ORDER") {
    return StoreOrder;
  }

  if (entityType === "WALLET_TOPUP") {
    return WalletTopup;
  }

  return null;
}

function assertEntityOwnership(req, entity) {
  if (req.user.role === "ADMIN") {
    return;
  }

  if (!entity.user || entity.user.toString() !== req.user._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot access payment for this item");
  }
}

function getEntityAmount(entityType, entity) {
  return entityType === "WALLET_TOPUP" ? entity.amount : entity.payment.amount;
}

function getEntityTitle(entityType, entity) {
  if (entityType === "BOOKING") {
    return entity.serviceName;
  }

  if (entityType === "STORE_ORDER") {
    return "DigiPandit Store Order";
  }

  return "Wallet Top Up";
}

function buildFrontendStatusUrl({ status, entityType, entityId, title, amount, message }) {
  const params = new URLSearchParams({
    status,
    entityType,
    entityId,
    title,
    amount: String(amount),
    message,
  });

  return `${env.clientUrl.replace(/\/$/, "")}/payment-status?${params.toString()}`;
}

async function creditWalletTopup(topup, payload) {
  if (topup.status === "PAID") {
    return;
  }

  topup.status = "PAID";
  topup.payment = {
    ...(topup.payment || {}),
    gatewayOrderId: payload.txnid,
    gatewayPaymentId: payload.mihpayid,
    gatewaySignature: payload.hash,
    failureReason: "",
    paidAt: new Date(),
  };
  await topup.save();

  const user = await User.findById(topup.user);
  user.wallet.balance = roundCurrency((user.wallet?.balance || 0) + topup.amount);
  user.wallet.lastRechargedAt = new Date();
  await user.save();

  await WalletTransaction.create({
    user: user._id,
    type: "CREDIT",
    amount: topup.amount,
    balanceAfter: user.wallet.balance,
    description: "Wallet top up via PayU",
    referenceType: "WALLET_TOPUP",
    referenceId: topup._id,
    metadata: {
      gatewayOrderId: payload.txnid,
      gatewayPaymentId: payload.mihpayid,
    },
  });
}

async function markEntityFailed(entityType, entity, payload, reason) {
  if (entityType === "WALLET_TOPUP") {
    if (entity.status === "PAID") {
      return;
    }

    entity.status = "FAILED";
    entity.payment = {
      ...(entity.payment || {}),
      gatewayOrderId: payload?.txnid || entity.payment?.gatewayOrderId || "",
      gatewayPaymentId: payload?.mihpayid || "",
      failureReason: reason,
    };
    await entity.save();
    return;
  }

  if (entity.payment?.status === "PAID") {
    return;
  }

  entity.payment.status = "FAILED";
  entity.payment.gatewayOrderId = payload?.txnid || entity.payment?.gatewayOrderId || "";
  entity.payment.gatewayPaymentId = payload?.mihpayid || "";
  entity.payment.failureReason = reason;
  await entity.save();
}

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.validated.body;
  const Model = getEntityModel(entityType);

  if (!Model) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Unsupported payable entity");
  }

  const entity = await Model.findById(entityId);
  if (!entity) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payable item not found");
  }

  assertEntityOwnership(req, entity);

  if (
    (entityType === "WALLET_TOPUP" && entity.status === "PAID") ||
    (entityType !== "WALLET_TOPUP" && entity.payment?.status === "PAID")
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Payment is already completed for this item");
  }

  const txnid = `${entityType.toLowerCase()}_${entity._id.toString()}_${Date.now()}`.slice(0, 48);
  const paymentRequest = buildPayURequest({
    txnid,
    amount: getEntityAmount(entityType, entity),
    productinfo: getEntityTitle(entityType, entity),
    firstname: req.user.name || "DigiPandit User",
    email: req.user.email || "customer@digipandit.local",
    phone: req.user.phone || "",
    surl: `${req.protocol}://${req.get("host")}/api/payments/payu/callback`,
    furl: `${req.protocol}://${req.get("host")}/api/payments/payu/callback`,
    udf1: entityType,
    udf2: entity._id.toString(),
  });

  if (entityType === "WALLET_TOPUP") {
    entity.payment = {
      ...(entity.payment || {}),
      gatewayOrderId: txnid,
      failureReason: "",
    };
  } else {
    entity.payment.gatewayOrderId = txnid;
    entity.payment.failureReason = "";
  }

  await entity.save();

  res.json({
    success: true,
    message: "PayU session created successfully",
    data: paymentRequest,
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  res.status(StatusCodes.GONE).json({
    success: false,
    message: "Direct verification is no longer used. Payments are finalized through the PayU callback flow.",
  });
});

const failPayment = asyncHandler(async (req, res) => {
  res.status(StatusCodes.GONE).json({
    success: false,
    message: "Manual failure endpoint is no longer used. Payments are finalized through the PayU callback flow.",
  });
});

const payuCallback = asyncHandler(async (req, res) => {
  const payload = req.body;
  const entityType = payload.udf1;
  const entityId = payload.udf2;
  const title = payload.productinfo || "DigiPandit Payment";
  const amount = Number(payload.amount || 0);

  try {
    verifyPayUResponseHash(payload);

    const Model = getEntityModel(entityType);
    if (!Model) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Unsupported payable entity");
    }

    const entity = await Model.findById(entityId);
    if (!entity) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payable item not found");
    }

    const isSuccess = String(payload.status || "").toLowerCase() === "success";

    if (isSuccess) {
      if (entityType === "WALLET_TOPUP") {
        await creditWalletTopup(entity, payload);
      } else if (entity.payment?.status !== "PAID") {
        entity.payment.status = "PAID";
        entity.payment.gatewayOrderId = payload.txnid;
        entity.payment.gatewayPaymentId = payload.mihpayid;
        entity.payment.failureReason = "";
        entity.payment.paidAt = new Date();

        if (entityType === "STORE_ORDER") {
          entity.orderStatus = "PROCESSING";
        }

        await entity.save();
      }

      return res.redirect(
        302,
        buildFrontendStatusUrl({
          status: "success",
          entityType,
          entityId,
          title,
          amount,
          message: "Payment completed successfully.",
        })
      );
    }

    const failureReason = payload.error_Message || payload.unmappedstatus || "Payment was not completed.";
    await markEntityFailed(entityType, entity, payload, failureReason);

    return res.redirect(
      302,
      buildFrontendStatusUrl({
        status: "failed",
        entityType,
        entityId,
        title,
        amount,
        message: failureReason,
      })
    );
  } catch (error) {
    return res.redirect(
      302,
      buildFrontendStatusUrl({
        status: "failed",
        entityType: entityType || "UNKNOWN",
        entityId: entityId || "UNKNOWN",
        title,
        amount,
        message: error.message || "Payment verification failed.",
      })
    );
  }
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  failPayment,
  payuCallback,
};
