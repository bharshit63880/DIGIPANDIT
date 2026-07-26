const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImage } = require("../services/uploadService");

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  if (payload.dateOfBirth) {
    payload.dateOfBirth = new Date(payload.dateOfBirth);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const uploaded = await uploadImage(req.file, "digipandit/avatars");
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: uploaded }, { new: true }).select("-password");

  res.json({
    success: true,
    message: "Avatar uploaded successfully",
    data: user,
  });
});

module.exports = {
  getMe,
  updateMe,
  uploadAvatar,
};
