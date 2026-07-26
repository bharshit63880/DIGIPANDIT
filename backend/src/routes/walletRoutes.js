const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const walletController = require("../controllers/walletController");
const { addMoneySchema } = require("../validators/walletValidators");

const router = express.Router();

router.get("/wallet", protect, walletController.getWallet);
router.post("/add-money", protect, validate(addMoneySchema), walletController.addMoney);

module.exports = router;
