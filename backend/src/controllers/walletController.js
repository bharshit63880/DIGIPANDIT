const WalletTransaction = require("../models/WalletTransaction");
const WalletTopup = require("../models/WalletTopup");
const asyncHandler = require("../utils/asyncHandler");

const getWallet = asyncHandler(async (req, res) => {
  const transactions = await WalletTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);

  res.json({
    success: true,
    data: {
      wallet: req.user.wallet || { balance: 0, currency: "INR" },
      transactions,
    },
  });
});

const addMoney = asyncHandler(async (req, res) => {
  const { amount } = req.validated.body;
  const topup = await WalletTopup.create({
    user: req.user._id,
    amount,
    currency: req.user.wallet?.currency || "INR",
  });

  res.json({
    success: true,
    message: "Wallet topup request created",
    data: {
      topup,
    },
  });
});

module.exports = {
  getWallet,
  addMoney,
};
