const Razorpay = require("razorpay");
const env = require("./env");

const razorpay =
  env.razorpayKeyId && env.razorpayKeySecret
    ? new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret,
      })
    : null;

module.exports = razorpay;
