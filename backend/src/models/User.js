const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../constants/roles");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    avatar: {
      url: String,
      publicId: String,
    },
    gender: { type: String, trim: true },
    dateOfBirth: Date,
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    addresses: [addressSchema],
    emailVerified: { type: Boolean, default: false },
    emailVerificationOtp: { type: String, default: null },
    emailVerificationOtpExpiresAt: { type: Date, default: null },
    forgotPasswordOtp: { type: String, default: null },
    forgotPasswordOtpExpiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.emailVerificationOtp;
        delete ret.emailVerificationOtpExpiresAt;
        delete ret.forgotPasswordOtp;
        delete ret.forgotPasswordOtpExpiresAt;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
