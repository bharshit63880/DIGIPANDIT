const { StatusCodes } = require("http-status-codes");
const ConsultationSession = require("../models/ConsultationSession");
const ChatRoom = require("../models/ChatRoom");
const PanditProfile = require("../models/PanditProfile");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateKundali } = require("../services/kundaliService");
const { generateKundaliInterpretation } = require("../services/interpretationService");

const ASTROLOGY_CATEGORY_TO_SESSION = {
  ASTROLOGY_CHAT: "CHAT",
  ASTROLOGY_CALL: "AUDIO",
  ASTROLOGY_VIDEO: "VIDEO",
};

const SESSION_TO_ASTROLOGY_CATEGORY = {
  CHAT: "ASTROLOGY_CHAT",
  AUDIO: "ASTROLOGY_CALL",
  VIDEO: "ASTROLOGY_VIDEO",
};

function roundCurrency(value) {
  return Number(value.toFixed(2));
}

function formatAstrologerProfile(profile) {
  const astrologyServices = (profile.services || [])
    .filter((service) => ["ASTROLOGY_CHAT", "ASTROLOGY_CALL", "ASTROLOGY_VIDEO"].includes(service.category) && service.isActive)
    .map((service) => ({
      serviceId: service._id,
      name: service.name,
      sessionType: ASTROLOGY_CATEGORY_TO_SESSION[service.category],
      pricePerMinute: service.price,
      durationInMinutes: service.durationInMinutes,
      description: service.description,
    }));

  return {
    _id: profile._id,
    name: profile.user?.name,
    avatar: profile.user?.avatar,
    bio: profile.bio,
    experienceInYears: profile.experienceInYears,
    specialization: profile.specialization || [],
    languages: profile.languages || [],
    ratingAverage: profile.ratingAverage,
    totalReviews: profile.totalReviews,
    isOnline: profile.isOnline,
    lastStatusUpdatedAt: profile.lastStatusUpdatedAt,
    astrologyServices,
    minPricePerMinute: astrologyServices.length
      ? Math.min(...astrologyServices.map((service) => service.pricePerMinute))
      : 0,
  };
}

const listAstrologers = asyncHandler(async (req, res) => {
  const { mode, onlineOnly, specialization, language } = req.validated?.query || req.query || {};
  const filter = {
    approvalStatus: "APPROVED",
    "services.category": {
      $in: mode ? [SESSION_TO_ASTROLOGY_CATEGORY[mode]] : ["ASTROLOGY_CHAT", "ASTROLOGY_CALL", "ASTROLOGY_VIDEO"],
    },
  };

  if (onlineOnly === "true") {
    filter.isOnline = true;
  }

  if (specialization) {
    filter.specialization = { $regex: specialization, $options: "i" };
  }

  if (language) {
    filter.languages = { $in: [new RegExp(language, "i")] };
  }

  const profiles = await PanditProfile.find(filter)
    .populate("user", "name avatar")
    .sort({ isOnline: -1, ratingAverage: -1, totalReviews: -1, createdAt: -1 });

  const astrologers = profiles
    .map(formatAstrologerProfile)
    .filter((profile) => profile.astrologyServices.length > 0);

  res.json({
    success: true,
    data: astrologers,
  });
});

