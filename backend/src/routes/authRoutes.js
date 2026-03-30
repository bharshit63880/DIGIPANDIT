const express = require("express");
const validate = require("../middleware/validate");
const authController = require("../controllers/authController");
const {
  registerSchema,
  loginSchema,
  otpSchema,
  requestOtpSchema,
  resetPasswordSchema,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/verify-email/request", validate(requestOtpSchema), authController.requestEmailVerificationOtp);
router.post("/verify-email", validate(otpSchema), authController.verifyEmail);
router.post("/forgot-password", validate(requestOtpSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
