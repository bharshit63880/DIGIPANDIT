const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const safeText = (min, max) => z.string().trim().min(min).max(max);
const verificationStatus = z.enum(["DRAFT", "NEEDS_REVIEW", "VERIFIED", "REJECTED"]);
const sourceReference = z.object({
  sourceDocument: safeText(2, 240), sourceSection: safeText(2, 240), sourcePage: z.coerce.number().int().min(1),
  sourcePrintedPage: z.coerce.number().int().min(1).optional(), tradition: safeText(2, 120),
  verificationStatus: verificationStatus.default("NEEDS_REVIEW"), verifiedBy: objectId.nullable().optional(),
  verifiedAt: z.coerce.date().nullable().optional(), reviewNote: safeText(0, 1000).optional().default(""),
});
const material = z.object({
  name: safeText(2, 100),
  description: safeText(0, 500).optional().default(""),
  quantity: z.coerce.number().min(0).max(1000).default(1),
  unit: safeText(1, 30).default("item"),
  required: z.boolean().default(true),
  purpose: safeText(0, 300).optional().default(""),
  alternatives: z.array(safeText(1, 100)).max(10).default([]),
  product: objectId.nullable().optional(),
  source: sourceReference.optional(), quantityStatus: z.enum(["STATED", "NOT_STATED"]).default("NOT_STATED"),
  verificationStatus: verificationStatus.default("NEEDS_REVIEW"),
  productMappingStatus: z.enum(["UNMAPPED", "NEEDS_REVIEW", "VERIFIED"]).default("UNMAPPED"),
});
const mantra = z.object({
  key: safeText(2, 50),
  title: safeText(2, 100),
  devanagari: safeText(1, 1000),
  hindiTransliteration: safeText(0, 1000).optional().default(""),
  englishTransliteration: safeText(1, 1000),
  meaning: safeText(2, 1000),
  audioUrl: z.string().url().optional().or(z.literal("")),
  defaultRepetitionCount: z.coerce.number().int().min(1).max(1008).nullable().optional(),
  hindiMeaning: safeText(0, 1000).optional().default(""), source: sourceReference.optional(), audioVerificationStatus: verificationStatus.default("NEEDS_REVIEW"),
});
const step = z.object({
  order: z.coerce.number().int().min(1).max(100),
  title: safeText(2, 120),
  description: safeText(2, 1500),
  videoUrl: z.string().url().optional().or(z.literal("")),
  mantraKey: safeText(0, 50).optional().default(""),
  repetitionCount: z.coerce.number().int().min(0).max(1008).default(0),
  durationSeconds: z.coerce.number().int().min(0).max(14400).default(0),
  safetyNote: safeText(0, 500).optional().default(""),
  requiresManualConfirmation: z.boolean().default(true),
  isFireRelated: z.boolean().default(false),
  phase: safeText(0, 100).optional().default(""), source: sourceReference.optional(),
  verificationStatus: verificationStatus.default("NEEDS_REVIEW"),
});
const hawanShape = {
  title: safeText(3, 120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: safeText(10, 280),
  fullDescription: safeText(0, 2500).optional().default(""),
  category: z.enum(["POPULAR", "CAREER", "MARRIAGE", "HEALTH", "WEALTH", "EDUCATION", "FAMILY", "GRAH_DOSH", "SPIRITUAL", "FESTIVAL", "PROPERTY", "BUSINESS"]),
  purposes: z.array(safeText(2, 80)).min(1).max(20),
  benefits: z.array(safeText(2, 240)).max(20).default([]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  durationMinutes: z.coerce.number().int().min(10).max(720),
  estimatedCostRange: z.object({ min: z.coerce.number().min(0), max: z.coerce.number().min(0) }),
  participantRange: z.object({ min: z.coerce.number().int().min(1), max: z.coerce.number().int().min(1) }),
  coverImage: z.object({ url: z.string().url().or(z.literal("")), publicId: z.string().nullable().optional() }).optional(),
  panditRecommended: z.boolean().default(false),
  fastingInformation: safeText(0, 500).optional().default(""),
  direction: safeText(0, 100).optional().default("East or north-east"),
  clothingSuggestion: safeText(0, 300).optional().default(""),
  locationRequirements: z.array(safeText(2, 240)).max(20).default([]),
  prerequisites: z.array(safeText(2, 240)).max(30).default([]),
  materials: z.array(material).min(1).max(80),
  steps: z.array(step).min(1).max(100),
  mantras: z.array(mantra).max(40).default([]),
  safetyInstructions: z.array(safeText(5, 300)).min(1).max(30),
  faqs: z.array(z.object({ question: safeText(3, 200), answer: safeText(3, 1000) })).max(30).default([]),
  relatedProductIds: z.array(objectId).max(80).default([]),
  relatedPanditSpecialisations: z.array(safeText(2, 100)).max(20).default([]),
  tags: z.array(safeText(1, 50)).max(30).default([]),
  source: sourceReference.optional(), guideMode: z.enum(["FULL", "SOURCE_DRAFT"]).default("SOURCE_DRAFT"),
  verificationStatus: verificationStatus.default("NEEDS_REVIEW"), verifiedBy: objectId.nullable().optional(), verifiedAt: z.coerce.date().nullable().optional(), reviewNote: safeText(0, 1000).optional().default(""),
  purposeOfferings: z.array(z.object({ title: safeText(2, 120), description: safeText(0, 1000).optional().default(""), source: sourceReference, verificationStatus: verificationStatus.default("NEEDS_REVIEW") })).max(40).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
};
const validateRanges = (value, ctx) => {
  if (value.estimatedCostRange.max < value.estimatedCostRange.min) ctx.addIssue({ code: "custom", path: ["estimatedCostRange", "max"], message: "Maximum cost must be greater than minimum cost" });
  if (value.participantRange.max < value.participantRange.min) ctx.addIssue({ code: "custom", path: ["participantRange", "max"], message: "Maximum participants must be greater than minimum participants" });
  if (new Set(value.steps.map((item) => item.order)).size !== value.steps.length) ctx.addIssue({ code: "custom", path: ["steps"], message: "Step order must be unique" });
};
const hawanBody = z.object(hawanShape).superRefine(validateRanges);

const listSchema = z.object({ body: z.any(), params: z.any(), query: z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().trim().optional(),
  purpose: z.string().trim().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  search: z.string().trim().max(100).optional(),
  featured: z.enum(["true", "false"]).optional(),
}) });
const detailSchema = z.object({ body: z.any(), query: z.any(), params: z.object({ slug: z.string().trim().min(2).max(120) }) });
const recommendSchema = z.object({ params: z.any(), query: z.any(), body: z.object({
  purpose: safeText(2, 80),
  timeMinutes: z.coerce.number().int().min(10).max(720).optional(),
  budget: z.coerce.number().min(0).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  grahDosh: z.boolean().optional(),
  hasMaterials: z.boolean().optional(),
  needsPandit: z.boolean().optional(),
}) });
const progressSchema = z.object({ query: z.any(), params: z.object({ hawanId: objectId }), body: z.object({
  completedStepIds: z.array(objectId).max(100).optional(),
  readyMaterialIds: z.array(objectId).max(100).optional(),
  currentStepIndex: z.coerce.number().int().min(0).max(100).optional(),
  mantraCounts: z.record(z.coerce.number().int().min(0).max(100000)).optional(),
  offeringCount: z.coerce.number().int().min(0).max(100000).optional(),
  language: z.enum(["hi-IN", "en-IN"]).optional(),
  safetyConfirmed: z.boolean().optional(),
  saved: z.boolean().optional(),
  durationSeconds: z.coerce.number().int().min(0).max(864000).optional(),
  notes: safeText(0, 1000).optional(),
}) });
const adminCreateSchema = z.object({ query: z.any(), params: z.any(), body: hawanBody });
const adminUpdateSchema = z.object({ query: z.any(), params: z.object({ hawanId: objectId }), body: z.object(hawanShape).partial() });
const idParamSchema = z.object({ query: z.any(), body: z.any(), params: z.object({ hawanId: objectId }) });
const verificationSchema = z.object({ query: z.any(), params: z.object({ hawanId: objectId }), body: z.object({ verificationStatus: verificationStatus, reviewNote: safeText(0, 1000).optional().default("") }) });
const muhuratSchema = z.object({
  body: z.any(),
  params: z.object({ hawanId: objectId }),
  query: z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    date: z.string().date().optional(),
    location: z.string().trim().max(120).optional(),
  }),
});

module.exports = { listSchema, detailSchema, recommendSchema, progressSchema, adminCreateSchema, adminUpdateSchema, idParamSchema, verificationSchema, muhuratSchema };
