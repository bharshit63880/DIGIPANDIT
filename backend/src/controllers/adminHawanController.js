const { StatusCodes } = require("http-status-codes");
const Hawan = require("../models/Hawan");
const HawanProgress = require("../models/HawanProgress");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const items = await Hawan.find({}).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, data: items });
});
const create = asyncHandler(async (req, res) => {
  const hawan = await Hawan.create({ ...req.validated.body, createdBy: req.user._id, updatedBy: req.user._id });
  res.status(StatusCodes.CREATED).json({ success: true, message: "Hawan guide created", data: hawan });
});
const update = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findByIdAndUpdate(req.validated.params.hawanId, { ...req.validated.body, updatedBy: req.user._id }, { new: true, runValidators: true });
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  res.json({ success: true, message: "Hawan guide updated", data: hawan });
});
const archive = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findByIdAndUpdate(req.validated.params.hawanId, { isArchived: true, isPublished: false, updatedBy: req.user._id }, { new: true });
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  res.json({ success: true, message: "Hawan guide archived", data: hawan });
});
const publish = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findById(req.validated.params.hawanId);
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  if (!hawan.isPublished && hawan.verificationStatus !== "VERIFIED") throw new ApiError(StatusCodes.BAD_REQUEST, "Guide must be verified before publication");
  hawan.isPublished = !hawan.isPublished;
  hawan.isArchived = false;
  hawan.updatedBy = req.user._id;
  await hawan.save();
  res.json({ success: true, message: hawan.isPublished ? "Hawan guide published" : "Hawan guide unpublished", data: hawan });
});
const review = asyncHandler(async (req, res) => {
  const { verificationStatus, reviewNote } = req.validated.body;
  const hawan = await Hawan.findById(req.validated.params.hawanId);
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  hawan.verificationStatus = verificationStatus;
  hawan.reviewNote = reviewNote;
  hawan.verifiedBy = verificationStatus === "VERIFIED" ? req.user._id : null;
  hawan.verifiedAt = verificationStatus === "VERIFIED" ? new Date() : null;
  if (verificationStatus !== "VERIFIED") hawan.isPublished = false;
  hawan.updatedBy = req.user._id;
  await hawan.save();
  res.json({ success: true, message: "Hawan review status updated", data: hawan });
});
const duplicate = asyncHandler(async (req, res) => {
  const source = await Hawan.findById(req.validated.params.hawanId).lean();
  if (!source) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  delete source._id;
  delete source.createdAt;
  delete source.updatedAt;
  const suffix = Date.now().toString().slice(-6);
  const copy = await Hawan.create({ ...source, title: `${source.title} Copy`, slug: `${source.slug}-copy-${suffix}`, isPublished: false, isArchived: false, createdBy: req.user._id, updatedBy: req.user._id });
  res.status(StatusCodes.CREATED).json({ success: true, message: "Hawan guide duplicated", data: copy });
});

module.exports = { list, create, update, archive, publish, review, duplicate };
