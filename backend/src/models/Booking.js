const mongoose = require("mongoose");
const { BOOKING_TYPES, BOOKING_STATUS } = require("../constants/booking");

const bookingSchema = new mongoose.Schema(
  {
    bookingType: {
      type: String,
      enum: Object.values(BOOKING_TYPES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pandit: {
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
    serviceName: { type: String, required: true },
    servicePrice: { type: Number, required: true, min: 0 },
    pricingBreakdown: {
      basePrice: { type: Number, default: 0, min: 0 },
      travelCharge: { type: Number, default: 0, min: 0 },
      samagriCost: { type: Number, default: 0, min: 0 },
      extraDakshina: { type: Number, default: 0, min: 0 },
      videoDakshinaFee: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
    },
    scheduleAt: { type: Date, required: true },
    durationInMinutes: { type: Number, default: 60, min: 15 },
    address: {
      label: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
    notes: { type: String, trim: true },
    payment: {
      status: {
        type: String,
        enum: ["CREATED", "PAID", "FAILED", "REFUNDED"],
        default: "CREATED",
      },
      gatewayOrderId: String,
      gatewayPaymentId: String,
      failureReason: String,
      amount: { type: Number, required: true, min: 0 },
      paidAt: Date,
    },
    meetingMode: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "OFFLINE",
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConsultationSession",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.virtual("meetingRoomCode").get(function getMeetingRoomCode() {
  if (this.meetingMode !== "ONLINE" || !this._id) {
    return null;
  }

  return `digipandit-${this._id.toString()}`;
});

bookingSchema.virtual("meetingLink").get(function getMeetingLink() {
  if (!this.meetingRoomCode) {
    return null;
  }

  return `https://meet.jit.si/${this.meetingRoomCode}`;
});

bookingSchema.index({ user: 1, scheduleAt: -1 });
bookingSchema.index({ pandit: 1, scheduleAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
