const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["PUJA", "ASTROLOGY_CHAT", "ASTROLOGY_CALL", "ASTROLOGY_VIDEO"],
      default: "PUJA",
    },
    serviceType: {
      type: String,
      enum: ["PUJA", "HAWAN", "KATHA", "CONSULTATION"],
      default: "CONSULTATION",
    },
    description: { type: String, trim: true },
    durationInMinutes: { type: Number, default: 60, min: 15 },
    price: { type: Number, required: true, min: 0 },
    travelCharge: { type: Number, default: 0, min: 0 },
    samagriCost: { type: Number, default: 0, min: 0 },
    extraDakshina: { type: Number, default: 0, min: 0 },
    videoDakshinaFee: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: true }
);

const panditProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: { type: String, trim: true },
    experienceInYears: { type: Number, default: 0, min: 0 },
    specialization: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    serviceCities: [{ type: String, trim: true }],
    profileCompleted: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvalNotes: { type: String, trim: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    totalBookings: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    isOnline: { type: Boolean, default: false },
    lastStatusUpdatedAt: { type: Date, default: null },
    image: {
      url: String,
      publicId: String,
    },
    services: [serviceSchema],
    availability: [availabilitySlotSchema],
  },
  { timestamps: true }
);

panditProfileSchema.index({ approvalStatus: 1, serviceCities: 1, ratingAverage: -1 });

module.exports = mongoose.model("PanditProfile", panditProfileSchema);
