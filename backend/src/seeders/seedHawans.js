const connectDb = require("../db/connectDb");
const Hawan = require("../models/Hawan");

const documentName = "hawansandhya.pdf — The Procedure of the Sandhyaa and Havan";
const tradition = "Devayajña – Agnihotra (as identified in source)";
const source = (sourceSection, sourcePage, sourcePrintedPage, reviewNote = "Extracted from supplied PDF; awaiting expert verification for publication.") => ({
  sourceDocument: documentName,
  sourceSection,
  sourcePage,
  sourcePrintedPage,
  tradition,
  verificationStatus: "NEEDS_REVIEW",
  reviewNote,
});

const guide = {
  title: "Devayajña – Agnihotra (Source Draft)",
  slug: "devayajna-agnihotra-source-draft",
  shortDescription: "A source-mapped draft of the Agnihotra procedure from the supplied Hawan Sandhya document.",
  fullDescription: "This draft records clearly readable source sections only. It is not published and cannot be used as a verified ritual guide until expert review is completed.",
  category: "SPIRITUAL",
  purposes: ["Source study"],
  benefits: [],
  difficulty: "ADVANCED",
  durationMinutes: 60,
  estimatedCostRange: { min: 0, max: 0 },
  participantRange: { min: 1, max: 1 },
  panditRecommended: true,
  direction: "Not stated in the Agnihotra opening source section.",
  locationRequirements: [],
  prerequisites: ["Read the source attribution and review status before use."],
  source: source("Devayajña – Agnihotra", 31, 29),
  guideMode: "SOURCE_DRAFT",
  verificationStatus: "NEEDS_REVIEW",
  reviewNote: "Technical source draft only. Publication is blocked pending expert review.",
  materials: [
    { name: "Kuṇḍa", description: "The source places the prepared fire and offerings in a kuṇḍa.", quantity: 0, unit: "not stated", required: true, purpose: "Ritual vessel", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", verificationStatus: "NEEDS_REVIEW", source: source("Agni Aadhaaana", 49, 47) },
    { name: "Thin Samidhaa", description: "Arrange with aerated spaces; the source identifies three Samidhaa offerings in this section.", quantity: 3, unit: "pieces", required: true, purpose: "Sacrificial wood", quantityStatus: "STATED", productMappingStatus: "UNMAPPED", verificationStatus: "NEEDS_REVIEW", source: source("Samidhaa Chayana / Samidh Aadhaaana", 49, 47) },
    { name: "Deepak (deeyaa)", description: "Lighted before Agni Pradeepana.", quantity: 0, unit: "not stated", required: true, purpose: "Kindling", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Agni Pradeepana", 49, 47) },
    { name: "Camphor", description: "The source places camphor on a spoon and kindles it from the deepak.", quantity: 0, unit: "not stated", required: true, purpose: "Agni Aadhaaana", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Agni Aadhaaana", 49, 47) },
    { name: "Ghee", description: "Named for the source’s ghee oblations; volume is not stated.", quantity: 0, unit: "not stated", required: true, purpose: "Oblations", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Pañcha Ghṛit Aahuti", 51, 49) },
    { name: "Saamagree", description: "Named as mixed herbs in the source; composition and quantity are not stated.", quantity: 0, unit: "not stated", required: true, purpose: "Offerings", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Atha-Agni-Hotram", 49, 47) },
    { name: "Water", description: "Used for Jala Siñchana; the source says not to get water inside the kuṇḍa.", quantity: 0, unit: "not stated", required: true, purpose: "Jala Siñchana", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Jala Siñchana", 52, 50) },
  ],
  steps: [
    { order: 1, phase: "Preparation", title: "Arrange thin Samidhaa", description: "Arrange thin sacrificial wood in the kuṇḍa with aerated spaces to support combustion.", safetyNote: "This source instruction is not a complete fire-safety protocol.", requiresManualConfirmation: true, isFireRelated: true, source: source("Samidhaa Chayana", 49, 47) },
    { order: 2, phase: "Ignition", title: "Light the deepak", description: "The source directs the participant to chant the listed mantra and light a deepak.", requiresManualConfirmation: true, isFireRelated: true, source: source("Agni Pradeepana", 49, 47) },
    { order: 3, phase: "Ignition", title: "Kindle the camphor", description: "From the lighted deepak, kindle camphor placed on a spoon and place it in the kuṇḍa between the prepared thin samidhaas.", requiresManualConfirmation: true, isFireRelated: true, source: source("Agni Aadhaaana", 49, 47) },
    { order: 4, phase: "Offerings", title: "Offer three Samidhaas", description: "The source labels Samidh Aadhaaana as three Samidhaa offerings and provides the associated mantras on the following pages.", requiresManualConfirmation: true, isFireRelated: true, source: source("Samidh Aadhaaana", 50, 48) },
    { order: 5, phase: "Water", title: "Perform Jala Siñchana", description: "Fill the right palm with water and sprinkle around the kuṇḍa as directed by the source.", safetyNote: "Do not get water inside the kuṇḍa.", requiresManualConfirmation: true, isFireRelated: true, source: source("Jala Siñchana", 52, 50) },
    { order: 6, phase: "Principal Homa", title: "Choose the time-specific source branch", description: "The document contains separate morning and evening principal-homa sections. The appropriate branch remains under review for guided publication.", requiresManualConfirmation: true, isFireRelated: true, source: source("Pradhaana Homa", 53, 51) },
    { order: 7, phase: "Completion", title: "Complete Poorṇaahuti", description: "The source calls for the final oblation three times, offering ghee and saamagree each time and remaining material with the third chant.", requiresManualConfirmation: true, isFireRelated: true, source: source("Poorṇaahuti", 79, 77) },
  ],
  mantras: [],
  safetyInstructions: ["Source limit: the document is not a complete modern fire-safety protocol.", "Source instruction: do not get water inside the kuṇḍa during Jala Siñchana."],
  purposeOfferings: [
    { title: "Special occasion / sanskaara insertion", description: "The source identifies a special-occasion offering block; exact selection is pending review.", source: source("Bṛihad Visheṣh Yajña", 58, 56), verificationStatus: "NEEDS_REVIEW" },
    { title: "Routine offerings for specific reasons", description: "The source lists purpose-specific sections. No recommendation or ritual text is published from this draft.", source: source("Routine offerings for specific reasons", 63, 61), verificationStatus: "NEEDS_REVIEW" },
  ],
  relatedProductIds: [],
  relatedPanditSpecialisations: ["Hawan", "Vedic rituals"],
  tags: ["source-draft", "agnihotra"],
  isFeatured: false,
  isPublished: false,
  isArchived: false,
};

async function seed() {
  await connectDb();
  const retired = await Hawan.updateMany({ isPublished: true, verificationStatus: { $ne: "VERIFIED" } }, { $set: { isPublished: false, reviewNote: "Unpublished automatically: source verification is required before public availability." } });
  await Hawan.findOneAndUpdate({ slug: guide.slug }, guide, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  console.log(`Unpublished ${retired.modifiedCount} legacy unverified guide(s); seeded one unpublished, source-mapped Agnihotra draft.`);
  process.exit(0);
}

seed().catch((error) => { console.error("Hawan seed failed", error); process.exit(1); });
