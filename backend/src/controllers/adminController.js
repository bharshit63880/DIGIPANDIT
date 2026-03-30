const { StatusCodes } = require("http-status-codes");
const Booking = require("../models/Booking");
const PanditProfile = require("../models/PanditProfile");
const Product = require("../models/Product");
const StoreOrder = require("../models/StoreOrder");
const User = require("../models/User");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const { ROLES } = require("../constants/roles");
const { BOOKING_STATUS } = require("../constants/booking");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const pickPagination = require("../utils/pickPagination");
const buildPagedResponse = require("../utils/buildPagedResponse");

const makeSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalPandits, totalBookings, totalProducts, bookingRevenueRows, latestOrders] =
    await Promise.all([
      User.countDocuments({ role: "USER" }),
      User.countDocuments({ role: "PANDIT" }),
      Booking.countDocuments(),
      Product.countDocuments(),
      Booking.aggregate([
        { $match: { "payment.status": "PAID" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$payment.amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      StoreOrder.find().sort({ createdAt: -1 }).limit(5).populate("user", "name"),
    ]);

  const storeRevenueRows = await StoreOrder.aggregate([
    { $match: { "payment.status": "PAID" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$payment.amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalPandits,
      totalBookings,
      totalProducts,
      bookingRevenueByMonth: bookingRevenueRows,
      storeRevenueByMonth: storeRevenueRows,
      latestOrders,
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pickPagination(req.query);
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [docs, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    ...buildPagedResponse({ docs, total, page, limit }),
  });
});

const listPanditApprovals = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.approvalStatus = req.query.status;
  }

  const profiles = await PanditProfile.find(filter)
    .populate("user", "name email phone city state avatar")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: profiles,
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, city, state, isActive = true } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "name, email, password, and role are required");
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role");
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });

  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    city,
    state,
    isActive,
    emailVerified: true,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User created successfully",
    data: user.toJSON(),
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, city, state, role, isActive } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });

    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "Another user already uses this email");
    }
  }

  if (role && !Object.values(ROLES).includes(role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role");
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (city !== undefined) user.city = city;
  if (state !== undefined) user.state = state;
  if (role !== undefined) user.role = role;
  if (typeof isActive === "boolean") user.isActive = isActive;

  await user.save();

  res.json({
    success: true,
    message: "User updated successfully",
    data: user.toJSON(),
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (String(user._id) === String(req.user._id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Admin cannot deactivate own account");
  }

  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: "User deactivated successfully",
    data: user.toJSON(),
  });
});

const listProductsAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
  });
});

const createProductAdmin = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    category,
    description,
    price,
    compareAtPrice,
    stock,
    tags = [],
    isActive = true,
  } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "name, category, price, and stock are required");
  }

  const nextSlug = slug?.trim() || makeSlug(name);
  const existing = await Product.findOne({ slug: nextSlug });

  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "Product slug already exists");
  }

  const product = await Product.create({
    name,
    slug: nextSlug,
    category,
    description,
    price,
    compareAtPrice,
    stock,
    tags,
    isActive,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const updateProductAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  const nextSlug = req.body.slug?.trim() || (req.body.name ? makeSlug(req.body.name) : product.slug);

  if (nextSlug !== product.slug) {
    const existing = await Product.findOne({ slug: nextSlug, _id: { $ne: product._id } });

    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "Product slug already exists");
    }
  }

  Object.assign(product, req.body, { slug: nextSlug });
  await product.save();

  res.json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

const deleteProductAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.productId,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  res.json({
    success: true,
    message: "Product archived successfully",
    data: product,
  });
});

const updatePanditApproval = asyncHandler(async (req, res) => {
  const { status, approvalNotes } = req.body;

  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid approval status");
  }

  const profile = await PanditProfile.findByIdAndUpdate(
    req.params.panditId,
    { approvalStatus: status, approvalNotes },
    { new: true }
  ).populate("user", "name email phone");

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pandit profile not found");
  }

  res.json({
    success: true,
    message: "Pandit approval updated successfully",
    data: profile,
  });
});

const listBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pickPagination(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [docs, total] = await Promise.all([
    Booking.find(filter)
      .populate("user", "name")
      .populate("pandit", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  res.json({
    success: true,
    ...buildPagedResponse({ docs, total, page, limit }),
  });
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  if (req.body.status && !Object.values(BOOKING_STATUS).includes(req.body.status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid booking status");
  }

  if (req.body.status) booking.status = req.body.status;
  if (req.body.scheduleAt) booking.scheduleAt = req.body.scheduleAt;
  if (req.body.meetingMode) booking.meetingMode = req.body.meetingMode;
  if (req.body.notes !== undefined) booking.notes = req.body.notes;

  await booking.save();

  res.json({
    success: true,
    message: "Booking updated successfully",
    data: booking,
  });
});

const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.bookingId);

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  res.json({
    success: true,
    message: "Booking deleted successfully",
  });
});

const listStoreOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pickPagination(req.query);
  const [docs, total] = await Promise.all([
    StoreOrder.find().populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
    StoreOrder.countDocuments(),
  ]);

  res.json({
    success: true,
    ...buildPagedResponse({ docs, total, page, limit }),
  });
});

const updateStoreOrderStatus = asyncHandler(async (req, res) => {
  const order = await StoreOrder.findById(req.params.orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  order.orderStatus = req.body.orderStatus;
  await order.save();

  res.json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

const deleteStoreOrder = asyncHandler(async (req, res) => {
  const order = await StoreOrder.findByIdAndDelete(req.params.orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});

const listWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await WithdrawalRequest.find()
    .populate("pandit", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: withdrawals,
  });
});

const updateWithdrawalStatus = asyncHandler(async (req, res) => {
  const withdrawal = await WithdrawalRequest.findById(req.params.withdrawalId);

  if (!withdrawal) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Withdrawal request not found");
  }

  withdrawal.status = req.body.status;
  withdrawal.notes = req.body.notes;
  await withdrawal.save();

  res.json({
    success: true,
    message: "Withdrawal updated successfully",
    data: withdrawal,
  });
});

const deleteWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await WithdrawalRequest.findByIdAndDelete(req.params.withdrawalId);

  if (!withdrawal) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Withdrawal request not found");
  }

  res.json({
    success: true,
    message: "Withdrawal deleted successfully",
  });
});

module.exports = {
  getDashboardStats,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  listPanditApprovals,
  updatePanditApproval,
  listBookings,
  updateBooking,
  deleteBooking,
  listStoreOrders,
  updateStoreOrderStatus,
  deleteStoreOrder,
  listWithdrawals,
  updateWithdrawalStatus,
  deleteWithdrawal,
};
