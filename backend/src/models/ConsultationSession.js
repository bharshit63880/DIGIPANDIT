const mongoose = require("mongoose");

const consultationSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    panditProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PanditProfile",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ["CHAT", "AUDIO", "VIDEO"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ENDED", "AUTO_ENDED"],
      default: "ACTIVE",
    },
    pricePerMinute: {
      type: Number,
      required: true,
      min: 0,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    expectedAutoEndAt: {
      type: Date,
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    billedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    billedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    walletBalanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    walletBalanceAfter: {
      type: Number,
      default: null,
      min: 0,
    },
    endedBy: {
      type: String,
      enum: ["USER", "SYSTEM", "ADMIN"],
      default: null,
    },
  },
  { timestamps: true }
);

consultationSessionSchema.index({ user: 1, status: 1, createdAt: -1 });
consultationSessionSchema.index({ astrologer: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("ConsultationSession", consultationSessionSchema);
