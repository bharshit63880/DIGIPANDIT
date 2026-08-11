const { StatusCodes } = require("http-status-codes");
const Hawan = require("../models/Hawan");
const HawanProgress = require("../models/HawanProgress");
const PanditProfile = require("../models/PanditProfile");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { buildMuhurat } = require("../services/muhuratService");
const { ensureHawanSeedData } = require("../seeders/seedHawans");

const publicFilter = { isPublished: true, isArchived: false, verificationStatus: "VERIFIED" };

const listHawans = asyncHandler(async (req, res) => {
  await ensureHawanSeedData();
  const { page, limit, category, purpose, difficulty, search, featured } = req.validated.query;
  const filter = { ...publicFilter };
  if (category) filter.category = category;
  if (purpose) filter.purposes = { $regex: escapeRegex(purpose), $options: "i" };
  if (difficulty) filter.difficulty = difficulty;
  if (featured) filter.isFeatured = featured === "true";
  if (search) {
    const term = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: term }, { shortDescription: term }, { purposes: term }, { tags: term }];
  }
  const [items, total] = await Promise.all([
    Hawan.find(filter)
      .select("-mantras -faqs -safetyInstructions")
      .sort({ isFeatured: -1, completionCount: -1, title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Hawan.countDocuments(filter),
  ]);
  const data = items.map(({ steps = [], materials = [], ...item }) => ({
    ...item,
    stepCount: steps.length,
    materialCount: materials.length,
  }));
  res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const getCategories = asyncHandler(async (_req, res) => {
  await ensureHawanSeedData();
  const rows = await Hawan.aggregate([
    { $match: publicFilter },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);
  res.json({ success: true, data: rows.map((row) => ({ category: row._id, count: row.count })) });
});

const getHawanBySlug = asyncHandler(async (req, res) => {
  await ensureHawanSeedData();
  const hawan = await Hawan.findOne({ slug: req.validated.params.slug, ...publicFilter })
    .populate("materials.product", "name slug price stock images category isActive")
    .populate("relatedProductIds", "name slug price stock images category isActive")
    .lean();
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  res.json({ success: true, data: hawan });
});

const recommendHawans = asyncHandler(async (req, res) => {
  await ensureHawanSeedData();
  const input = req.validated.body;
  const term = new RegExp(escapeRegex(input.purpose), "i");
  const candidates = await Hawan.find({
    ...publicFilter,
    $or: [{ purposes: term }, { category: input.grahDosh ? "GRAH_DOSH" : undefined }, { tags: term }, { title: term }].filter((entry) => Object.values(entry)[0] !== undefined),
  }).lean();
  const ranked = candidates
    .map((hawan) => {
      let score = 0;
      if (hawan.purposes.some((purpose) => term.test(purpose))) score += 5;
      if (input.timeMinutes && hawan.durationMinutes <= input.timeMinutes) score += 2;
      if (input.budget && hawan.estimatedCostRange.min <= input.budget) score += 2;
      if (input.difficulty && hawan.difficulty === input.difficulty) score += 2;
      if (input.needsPandit === hawan.panditRecommended) score += 1;
      return { ...hawan, recommendationScore: score, recommendationReason: `Commonly performed for ${hawan.purposes.slice(0, 2).join(" and ").toLowerCase()}.` };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore || b.completionCount - a.completionCount)
    .slice(0, 3);
  res.json({ success: true, data: ranked });
});

const getMaterials = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findOne({ _id: req.params.hawanId, ...publicFilter })
    .select("materials relatedProductIds")
    .populate("materials.product", "name slug price stock images isActive")
    .lean();
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  const data = hawan.materials.map((item) => ({ ...item, product: item.product?.isActive && item.productMappingStatus === "VERIFIED" ? item.product : null }));
  res.json({ success: true, data });
});

const getPhases = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findOne({ _id: req.params.hawanId, ...publicFilter }).select("steps").lean();
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  const phases = hawan.steps.reduce((groups, step) => {
    const key = step.phase || "Guide";
    if (!groups[key]) groups[key] = [];
    groups[key].push(step);
    return groups;
  }, {});
  res.json({ success: true, data: Object.entries(phases).map(([title, steps]) => ({ title, steps })) });
});

const getMantras = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findOne({ _id: req.params.hawanId, ...publicFilter }).select("mantras").lean();
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  res.json({ success: true, data: hawan.mantras.filter((mantra) => mantra.verificationStatus === "VERIFIED") });
});

