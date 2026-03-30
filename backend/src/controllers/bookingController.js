const { StatusCodes } = require("http-status-codes");
const Booking = require("../models/Booking");
const ChatRoom = require("../models/ChatRoom");
const PanditProfile = require("../models/PanditProfile");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const pickPagination = require("../utils/pickPagination");
const buildPagedResponse = require("../utils/buildPagedResponse");

const createBooking = asyncHandler(async (req, res) => {
  const { panditProfileId, serviceId, scheduleAt, address, notes, meetingMode } = req.validated.body;
  const profile = await PanditProfile.findById(panditProfileId).populate("user", "name");

  if (!profile || profile.approvalStatus !== "APPROVED") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Pandit profile is not available for booking");
  }

  const service = profile.services.id(serviceId);
  if (!service || !service.isActive) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Selected service not found");
  }

  const booking = await Booking.create({
    bookingType: service.category,
    user: req.user._id,
    pandit: profile.user._id,
    panditProfile: profile._id,
    serviceId: service._id,
    serviceName: service.name,
    servicePrice: service.price,
    scheduleAt: new Date(scheduleAt),
    durationInMinutes: service.durationInMinutes,
    address,
    notes,
    meetingMode: meetingMode || (service.category === "PUJA" ? "OFFLINE" : "ONLINE"),
    payment: {
      amount: service.price,
      status: "CREATED",
    },
  });

  await ChatRoom.create({
    booking: booking._id,
    participants: [req.user._id, profile.user._id],
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
});

const listMyBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pickPagination(req.query);
  const filter = { user: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [docs, total] = await Promise.all([
    Booking.find(filter)
      .populate("pandit", "name phone avatar")
      .populate("panditProfile", "ratingAverage image")
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

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate("user", "name email phone")
    .populate("pandit", "name email phone");

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  const isOwner =
    booking.user._id.toString() === req.user._id.toString() ||
    booking.pandit._id.toString() === req.user._id.toString() ||
    req.user.role === "ADMIN";

  if (!isOwner) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot view this booking");
  }

  res.json({
    success: true,
    data: booking,
  });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  const { status } = req.validated.body;
  const isPandit = booking.pandit.toString() === req.user._id.toString();
  const isUser = booking.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "ADMIN";

  if (!isAdmin && !isPandit && !isUser) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot update this booking");
  }

  if (status === "ACCEPTED" || status === "REJECTED" || status === "COMPLETED") {
    if (!isPandit && !isAdmin) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Only pandits or admins can set this booking status");
    }
  }

  if (status === "CANCELLED" && !isUser && !isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only users or admins can cancel this booking");
  }

  booking.status = status;
  await booking.save();

  if (status === "COMPLETED" && booking.payment.status === "PAID") {
    await PanditProfile.findOneAndUpdate(
      { user: booking.pandit },
      {
        $inc: {
          totalBookings: 1,
          totalEarnings: booking.payment.amount,
        },
      }
    );
  }

  res.json({
    success: true,
    message: "Booking updated successfully",
    data: booking,
  });
});

module.exports = {
  createBooking,
  listMyBookings,
  getBookingById,
  updateBookingStatus,
};
