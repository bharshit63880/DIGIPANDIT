const express = require("express");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

router.post("/image", protect, upload.single("image"), uploadController.uploadSingleImage);

module.exports = router;
