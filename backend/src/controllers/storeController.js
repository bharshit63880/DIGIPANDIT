const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const StoreOrder = require("../models/StoreOrder");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const pickPagination = require("../utils/pickPagination");
const buildPagedResponse = require("../utils/buildPagedResponse");

const createStoreOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.validated.body;
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

  if (products.length !== items.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "One or more products are unavailable");
  }

  const orderItems = items.map((item) => {
    const product = products.find((entry) => entry._id.toString() === item.productId);

    if (!product || product.stock < item.quantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Insufficient stock for ${product?.name || "a product"}`);
    }

    return {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0]?.url || "",
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 999 ? 0 : 79;
  const total = subtotal + shippingFee;

  const order = await StoreOrder.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    pricing: { subtotal, shippingFee, total },
    payment: {
      amount: total,
      status: "CREATED",
    },
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Store order created successfully",
    data: order,
  });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pickPagination(req.query);
  const [docs, total] = await Promise.all([
    StoreOrder.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    StoreOrder.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    ...buildPagedResponse({ docs, total, page, limit }),
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await StoreOrder.findById(req.params.orderId).populate("user", "name email");

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "ADMIN") {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot view this order");
  }

  res.json({
    success: true,
    data: order,
  });
});

module.exports = {
  createStoreOrder,
  listMyOrders,
  getOrderById,
};
