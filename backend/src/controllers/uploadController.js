const asyncHandler = require("../utils/asyncHandler");
const { uploadImage } = require("../services/uploadService");

const uploadSingleImage = asyncHandler(async (req, res) => {
  const uploaded = await uploadImage(req.file, "digipandit/uploads");

  res.json({
    success: true,
    message: "Image uploaded successfully",
    data: uploaded,
  });
});

module.exports = { uploadSingleImage };
