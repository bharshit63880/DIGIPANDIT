const { StatusCodes } = require("http-status-codes");
const Booking = require("../models/Booking");
const PanditProfile = require("../models/PanditProfile");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const pickPagination = require("../utils/pickPagination");
const buildPagedResponse = require("../utils/buildPagedResponse");
const { uploadImage } = require("../services/uploadService");

const listPandits = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pickPagination(req.query);
  const { city, pujaType, rating, category } = req.query;

  const filter = { approvalStatus: "APPROVED" };

  if (city) {
    filter.serviceCities = { $in: [city] };
  }

  if (rating) {
    filter.ratingAverage = { $gte: Number(rating) };
  }

  if (pujaType) {
    filter["services.name"] = { $regex: pujaType, $options: "i" };
  }

  if (category) {
    filter["services.category"] = category;
  }

  const [docs, total] = await Promise.all([
    PanditProfile.find(filter)
      .populate("user", "name email phone city state avatar")
      .sort({ ratingAverage: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PanditProfile.countDocuments(filter),
  ]);

  res.json({
    success: true,
    ...buildPagedResponse({ docs, total, page, limit }),
  });
});

const getPanditById = asyncHandler(async (req, res) => {
  const profile = await PanditProfile.findById(req.params.panditId).populate(
    "user",
    "name email phone city state avatar"
  );

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pandit profile not found");
  }

  res.json({
    success: true,
    data: profile,
  });
});

const getMyPanditProfile = asyncHandler(async (req, res) => {
  let profile = await PanditProfile.findOne({ user: req.user._id }).populate(
    "user",
    "name email phone city state avatar"
  );

  if (!profile) {
    profile = await PanditProfile.create({ user: req.user._id });
    profile = await profile.populate("user", "name email phone city state avatar");
  }

  res.json({
    success: true,
    data: profile,
  });
});

const upsertMyPanditProfile = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const uploaded = req.file ? await uploadImage(req.file, "digipandit/pandits") : null;
  const update = {
    ...payload,
    profileCompleted: true,
  };

  if (Object.prototype.hasOwnProperty.call(payload, "isOnline")) {
    update.lastStatusUpdatedAt = new Date();
  }

  if (uploaded) {
    update.image = uploaded;
  }

  const profile = await PanditProfile.findOneAndUpdate(
    { user: req.user._id },
    update,
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).populate("user", "name email phone city state avatar");

  res.json({
    success: true,
    message: "Pandit profile saved successfully",
    data: profile,
  });
});

const updateMyPresence = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;

  if (typeof isOnline !== "boolean") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "isOnline must be a boolean value");
  }

  const profile = await PanditProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      isOnline,
      lastStatusUpdatedAt: new Date(),
    },
    { new: true }
  ).populate("user", "name email phone city state avatar");

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pandit profile not found");
  }

  res.json({
    success: true,
    message: `Presence updated to ${isOnline ? "online" : "offline"}`,
    data: profile,
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pickPagination(req.query);
  const filter = { pandit: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [docs, total] = await Promise.all([
    Booking.find(filter)
      .populate("user", "name email phone")
      .sort({ scheduleAt: 1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  res.json({
    success: true,
    ...buildPagedResponse({ docs, total, page, limit }),
  });
});

const getMyEarnings = asyncHandler(async (req, res) => {
  const [bookingStats, withdrawals] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          pandit: req.user._id,
          status: "COMPLETED",
          "payment.status": "PAID",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$payment.amount" },
          totalBookings: { $sum: 1 },
        },
      },
    ]),
    WithdrawalRequest.find({ pandit: req.user._id }).sort({ createdAt: -1 }).limit(10),
  ]);

  const stats = bookingStats[0] || { totalEarnings: 0, totalBookings: 0 };

  res.json({
    success: true,
    data: {
      totalEarnings: stats.totalEarnings,
      totalBookings: stats.totalBookings,
      withdrawals,
    },
  });
});

const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, accountDetails } = req.validated.body;
  const profile = await PanditProfile.findOne({ user: req.user._id });

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pandit profile not found");
  }

  const pendingRequests = await WithdrawalRequest.aggregate([
    {
      $match: {
        pandit: req.user._id,
        status: "PENDING",
      },
    },
    {
      $group: {
        _id: null,
        amount: { $sum: "$amount" },
      },
    },
  ]);

  const reservedAmount = pendingRequests[0]?.amount || 0;
  const availableBalance = profile.totalEarnings - reservedAmount;

  if (amount > availableBalance) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Withdrawal amount exceeds available balance");
  }

  const request = await WithdrawalRequest.create({
    pandit: req.user._id,
    amount,
    accountDetails,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Withdrawal request submitted",
    data: request,
  });
});

const listMyWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await WithdrawalRequest.find({ pandit: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: withdrawals,
  });
});

module.exports = {
  listPandits,
  getPanditById,
  getMyPanditProfile,
  upsertMyPanditProfile,
  getMyBookings,
  getMyEarnings,
  requestWithdrawal,
  listMyWithdrawals,
  updateMyPresence,
};