const getPurposeOfferings = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findOne({ _id: req.params.hawanId, ...publicFilter }).select("purposeOfferings").lean();
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  res.json({ success: true, data: hawan.purposeOfferings.filter((offering) => offering.verificationStatus === "VERIFIED") });
});

const getPandits = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findOne({ _id: req.params.hawanId, ...publicFilter }).select("relatedPanditSpecialisations title");
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  const labels = [...hawan.relatedPanditSpecialisations, hawan.title];
  const terms = labels.flatMap((label) => [
    { specialization: new RegExp(escapeRegex(label), "i") },
    { "services.name": new RegExp(escapeRegex(label.replace(/ hawan$/i, "")), "i") },
  ]);
  const pandits = await PanditProfile.find({ approvalStatus: "APPROVED", ...(terms.length ? { $or: terms } : {}) })
    .populate("user", "name avatar city")
    .select("user bio languages experienceInYears ratingAverage services serviceCities isOnline")
    .limit(8)
    .lean();
  res.json({ success: true, data: pandits });
});

const getMuhurat = asyncHandler(async (req, res) => {
  const hawan = await Hawan.exists({ _id: req.params.hawanId, ...publicFilter });
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  const calculation = buildMuhurat(req.validated.query);
  res.json({
    success: true,
    data: {
      location: req.validated.query.location || "Selected location",
      ...calculation,
    },
  });
});

const getMyProgress = asyncHandler(async (req, res) => {
  const progress = await HawanProgress.findOne({ user: req.user._id, hawan: req.params.hawanId }).lean();
  res.json({ success: true, data: progress || null });
});

const saveProgress = asyncHandler(async (req, res) => {
  const hawan = await Hawan.findOne({ _id: req.validated.params.hawanId, ...publicFilter }).select("steps materials updatedAt");
  if (!hawan) throw new ApiError(StatusCodes.NOT_FOUND, "Hawan guide not found");
  const body = req.validated.body;
  const stepIds = new Set(hawan.steps.map((step) => String(step._id)));
  const materialIds = new Set(hawan.materials.map((item) => String(item._id)));
  if (body.completedStepIds?.some((id) => !stepIds.has(id))) throw new ApiError(StatusCodes.BAD_REQUEST, "Progress contains an invalid step");
  if (body.readyMaterialIds?.some((id) => !materialIds.has(id))) throw new ApiError(StatusCodes.BAD_REQUEST, "Progress contains an invalid material");
  const update = { ...body, guideRevision: hawan.updatedAt, lastViewedAt: new Date() };
  if (body.safetyConfirmed) update.safetyConfirmedAt = new Date();
  delete update.safetyConfirmed;
  if (!update.startedAt && (body.currentStepIndex > 0 || body.safetyConfirmed)) update.startedAt = new Date();
  const progress = await HawanProgress.findOneAndUpdate(
    { user: req.user._id, hawan: hawan._id },
    { $set: update, $setOnInsert: { user: req.user._id, hawan: hawan._id } },
    { upsert: true, new: true, runValidators: true }
  );
  res.json({ success: true, message: "Hawan progress saved", data: progress });
});

const completeHawan = asyncHandler(async (req, res) => {
  const progress = await HawanProgress.findOne({ user: req.user._id, hawan: req.params.hawanId });
  if (!progress?.safetyConfirmedAt) throw new ApiError(StatusCodes.BAD_REQUEST, "Review and confirm safety instructions before completion");
  if (!progress.completedAt) {
    progress.completedAt = new Date();
    await Promise.all([progress.save(), Hawan.updateOne({ _id: req.params.hawanId }, { $inc: { completionCount: 1 } })]);
  }
  res.json({ success: true, message: "Hawan marked complete", data: progress });
});

const listMyHawans = asyncHandler(async (req, res) => {
  const items = await HawanProgress.find({ user: req.user._id })
    .populate("hawan", "title slug shortDescription coverImage durationMinutes difficulty steps")
    .sort({ updatedAt: -1 })
    .lean();
  const data = items.filter((item) => item.hawan).map((item) => {
    const { steps = [], ...hawan } = item.hawan;
    return { ...item, hawan: { ...hawan, stepCount: steps.length } };
  });
  res.json({ success: true, data });
});

module.exports = { listHawans, getCategories, getHawanBySlug, recommendHawans, getMaterials, getPhases, getMantras, getPurposeOfferings, getPandits, getMuhurat, getMyProgress, saveProgress, completeHawan, listMyHawans };
