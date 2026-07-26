const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  { url: { type: String, trim: true }, publicId: { type: String, trim: true } },
  { _id: false }
);

const verificationStatuses = ["DRAFT", "NEEDS_REVIEW", "VERIFIED", "REJECTED"];
const sourceReferenceSchema = new mongoose.Schema(
  {
    sourceDocument: { type: String, required: true, trim: true, maxlength: 240 },
    sourceSection: { type: String, required: true, trim: true, maxlength: 240 },
    sourcePage: { type: Number, required: true, min: 1 },
    sourcePrintedPage: { type: Number, min: 1 },
    tradition: { type: String, required: true, trim: true, maxlength: 120 },
    verificationStatus: { type: String, enum: verificationStatuses, default: "NEEDS_REVIEW", index: true },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: "item", trim: true },
    required: { type: Boolean, default: true },
    purpose: { type: String, trim: true },
    alternatives: [{ type: String, trim: true }],
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    image: mediaSchema,
    source: sourceReferenceSchema,
    verificationStatus: { type: String, enum: verificationStatuses, default: "NEEDS_REVIEW" },
    quantityStatus: { type: String, enum: ["STATED", "NOT_STATED"], default: "NOT_STATED" },
    productMappingStatus: { type: String, enum: ["UNMAPPED", "NEEDS_REVIEW", "VERIFIED"], default: "UNMAPPED" },
  },
  { _id: true }
);

const mantraSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    devanagari: { type: String, required: true, trim: true },
    hindiTransliteration: { type: String, trim: true },
    englishTransliteration: { type: String, required: true, trim: true },
    meaning: { type: String, required: true, trim: true },
    audioUrl: { type: String, trim: true },
    defaultRepetitionCount: { type: Number, default: null, min: 1, max: 1008 },
    hindiMeaning: { type: String, trim: true },
    source: sourceReferenceSchema,
    audioVerificationStatus: { type: String, enum: verificationStatuses, default: "NEEDS_REVIEW" },
  },
  { _id: false }
);

const stepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: mediaSchema,
    videoUrl: { type: String, trim: true },
    mantraKey: { type: String, trim: true },
    repetitionCount: { type: Number, min: 0, max: 1008, default: 0 },
    durationSeconds: { type: Number, min: 0, max: 14400, default: 0 },
    safetyNote: { type: String, trim: true },
    requiresManualConfirmation: { type: Boolean, default: true },
    isFireRelated: { type: Boolean, default: false },
    phase: { type: String, trim: true, maxlength: 100 },
    source: sourceReferenceSchema,
    verificationStatus: { type: String, enum: verificationStatuses, default: "NEEDS_REVIEW" },
  },
  { _id: true }
);

const hawanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 280 },
    fullDescription: { type: String, trim: true, maxlength: 2500 },
    category: {
      type: String,
      required: true,
      enum: ["POPULAR", "CAREER", "MARRIAGE", "HEALTH", "WEALTH", "EDUCATION", "FAMILY", "GRAH_DOSH", "SPIRITUAL", "FESTIVAL", "PROPERTY", "BUSINESS"],
    },
    purposes: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" },
    durationMinutes: { type: Number, required: true, min: 10, max: 720 },
    estimatedCostRange: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 0, default: 0 },
    },
    coverImage: mediaSchema,
    participantRange: {
      min: { type: Number, min: 1, default: 1 },
      max: { type: Number, min: 1, default: 8 },
    },
    panditRecommended: { type: Boolean, default: false },
    fastingInformation: { type: String, trim: true },
    direction: { type: String, trim: true, default: "East or north-east" },
    clothingSuggestion: { type: String, trim: true },
    locationRequirements: [{ type: String, trim: true }],
    prerequisites: [{ type: String, trim: true }],
    materials: [materialSchema],
    steps: [stepSchema],
    mantras: [mantraSchema],
    safetyInstructions: [{ type: String, trim: true }],
    faqs: [{ question: { type: String, trim: true }, answer: { type: String, trim: true } }],
    relatedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    relatedPanditSpecialisations: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    source: sourceReferenceSchema,
    guideMode: { type: String, enum: ["FULL", "SOURCE_DRAFT"], default: "SOURCE_DRAFT" },
    verificationStatus: { type: String, enum: verificationStatuses, default: "NEEDS_REVIEW", index: true },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, maxlength: 1000 },
    purposeOfferings: [{
      title: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      source: sourceReferenceSchema,
      verificationStatus: { type: String, enum: verificationStatuses, default: "NEEDS_REVIEW" },
    }],
    ratingAverage: { type: Number, min: 0, max: 5, default: 4.8 },
    completionCount: { type: Number, min: 0, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

hawanSchema.index({ isPublished: 1, isArchived: 1, category: 1, isFeatured: -1 });
hawanSchema.index({ title: "text", shortDescription: "text", purposes: "text", tags: "text" });
hawanSchema.pre("validate", function normalizeSteps(next) {
  if (Array.isArray(this.steps)) this.steps.sort((a, b) => a.order - b.order);
  next();
});

hawanSchema.pre("validate", function protectPublication(next) {
  if (!this.isPublished) return next();
  const records = [this, ...(this.materials || []), ...(this.steps || []), ...(this.mantras || []), ...(this.purposeOfferings || [])];
  const invalid = records.some((record) => record.verificationStatus !== "VERIFIED" || !record.source);
  if (invalid) this.invalidate("isPublished", "Only fully source-attributed and verified Hawan content can be published");
  next();
});

module.exports = mongoose.model("Hawan", hawanSchema);