const startSession = asyncHandler(async (req, res) => {
  const { astrologerProfileId, serviceId, sessionType } = req.validated.body;
  const user = await User.findById(req.user._id);
  const activeSession = await ConsultationSession.findOne({
    user: req.user._id,
    status: "ACTIVE",
  });

  if (activeSession) {
    throw new ApiError(StatusCodes.CONFLICT, "Please end your current astrology session first");
  }

  const profile = await PanditProfile.findById(astrologerProfileId).populate("user", "name");
  if (!profile || profile.approvalStatus !== "APPROVED") {
    throw new ApiError(StatusCodes.NOT_FOUND, "Astrologer profile not found");
  }

  const service = profile.services.id(serviceId);
  if (!service || !service.isActive) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Selected consultation service not found");
  }

  if (service.category !== SESSION_TO_ASTROLOGY_CATEGORY[sessionType]) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Selected service does not match the requested consultation type");
  }

  const walletBalance = user.wallet?.balance || 0;
  if (walletBalance <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Please add money to your wallet before starting a consultation");
  }

  const now = new Date();
  const maxDurationSeconds = service.price > 0 ? Math.floor((walletBalance / service.price) * 60) : 0;
  if (service.price > 0 && maxDurationSeconds <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Wallet balance is too low for this consultation rate");
  }

  const session = await ConsultationSession.create({
    user: req.user._id,
    astrologer: profile.user._id,
    panditProfile: profile._id,
    serviceId: service._id,
    serviceName: service.name,
    sessionType,
    pricePerMinute: service.price,
    startedAt: now,
    expectedAutoEndAt: service.price > 0 ? new Date(now.getTime() + maxDurationSeconds * 1000) : null,
    walletBalanceBefore: walletBalance,
  });

  let chatRoom = null;
  if (sessionType === "CHAT") {
    chatRoom =
      (await ChatRoom.findOne({
        participants: { $all: [req.user._id, profile.user._id] },
      })) ||
      (await ChatRoom.create({
        participants: [req.user._id, profile.user._id],
      }));
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Consultation started successfully",
    data: {
      session,
      astrologer: {
        _id: profile._id,
        name: profile.user?.name,
        isOnline: profile.isOnline,
      },
      wallet: user.wallet,
      estimatedMaxDurationSeconds: maxDurationSeconds,
      chatRoomId: chatRoom?._id || null,
    },
  });
});

const endSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.validated.body;
  const session = await ConsultationSession.findById(sessionId);

  if (!session) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Consultation session not found");
  }

  if (session.user.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot end this consultation session");
  }

  if (session.status !== "ACTIVE") {
    return res.json({
      success: true,
      message: "Consultation session already ended",
      data: session,
    });
  }

  const user = await User.findById(session.user);
  const now = new Date();
  const effectiveEndAt =
    session.expectedAutoEndAt && now > session.expectedAutoEndAt ? session.expectedAutoEndAt : now;
  const durationSeconds = Math.max(0, Math.round((effectiveEndAt - session.startedAt) / 1000));
  const billedMinutes = roundCurrency(durationSeconds / 60);
  const calculatedAmount = roundCurrency(session.pricePerMinute * billedMinutes);
  const chargeAmount = Math.min(user.wallet?.balance || 0, calculatedAmount);

  user.wallet.balance = roundCurrency((user.wallet?.balance || 0) - chargeAmount);
  await user.save();

  if (chargeAmount > 0) {
    await WalletTransaction.create({
      user: user._id,
      type: "DEBIT",
      amount: chargeAmount,
      balanceAfter: user.wallet.balance,
      description: `${session.sessionType} consultation with astrologer`,
      referenceType: "CONSULTATION",
      referenceId: session._id,
      metadata: {
        astrologer: session.astrologer,
        durationSeconds,
        billedMinutes,
      },
    });

    await PanditProfile.findByIdAndUpdate(session.panditProfile, {
      $inc: {
        totalEarnings: chargeAmount,
      },
    });
  }

  session.status = session.expectedAutoEndAt && now > session.expectedAutoEndAt ? "AUTO_ENDED" : "ENDED";
  session.endedBy = session.status === "AUTO_ENDED" ? "SYSTEM" : req.user.role === "ADMIN" ? "ADMIN" : "USER";
  session.endedAt = effectiveEndAt;
  session.durationSeconds = durationSeconds;
  session.billedMinutes = billedMinutes;
  session.billedAmount = chargeAmount;
  session.walletBalanceAfter = user.wallet.balance;
  await session.save();

  res.json({
    success: true,
    message: "Consultation ended successfully",
    data: {
      session,
      wallet: user.wallet,
    },
  });
});

const createKundali = asyncHandler(async (req, res) => {
  const input = req.validated?.body || req.body;
  const kundali = generateKundali(input);
  const interpretation = generateKundaliInterpretation(kundali);

  res.json({
    success: true,
    data: {
      kundali,
      interpretation,
    },
  });
});

module.exports = {
  listAstrologers,
  startSession,
  endSession,
  createKundali,
};
