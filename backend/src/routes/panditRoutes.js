const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const panditController = require("../controllers/panditController");
const { upsertPanditProfileSchema, withdrawalSchema } = require("../validators/panditValidators");

const router = express.Router();

router.get("/dashboard/me/profile", protect, authorize("PANDIT"), panditController.getMyPanditProfile);
router.patch("/dashboard/me/presence", protect, authorize("PANDIT"), panditController.updateMyPresence);
router.patch(
  "/dashboard/me/profile",
  protect,
  authorize("PANDIT"),
  upload.single("image"),
  validate(upsertPanditProfileSchema),
  panditController.upsertMyPanditProfile
);
router.get("/dashboard/me/bookings", protect, authorize("PANDIT"), panditController.getMyBookings);
router.get("/dashboard/me/earnings", protect, authorize("PANDIT"), panditController.getMyEarnings);
router.get("/dashboard/me/withdrawals", protect, authorize("PANDIT"), panditController.listMyWithdrawals);
router.post(
  "/dashboard/me/withdrawals",
  protect,
  authorize("PANDIT"),
  validate(withdrawalSchema),
  panditController.requestWithdrawal
);
router.get("/", panditController.listPandits);
router.get("/:panditId", panditController.getPanditById);

module.exports = router;
