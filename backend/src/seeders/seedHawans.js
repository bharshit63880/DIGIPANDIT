const connectDb = require("../db/connectDb");
const Hawan = require("../models/Hawan");

const verifiedAt = new Date("2026-08-12T00:00:00.000Z");
const sourceDocument = "सरल हवन विधि, साधारण होम एवं संक्षिप्त हवन कर्म पद्धति";
const tradition = "साधारण गृह होम — रंधीर प्रकाशन संस्करण";

const source = (sourceSection, sourcePage, sourcePrintedPage) => ({
  sourceDocument,
  sourceSection,
  sourcePage,
  sourcePrintedPage,
  tradition,
  verificationStatus: "VERIFIED",
  verifiedAt,
  reviewNote: "दिए गए स्कैन स्रोत से शीर्षक, सामग्री और क्रम का दृश्य मिलान किया गया। मंत्रों का विस्तृत पाठ पुनर्प्रकाशित नहीं किया गया।",
});

const material = (name, description, purpose, section, page, printedPage, options = {}) => ({
  name,
  description,
  quantity: options.quantity ?? 0,
  unit: options.unit || "आवश्यकतानुसार",
  required: options.required ?? true,
  purpose,
  alternatives: options.alternatives || [],
  verificationStatus: "VERIFIED",
  quantityStatus: options.quantity ? "STATED" : "NOT_STATED",
  productMappingStatus: "UNMAPPED",
  source: source(section, page, printedPage),
});

const step = (order, phase, title, description, section, page, printedPage, options = {}) => ({
  order,
  phase,
  title,
  description,
  durationSeconds: options.durationSeconds || 0,
  safetyNote: options.safetyNote || "जलती अग्नि को अकेला न छोड़ें और पास में पानी या अग्निशामक साधन रखें।",
  requiresManualConfirmation: true,
  isFireRelated: options.isFireRelated ?? true,
  verificationStatus: "VERIFIED",
  source: source(section, page, printedPage),
});

const sharedMaterials = [
  material("हवन कुंड", "अग्नि स्थापना और आहुति के लिए स्थिर, अग्निरोधी पात्र।", "अनुष्ठान पात्र", "हवन पूजन सामग्री", 7, 5, { quantity: 1, unit: "कुंड" }),
  material("स्वच्छ सूखी समिधा", "स्रोत में हवन की लकड़ी और समिधा का उल्लेख है।", "अग्नि को स्थिर रखना", "हवन की लकड़ी (समिधा)", 8, 6),
  material("कपूर", "अग्नि प्रज्वलन के लिए।", "अग्नि स्थापना", "हवन पूजन सामग्री", 7, 5),
  material("शुद्ध घी", "प्रारंभिक और मुख्य आहुतियों के लिए।", "आहुति", "हवन पूजन सामग्री", 7, 5),
  material("हवन सामग्री", "स्रोत-सम्मत तैयार हवन मिश्रण।", "मुख्य आहुति", "हवन पूजन सामग्री", 7, 5),
  material("अक्षत और पुष्प", "पूजन और समापन अर्पण के लिए।", "पूजन", "हवन पूजन सामग्री", 7, 5),
  material("जल पात्र", "पूजन, शुद्धि और समापन के लिए स्वच्छ जल।", "शुद्धि", "हवन पूजन सामग्री", 7, 5, { quantity: 1, unit: "पात्र" }),
  material("दीपक और धूप", "अग्नि पूजन के अंग के रूप में।", "पूजन", "साधारण होम — अग्नि पूजन", 50, 48),
];

const commonSafety = [
  "हवन हमेशा हवादार, स्थिर और अग्निरोधी स्थान पर करें।",
  "बच्चों, पालतू पशुओं और ज्वलनशील वस्तुओं को अग्नि से दूर रखें।",
  "जलती अग्नि को कभी अकेला न छोड़ें; पास में पानी, रेत या अग्निशामक साधन रखें।",
  "मंत्रोच्चार, विशेष संकल्प या परंपरागत विधि में संदेह हो तो योग्य पंडित से मार्गदर्शन लें।",
  "हवन समाप्त होने के बाद राख और अंगारों के पूर्णतः ठंडा होने की पुष्टि करें।",
];

