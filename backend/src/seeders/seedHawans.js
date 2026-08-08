const connectDb = require("../db/connectDb");
const Hawan = require("../models/Hawan");

const documentName = "hawansandhya.pdf — The Procedure of the Sandhyaa and Havan";
const tradition = "देवयज्ञ – अग्निहोत्र (स्रोत में दिए अनुसार)";
const source = (sourceSection, sourcePage, sourcePrintedPage, reviewNote = "दिए गए PDF से स्रोत-संदर्भ लिया गया है; प्रकाशन से पहले विशेषज्ञ सत्यापन लंबित है।") => ({
  sourceDocument: documentName,
  sourceSection,
  sourcePage,
  sourcePrintedPage,
  tradition,
  verificationStatus: "NEEDS_REVIEW",
  reviewNote,
});

const guide = {
  title: "देवयज्ञ – अग्निहोत्र (स्रोत प्रारूप)",
  slug: "devayajna-agnihotra-source-draft",
  shortDescription: "उपलब्ध हवन-संध्या दस्तावेज़ से स्रोत-संदर्भित अग्निहोत्र प्रक्रिया का अप्रकाशित प्रारूप।",
  fullDescription: "इस प्रारूप में केवल स्पष्ट रूप से पढ़े जा सकने वाले स्रोत-अंश दर्ज हैं। विशेषज्ञ समीक्षा पूरी होने तक यह प्रकाशित या सत्यापित अनुष्ठान मार्गदर्शिका नहीं है।",
  category: "SPIRITUAL",
  purposes: ["स्रोत अध्ययन"],
  benefits: [],
  difficulty: "ADVANCED",
  durationMinutes: 60,
  estimatedCostRange: { min: 0, max: 0 },
  participantRange: { min: 1, max: 1 },
  panditRecommended: true,
  direction: "अग्निहोत्र के प्रारंभिक स्रोत-अंश में दिशा का उल्लेख नहीं है।",
  locationRequirements: [],
  prerequisites: ["उपयोग से पहले स्रोत-संदर्भ और समीक्षा स्थिति पढ़ें।"],
  source: source("Devayajña – Agnihotra", 31, 29),
  guideMode: "SOURCE_DRAFT",
  verificationStatus: "NEEDS_REVIEW",
  reviewNote: "यह केवल तकनीकी स्रोत प्रारूप है। विशेषज्ञ समीक्षा तक प्रकाशन रोका गया है।",
  materials: [
    { name: "हवन कुंड", description: "स्रोत में तैयार अग्नि और आहुति सामग्री हवन कुंड में रखने का उल्लेख है।", quantity: 0, unit: "उल्लेख नहीं", required: true, purpose: "अनुष्ठान पात्र", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", verificationStatus: "NEEDS_REVIEW", source: source("Agni Aadhaaana", 49, 47) },
    { name: "पतली समिधा", description: "स्रोत में हवा के लिए स्थान छोड़कर समिधा लगाने और इस भाग में तीन समिधा आहुतियों का उल्लेख है।", quantity: 3, unit: "टुकड़े", required: true, purpose: "हवन की लकड़ी", quantityStatus: "STATED", productMappingStatus: "UNMAPPED", verificationStatus: "NEEDS_REVIEW", source: source("Samidhaa Chayana / Samidh Aadhaaana", 49, 47) },
    { name: "दीपक", description: "अग्नि प्रदीपन से पहले दीपक जलाने का उल्लेख है।", quantity: 0, unit: "उल्लेख नहीं", required: true, purpose: "अग्नि प्रज्वलन", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Agni Pradeepana", 49, 47) },
    { name: "कपूर", description: "स्रोत में चम्मच पर कपूर रखकर दीपक से प्रज्वलित करने का उल्लेख है।", quantity: 0, unit: "उल्लेख नहीं", required: true, purpose: "अग्नि आधान", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Agni Aadhaaana", 49, 47) },
    { name: "घी", description: "स्रोत में घी की आहुति का उल्लेख है; मात्रा नहीं बताई गई है।", quantity: 0, unit: "उल्लेख नहीं", required: true, purpose: "आहुति", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Pañcha Ghṛit Aahuti", 51, 49) },
    { name: "हवन सामग्री", description: "स्रोत में मिश्रित वनस्पति सामग्री का उल्लेख है; मिश्रण और मात्रा स्पष्ट नहीं है।", quantity: 0, unit: "उल्लेख नहीं", required: true, purpose: "आहुति सामग्री", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Atha-Agni-Hotram", 49, 47) },
    { name: "जल", description: "जल सिंचन में उपयोग का उल्लेख है; स्रोत के अनुसार जल कुंड के भीतर नहीं जाना चाहिए।", quantity: 0, unit: "उल्लेख नहीं", required: true, purpose: "जल सिंचन", quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED", source: source("Jala Siñchana", 52, 50) },
  ],
  steps: [
    { order: 1, phase: "तैयारी", title: "पतली समिधा व्यवस्थित करें", description: "स्रोत के अनुसार कुंड में पतली समिधा इस तरह रखें कि हवा के लिए स्थान बना रहे।", safetyNote: "यह स्रोत निर्देश आधुनिक अग्नि-सुरक्षा की पूर्ण प्रक्रिया नहीं है।", requiresManualConfirmation: true, isFireRelated: true, source: source("Samidhaa Chayana", 49, 47) },
    { order: 2, phase: "अग्नि प्रज्वलन", title: "दीपक जलाएँ", description: "स्रोत में दिए मंत्र के साथ दीपक जलाने का निर्देश है।", requiresManualConfirmation: true, isFireRelated: true, source: source("Agni Pradeepana", 49, 47) },
    { order: 3, phase: "अग्नि प्रज्वलन", title: "कपूर प्रज्वलित करें", description: "स्रोत के अनुसार चम्मच पर रखा कपूर दीपक से जलाकर तैयार समिधाओं के बीच कुंड में रखें।", requiresManualConfirmation: true, isFireRelated: true, source: source("Agni Aadhaaana", 49, 47) },
    { order: 4, phase: "आहुति", title: "तीन समिधा अर्पित करें", description: "स्रोत में समिधा आधान के अंतर्गत तीन समिधा आहुतियों और अगले पृष्ठों पर संबंधित मंत्रों का उल्लेख है।", requiresManualConfirmation: true, isFireRelated: true, source: source("Samidh Aadhaaana", 50, 48) },
    { order: 5, phase: "जल सिंचन", title: "जल सिंचन करें", description: "स्रोत के अनुसार दाहिनी हथेली में जल लेकर कुंड के चारों ओर छिड़कें।", safetyNote: "जल कुंड के भीतर न जाने दें।", requiresManualConfirmation: true, isFireRelated: true, source: source("Jala Siñchana", 52, 50) },
    { order: 6, phase: "प्रधान होम", title: "समय के अनुसार स्रोत-अंश चुनें", description: "दस्तावेज़ में प्रातः और सायं प्रधान होम के अलग भाग हैं। निर्देशित प्रकाशन के लिए उचित चयन अभी समीक्षा में है।", requiresManualConfirmation: true, isFireRelated: true, source: source("Pradhaana Homa", 53, 51) },
    { order: 7, phase: "समापन", title: "पूर्णाहुति पूरी करें", description: "स्रोत में तीन अंतिम आहुतियों का उल्लेख है; प्रत्येक में घी व सामग्री और तीसरी में बची सामग्री अर्पित करने का निर्देश दिया गया है।", requiresManualConfirmation: true, isFireRelated: true, source: source("Poorṇaahuti", 79, 77) },
  ],
  mantras: [],
  safetyInstructions: ["स्रोत सीमा: यह दस्तावेज़ आधुनिक अग्नि-सुरक्षा की पूर्ण मार्गदर्शिका नहीं है।", "स्रोत निर्देश: जल सिंचन के समय कुंड के भीतर पानी न जाने दें।"],
  purposeOfferings: [
    { title: "विशेष अवसर या संस्कार आहुति", description: "स्रोत में विशेष अवसर की आहुति का भाग दिया गया है; सही चयन अभी समीक्षा में है।", source: source("Bṛihad Visheṣh Yajña", 58, 56), verificationStatus: "NEEDS_REVIEW" },
    { title: "विशिष्ट उद्देश्य की नियमित आहुति", description: "स्रोत में उद्देश्य-आधारित भाग दिए गए हैं। इस प्रारूप से कोई अनुशंसा या अनुष्ठान पाठ प्रकाशित नहीं किया गया है।", source: source("Routine offerings for specific reasons", 63, 61), verificationStatus: "NEEDS_REVIEW" },
  ],
  relatedProductIds: [],
  relatedPanditSpecialisations: ["हवन", "वैदिक अनुष्ठान"],
  tags: ["स्रोत प्रारूप", "अग्निहोत्र"],
  isFeatured: false,
  isPublished: false,
  isArchived: false,
};

async function seed() {
  await connectDb();
  const retired = await Hawan.updateMany({ isPublished: true, verificationStatus: { $ne: "VERIFIED" } }, { $set: { isPublished: false, reviewNote: "स्वतः अप्रकाशित: सार्वजनिक उपलब्धता से पहले स्रोत सत्यापन आवश्यक है।" } });
  await Hawan.findOneAndUpdate({ slug: guide.slug }, guide, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  console.log(`${retired.modifiedCount} पुराने असत्यापित गाइड अप्रकाशित किए; एक स्रोत-संदर्भित अग्निहोत्र प्रारूप seed किया।`);
  process.exit(0);
}

if (require.main === module) {
  seed().catch((error) => { console.error("Hawan seed failed", error); process.exit(1); });
}

module.exports = { guide, seed };
