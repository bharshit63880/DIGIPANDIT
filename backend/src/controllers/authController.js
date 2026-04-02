const { StatusCodes } = require("http-status-codes");
const dayjs = require("dayjs");
const User = require("../models/User");
const PanditProfile = require("../models/PanditProfile");
const { ROLES } = require("../constants/roles");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const generateOtp = require("../utils/generateOtp");
const { signToken } = require("../utils/jwt");
const { sendMockEmail } = require("../services/emailService");
const { otpEmail } = require("../utils/emailTemplates");

const formatAuthResponse = (user) => ({
  token: signToken({ userId: user._id, role: user.role }),
  user,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, city, state } = req.validated.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "Email is already registered");
  }

  const otp = generateOtp();
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || ROLES.USER,
    city,
    state,
    emailVerificationOtp: otp,
    emailVerificationOtpExpiresAt: dayjs().add(10, "minute").toDate(),
  });

  if (user.role === ROLES.PANDIT) {
    await PanditProfile.create({
      user: user._id,
      serviceCities: city ? [city] : [],
    });
  }

  await sendMockEmail({
    to: user.email,
    subject: "Verify your DigiPandit account",
    html: otpEmail({
      heading: "Verify your email",
      body: "Use the OTP below to verify your DigiPandit account and continue.",
      otp,
    }),
    meta: { type: "EMAIL_VERIFICATION" },
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Registration successful",
    data: formatAuthResponse(user.toJSON()),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  user.lastSeenAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: "Login successful",
    data: formatAuthResponse(user.toJSON()),
  });
});

const requestEmailVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const otp = generateOtp();
  user.emailVerificationOtp = otp;
  user.emailVerificationOtpExpiresAt = dayjs().add(10, "minute").toDate();
  await user.save();

  await sendMockEmail({
    to: user.email,
    subject: "DigiPandit email verification OTP",
    html: otpEmail({
      heading: "Email verification code",
      body: "Use this one-time code to verify your email for DigiPandit.",
      otp,
    }),
    meta: { type: "EMAIL_VERIFICATION" },
  });

  res.json({
    success: true,
    message: "Verification OTP sent",
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.validated.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (
    user.emailVerificationOtp !== otp ||
    !user.emailVerificationOtpExpiresAt ||
    user.emailVerificationOtpExpiresAt < new Date()
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP");
  }

  user.emailVerified = true;
  user.emailVerificationOtp = null;
  user.emailVerificationOtpExpiresAt = null;
  await user.save();

  res.json({
    success: true,
    message: "Email verified successfully",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const otp = generateOtp();
  user.forgotPasswordOtp = otp;
  user.forgotPasswordOtpExpiresAt = dayjs().add(10, "minute").toDate();
  await user.save();

  await sendMockEmail({
    to: user.email,
    subject: "DigiPandit password reset OTP",
    html: otpEmail({
      heading: "Password reset code",
      body: "Use this one-time code to reset your password for DigiPandit.",
      otp,
      actionLabel: "Enter this code on the reset password screen",
    }),
    meta: { type: "FORGOT_PASSWORD" },
  });

  res.json({
    success: true,
    message: "Password reset OTP sent",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.validated.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (
    user.forgotPasswordOtp !== otp ||
    !user.forgotPasswordOtpExpiresAt ||
    user.forgotPasswordOtpExpiresAt < new Date()
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP");
  }

  user.password = newPassword;
  user.forgotPasswordOtp = null;
  user.forgotPasswordOtpExpiresAt = null;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful",
  });
});

module.exports = {
  register,
  login,
  requestEmailVerificationOtp,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
