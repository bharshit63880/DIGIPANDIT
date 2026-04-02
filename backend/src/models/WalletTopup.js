const mongoose = require("mongoose");

const walletTopupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED"],
      default: "CREATED",
    },
    payment: {
      gatewayOrderId: String,
      gatewayPaymentId: String,
      gatewaySignature: String,
      failureReason: String,
      paidAt: Date,
    },
  },
  { timestamps: true }
);

walletTopupSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("WalletTopup", walletTopupSchema);
