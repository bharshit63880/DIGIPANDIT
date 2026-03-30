const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const pickPagination = require("../utils/pickPagination");
const buildPagedResponse = require("../utils/buildPagedResponse");
const { uploadImage } = require("../services/uploadService");

const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pickPagination(req.query);
  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: "i" };
  }

  if (req.user?.role !== "ADMIN") {
    filter.isActive = true;
  }

  const [docs, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    ...buildPagedResponse({ docs, total, page, limit }),
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  res.json({
    success: true,
    data: product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const image = req.file ? await uploadImage(req.file, "digipandit/products") : null;

  const product = await Product.create({
    ...payload,
    images: image ? [image] : [],
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const image = req.file ? await uploadImage(req.file, "digipandit/products") : null;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  Object.assign(product, payload);
  if (image) {
    product.images = [image, ...product.images.slice(0, 3)];
  }

  await product.save();

  res.json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
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

module.exports = {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
