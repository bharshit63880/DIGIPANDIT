const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const { updateProfileSchema } = require("../validators/authValidators");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, userController.getMe);
router.patch("/me", protect, validate(updateProfileSchema), userController.updateMe);
router.post("/me/avatar", protect, upload.single("image"), userController.uploadAvatar);

module.exports = router;