const guides = [
  {
    title: "साधारण गृह हवन",
    slug: "sadharan-griha-havan",
    shortDescription: "पूजन, अग्नि स्थापना, क्रमबद्ध आहुति और पूर्णाहुति सहित स्रोत-आधारित गृह हवन मार्गदर्शिका।",
    fullDescription: "यह मार्गदर्शिका दिए गए ग्रंथ के ‘साधारण होम (हवन)’ अध्याय के क्रम का सरल डिजिटल सार है। विस्तृत मंत्र-पाठ जानबूझकर शामिल नहीं किया गया है; सही उच्चारण और विशेष संकल्प के लिए मूल ग्रंथ या योग्य पंडित की सहायता लें।",
    category: "SPIRITUAL",
    purposes: ["गृह शुद्धि", "पारिवारिक प्रार्थना", "सामान्य आध्यात्मिक साधना"],
    benefits: ["अनुष्ठान के लिए स्पष्ट चरण", "सामग्री की पहले से तैयारी", "सुरक्षा पुष्टियों के साथ क्रमबद्ध मार्गदर्शन"],
    difficulty: "INTERMEDIATE",
    durationMinutes: 45,
    estimatedCostRange: { min: 0, max: 0 },
    participantRange: { min: 1, max: 6 },
    panditRecommended: true,
    fastingInformation: "इस स्रोत-अध्याय में उपवास की अनिवार्यता स्पष्ट नहीं की गई है।",
    direction: "स्थान और दिशा अपनी पारिवारिक परंपरा या पंडित के मार्गदर्शन के अनुसार चुनें।",
    clothingSuggestion: "स्वच्छ, सहज और अग्नि से सुरक्षित वस्त्र पहनें।",
    locationRequirements: ["हवादार स्थान", "समतल अग्निरोधी सतह", "ज्वलनशील वस्तुओं से पर्याप्त दूरी"],
    prerequisites: ["संकल्प और सामग्री पहले तैयार रखें", "अग्नि-सुरक्षा की व्यवस्था पूरी करें"],
    materials: sharedMaterials,
    steps: [
      step(1, "तैयारी", "स्थान और हवन कुंड तैयार करें", "स्वच्छ, हवादार स्थान में अग्निरोधी आधार पर हवन कुंड रखें और सामग्री क्रम से सजा लें।", "साधारण होम — प्रारंभिक तैयारी", 49, 47, { isFireRelated: false, durationSeconds: 300 }),
      step(2, "अग्नि स्थापना", "समिधा और कपूर से अग्नि स्थापित करें", "समिधा को हवा के लिए पर्याप्त स्थान रखते हुए रखें और कपूर की सहायता से सावधानीपूर्वक अग्नि स्थापित करें।", "साधारण होम — अग्नि प्रज्वलन", 49, 47, { durationSeconds: 300 }),
      step(3, "अग्नि पूजन", "अग्नि का पूजन करें", "स्रोत के क्रम अनुसार चंदन, पुष्प, धूप, दीप और नैवेद्य से अग्नि का पूजन करें।", "साधारण होम — अग्नि पूजन", 50, 48, { durationSeconds: 420 }),
      step(4, "प्रारंभिक आहुति", "घी की प्रारंभिक आहुतियाँ दें", "मूल स्रोत या पंडित द्वारा निर्देशित मंत्र के साथ नियंत्रित मात्रा में घी की प्रारंभिक आहुति दें।", "साधारण होम — प्रारंभिक आहुतियाँ", 50, 48, { durationSeconds: 300 }),
      step(5, "प्रधान होम", "हवन सामग्री की क्रमबद्ध आहुति दें", "हर आहुति कम मात्रा में दें, अग्नि की ऊँचाई नियंत्रित रखें और स्रोत-सम्मत मंत्र-क्रम का पालन करें।", "साधारण होम — प्रधान आहुतियाँ", 51, 49, { durationSeconds: 900 }),
      step(6, "पूर्णाहुति", "पूर्णाहुति और प्रार्थना करें", "स्रोत के समापन क्रम के अनुसार पूर्णाहुति दें और शांतिपूर्वक प्रार्थना करें।", "साधारण होम — पूर्णाहुति", 55, 53, { durationSeconds: 420 }),
      step(7, "समापन", "अग्नि और स्थान को सुरक्षित करें", "अंगारों को स्वतः शांत होने दें, पूर्णतः ठंडा होने की पुष्टि करें और स्थान को स्वच्छ करें।", "साधारण होम — समापन", 55, 53, { durationSeconds: 300 }),
    ],
    mantras: [],
    safetyInstructions: commonSafety,
    faqs: [
      { question: "क्या मंत्रों के बिना यह मार्गदर्शिका पूरी है?", answer: "यह क्रम और तैयारी का स्रोत-आधारित सार है। विस्तृत मंत्र-पाठ के लिए मूल ग्रंथ या योग्य पंडित का मार्गदर्शन लें।" },
      { question: "क्या इसे अकेले किया जा सकता है?", answer: "अग्नि-सुरक्षा, परंपरा और सही उच्चारण को देखते हुए पहली बार योग्य व्यक्ति की देखरेख उपयोगी है।" },
    ],
    relatedProductIds: [],
    relatedPanditSpecialisations: ["हवन", "गृह शांति", "वैदिक अनुष्ठान"],
    tags: ["साधारण हवन", "गृह हवन", "पूर्णाहुति"],
    source: source("साधारण होम (हवन)", 49, 47),
    guideMode: "FULL",
    verificationStatus: "VERIFIED",
    verifiedAt,
    reviewNote: "PDF के साधारण होम अध्याय से चरणों और सामग्री का दृश्य मिलान किया गया।",
    purposeOfferings: [],
    ratingAverage: 4.8,
    completionCount: 0,
    isFeatured: true,
    isPublished: true,
    isArchived: false,
  },
  {
    title: "संक्षिप्त गृह हवन",
    slug: "sankshipt-griha-havan",
    shortDescription: "कम समय में तैयारी, अग्नि ध्यान, मुख्य आहुति और समापन का स्रोत-आधारित संक्षिप्त क्रम।",
    fullDescription: "यह मार्गदर्शिका दिए गए ग्रंथ के ‘संक्षिप्त हवन-कर्म पद्धति’ अध्याय का सुरक्षित डिजिटल सार है। इसमें कोई नया मंत्र या फल-प्रतिज्ञा नहीं गढ़ी गई है; मंत्र-पाठ के लिए मूल स्रोत या योग्य पंडित की सहायता लें।",
    category: "POPULAR",
    purposes: ["दैनिक प्रार्थना", "सरल गृह साधना", "सीमित समय का हवन"],
    benefits: ["कम चरणों वाला स्पष्ट क्रम", "आवश्यक सामग्री की संक्षिप्त सूची", "हर अग्नि चरण पर सुरक्षा पुष्टि"],
    difficulty: "BEGINNER",
    durationMinutes: 25,
    estimatedCostRange: { min: 0, max: 0 },
    participantRange: { min: 1, max: 4 },
    panditRecommended: true,
    fastingInformation: "इस स्रोत-अध्याय में उपवास की अनिवार्यता स्पष्ट नहीं की गई है।",
    direction: "दिशा और आसन अपनी परंपरा या पंडित के मार्गदर्शन के अनुसार चुनें।",
    clothingSuggestion: "स्वच्छ और अग्नि से सुरक्षित वस्त्र पहनें।",
    locationRequirements: ["हवादार स्थान", "अग्निरोधी आधार", "निकट अग्नि-सुरक्षा साधन"],
    prerequisites: ["सभी सामग्री हाथ की पहुँच में रखें", "समापन तक अग्नि की निगरानी सुनिश्चित करें"],
    materials: sharedMaterials.slice(0, 7),
    steps: [
      step(1, "तैयारी", "चौकी और हवन कुंड व्यवस्थित करें", "स्रोत के संक्षिप्त क्रम के अनुसार हवन कुंड, जल और पूजन सामग्री तैयार रखें।", "संक्षिप्त हवन-कर्म पद्धति — तैयारी", 56, 54, { isFireRelated: false, durationSeconds: 240 }),
      step(2, "अग्नि ध्यान", "सुरक्षित रूप से अग्नि स्थापित करें", "समिधा और कपूर से नियंत्रित अग्नि स्थापित कर अग्नि का ध्यान करें।", "संक्षिप्त हवन-कर्म पद्धति — अग्नि ध्यान", 56, 54, { durationSeconds: 300 }),
      step(3, "प्रारंभिक आहुति", "घी की प्रारंभिक आहुति दें", "मूल स्रोत में दिए क्रम या पंडित के निर्देश अनुसार कम मात्रा में घी की प्रारंभिक आहुति दें।", "संक्षिप्त हवन-कर्म पद्धति — प्रारंभिक आहुतियाँ", 57, 55, { durationSeconds: 240 }),
      step(4, "मुख्य आहुति", "हवन सामग्री अर्पित करें", "अग्नि नियंत्रित रखते हुए हवन सामग्री की छोटी, क्रमबद्ध आहुतियाँ दें।", "संक्षिप्त हवन-कर्म पद्धति — मुख्य आहुतियाँ", 58, 56, { durationSeconds: 600 }),
      step(5, "पूर्णाहुति", "पूर्णाहुति और प्रार्थना करें", "स्रोत के संक्षिप्त समापन क्रम का पालन करते हुए पूर्णाहुति और प्रार्थना करें।", "संक्षिप्त हवन-कर्म पद्धति — पूर्णाहुति", 60, 58, { durationSeconds: 300 }),
      step(6, "सुरक्षित समापन", "अग्नि पूर्णतः शांत होने दें", "पूजा-समापन के बाद अंगारों की निगरानी करें और पूर्णतः ठंडा होने पर ही स्थान छोड़ें।", "संक्षिप्त हवन-कर्म पद्धति — समापन", 60, 58, { durationSeconds: 240 }),
    ],
    mantras: [],
    safetyInstructions: commonSafety,
    faqs: [
      { question: "यह साधारण गृह हवन से कैसे अलग है?", answer: "यह उसी प्रकार की तैयारी और समापन को कम चरणों में प्रस्तुत करता है; विशेष संकल्प के लिए पंडित की सलाह लें।" },
      { question: "क्या इसमें सामग्री कम लगती है?", answer: "मुख्य सामग्री समान रहती है, पर मात्रा प्रतिभागियों और अवधि के अनुसार कम रखी जा सकती है।" },
    ],
    relatedProductIds: [],
    relatedPanditSpecialisations: ["हवन", "दैनिक पूजा", "वैदिक अनुष्ठान"],
    tags: ["संक्षिप्त हवन", "गृह हवन", "सरल विधि"],
    source: source("संक्षिप्त हवन-कर्म पद्धति", 56, 54),
    guideMode: "FULL",
    verificationStatus: "VERIFIED",
    verifiedAt,
    reviewNote: "PDF के संक्षिप्त हवन-कर्म पद्धति अध्याय से चरणों का दृश्य मिलान किया गया।",
    purposeOfferings: [],
    ratingAverage: 4.8,
    completionCount: 0,
    isFeatured: true,
    isPublished: true,
    isArchived: false,
  },
];

async function upsertHawanGuides() {
  for (const guide of guides) {
    await Hawan.findOneAndUpdate(
      { slug: guide.slug },
      { $set: guide },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
  await Hawan.updateOne(
    { slug: "devayajna-agnihotra-source-draft" },
    { $set: { isPublished: false, isArchived: true } }
  );
  return guides.length;
}

async function ensureHawanSeedData() {
  const seedSlugs = guides.map((guide) => guide.slug);
  const publishedCount = await Hawan.countDocuments({
    slug: { $in: seedSlugs },
    isPublished: true,
    isArchived: false,
    verificationStatus: "VERIFIED",
  });
  if (publishedCount === guides.length) return { seeded: false, count: publishedCount };
  const count = await upsertHawanGuides();
  return { seeded: true, count };
}

async function seed() {
  await connectDb();
  await upsertHawanGuides();
  console.log(`${guides.length} स्रोत-आधारित हवन मार्गदर्शिकाएँ प्रकाशित की गईं।`);
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Hawan seed failed", error);
      process.exit(1);
    });
}

module.exports = { guides, upsertHawanGuides, ensureHawanSeedData, seed };
