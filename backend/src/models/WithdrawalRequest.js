const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    pandit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PAID"],
      default: "PENDING",
    },
    notes: { type: String, trim: true },
    accountDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String,
    },
  },
  { timestamps: true }
);

withdrawalRequestSchema.index({ pandit: 1, createdAt: -1 });

module.exports = mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
