const asyncHandler = require("../utils/asyncHandler");
const { uploadImage, uploadAudio } = require("../services/uploadService");

const uploadSingleImage = asyncHandler(async (req, res) => {
  const uploaded = await uploadImage(req.file, "digipandit/uploads");

  res.json({
    success: true,
    message: "Image uploaded successfully",
    data: uploaded,
  });
});

const uploadSingleAudio = asyncHandler(async (req, res) => {
  const uploaded = await uploadAudio(req.file);
  res.json({ success: true, message: "Mantra audio uploaded successfully", data: uploaded });
});

module.exports = { uploadSingleImage, uploadSingleAudio };
