const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

function hasUsablePayUCredentials() {
  const key = env.payuMerchantKey || "";
  const salt = env.payuMerchantSalt || "";

  if (!key || !salt) {
    return false;
  }

  if (key.includes("your_") || salt.includes("your_") || key.includes("placeholder") || salt.includes("placeholder")) {
    return false;
  }

  return true;
}

function sha512(value) {
  return crypto.createHash("sha512").update(value).digest("hex");
}

function formatAmount(amount) {
  return Number(amount || 0).toFixed(2);
}

function buildPayUHash(fields) {
  const hashString = [
    fields.key,
    fields.txnid,
    fields.amount,
    fields.productinfo,
    fields.firstname,
    fields.email,
    fields.udf1 || "",
    fields.udf2 || "",
    fields.udf3 || "",
    fields.udf4 || "",
    fields.udf5 || "",
    "",
    "",
    "",
    "",
    "",
    env.payuMerchantSalt,
  ].join("|");

  return sha512(hashString);
}

function buildPayURequest({ txnid, amount, productinfo, firstname, email, phone, surl, furl, udf1, udf2, udf3, udf4, udf5 }) {
  if (!hasUsablePayUCredentials()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "PayU credentials are missing or invalid. Configure PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in backend/.env."
    );
  }

  const baseUrl = (env.payuBaseUrl || "https://test.payu.in").replace(/\/$/, "");
  const normalizedAction = baseUrl.startsWith("http") ? `${baseUrl}/_payment` : `https://${baseUrl}/_payment`;

  const fields = {
    key: env.payuMerchantKey,
    txnid,
    amount: formatAmount(amount),
    productinfo,
    firstname,
    email,
    phone: phone || "",
    surl,
    furl,
    udf1: udf1 || "",
    udf2: udf2 || "",
    udf3: udf3 || "",
    udf4: udf4 || "",
    udf5: udf5 || "",
    service_provider: "payu_paisa",
  };

  return {
    provider: "PAYU",
    action: normalizedAction,
    method: "POST",
    fields: {
      ...fields,
      hash: buildPayUHash(fields),
    },
  };
}

function verifyPayUResponseHash(payload) {
  if (!hasUsablePayUCredentials()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "PayU credentials are missing or invalid. Configure PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in backend/.env."
    );
  }

  const reverseSequence = [
    env.payuMerchantSalt,
    payload.status || "",
    "",
    "",
    "",
    "",
    "",
    payload.udf5 || "",
    payload.udf4 || "",
    payload.udf3 || "",
    payload.udf2 || "",
    payload.udf1 || "",
    payload.email || "",
    payload.firstname || "",
    payload.productinfo || "",
    payload.amount || "",
    payload.txnid || "",
    payload.key || "",
  ];

  const prefix = payload.additionalCharges || payload.additional_charges;
  const reverseHash = sha512(prefix ? `${prefix}|${reverseSequence.join("|")}` : reverseSequence.join("|"));

  if (reverseHash !== payload.hash) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid PayU response signature");
  }

  return true;
}

module.exports = {
  buildPayURequest,
  verifyPayUResponseHash,
};
