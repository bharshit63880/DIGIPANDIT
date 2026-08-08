const intentDefinitions = [
  { id: "greeting", pattern: /(^|\s)(नमस्ते|नमस्कार|हेलो|hello|hi|hey|राम राम|जय श्री राम)(\s|$)/i },
  { id: "astrology", pattern: /(ज्योतिष|कुंडली|राशि|राशिफल|गुण मिलान|अंक ज्योतिष|astrology|kundali|kundli|horoscope|numerology)/i },
  { id: "hawan", pattern: /(हवन|हवन गाइड|अग्नि|सामग्री सूची|मंत्र|hawan|havan)/i },
  { id: "puja", pattern: /(पूजा|पंडित|कथा|गृह प्रवेश|सत्यनारायण|विवाह|अनुष्ठान|puja|pooja|pandit|ritual)/i },
  { id: "booking", pattern: /(बुक|बुकिंग|समय|तिथि|स्लॉट|रद्द|schedule|booking|book|cancel|slot)/i },
  { id: "payment", pattern: /(भुगतान|पैसे|राशि|रिफंड|वापसी|यूपीआई|payment|pay|refund|upi|razorpay)/i },
  { id: "store", pattern: /(स्टोर|दुकान|सामग्री|किट|मूर्ति|धूप|अगरबत्ती|कार्ट|आदेश|store|samagri|kit|cart|order)/i },
  { id: "auth", pattern: /(खाता|प्रवेश|पंजीकरण|कूटशब्द|पासवर्ड|ओटीपी|login|signup|register|password|otp|account)/i },
  { id: "pandit", pattern: /(पंडित बन|पंडित पंजीकरण|सेवा जोड़|कमाई|स्वीकृति|pandit dashboard|become pandit|approval|earnings)/i },
  { id: "support", pattern: /(मदद|सहायता|समस्या|नहीं चल|त्रुटि|help|support|issue|error|not working)/i },
];

const topicSuggestions = {
  greeting: ["पूजा कैसे बुक करें?", "मेरी कुंडली बनाएँ", "हवन मार्गदर्शिका खोलें"],
  astrology: ["कुंडली कैसे बनाएँ?", "ज्योतिषाचार्य से बात करें", "कुंडली मिलान कैसे करें?"],
  hawan: ["हवन मार्गदर्शिका देखें", "हवन के लिए पंडित खोजें", "सामग्री सूची कहाँ मिलेगी?"],
  puja: ["मेरे शहर में पंडित खोजें", "पूजा सेवा कैसे चुनें?", "प्रत्यक्ष और ऑनलाइन में अंतर"],
  booking: ["मेरी बुकिंग कहाँ है?", "बुकिंग का शुल्क कैसे बनता है?", "बुकिंग रद्द कैसे करें?"],
  payment: ["भुगतान असफल हो गया", "भुगतान रसीद कहाँ मिलेगी?", "आदेश की स्थिति देखें"],
  store: ["पूजा सामग्री देखें", "सामग्री थैला कैसे खोलें?", "आदेश कैसे पूरा करें?"],
  auth: ["नया खाता बनाएँ", "कूटशब्द भूल गया", "ईमेल सत्यापन कैसे करें?"],
  pandit: ["पंडित खाता कैसे बनाएँ?", "सेवाएँ कैसे जोड़ें?", "स्वीकृति प्रक्रिया बताएँ"],
  support: ["भुगतान समस्या", "बुकिंग समस्या", "खाते की समस्या"],
};

const routeHints = {
  astrology: "/astrology",
  hawan: "/hawan-guide",
  puja: "/pandits",
  booking: "/dashboard/bookings",
  payment: "/dashboard/bookings",
  store: "/store",
  auth: "/login",
  pandit: "/pandit-dashboard",
};

const detectIntents = (text) => intentDefinitions.filter((item) => item.pattern.test(text)).map((item) => item.id);

const previousTopic = (history = []) => {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role !== "user") continue;
    const intents = detectIntents(String(history[index].content || ""));
    const topic = intents.find((intent) => !["greeting", "support"].includes(intent));
    if (topic) return topic;
  }
  return null;
};

const buildReply = ({ normalized, intents, topic, pathname }) => {
  if (/(डॉक्टर|बीमारी|दवा|कानूनी|निवेश|आत्महत्या|medical|legal|investment|suicide)/i.test(normalized)) {
    return "मैं धार्मिक सेवाओं और DigiPandit के उपयोग से जुड़ी सामान्य जानकारी दे सकता हूँ। चिकित्सा, कानूनी, वित्तीय या आपात स्थिति में कृपया योग्य विशेषज्ञ अथवा स्थानीय आपात सेवा से तुरंत संपर्क करें।";
  }

  if (intents.includes("greeting") && intents.length === 1) {
    return "नमस्ते! मैं पंडितजी सहायक हूँ। बताइए—आप पूजा या हवन बुक करना चाहते हैं, ज्योतिष मार्गदर्शन चाहिए, सामग्री खोजनी है, या किसी भुगतान और खाते में सहायता चाहिए?";
  }

  if (topic === "astrology") {
    if (/(मिलान|matching|गुण)/i.test(normalized)) return "कुंडली मिलान के लिए ज्योतिष पृष्ठ खोलें, वर और वधू का सही जन्म विवरण भरें और मिलान परिणाम देखें। व्यक्तिगत व्याख्या चाहिए तो वहीं से सत्यापित ज्योतिषाचार्य से परामर्श शुरू कर सकते हैं।";
    if (/(बन|generate|कैसे|how)/i.test(normalized)) return "कुंडली बनाने के लिए ज्योतिष पृष्ठ पर पूरा नाम, सही जन्म तिथि, जन्म समय और जन्म स्थान भरें। शहर सूची से सही स्थान चुनना आवश्यक है, ताकि अक्षांश और देशांतर स्वतः सही लगें।";
    return "DigiPandit के ज्योतिष भाग में जन्म कुंडली, दैनिक संकेत, कुंडली मिलान, अंक ज्योतिष और सत्यापित ज्योतिषाचार्य परामर्श उपलब्ध हैं। आप किस सुविधा के बारे में विस्तार चाहते हैं?";
  }

  if (topic === "hawan") {
    if (/(सामग्री|samagri|list)/i.test(normalized)) return "हवन मार्गदर्शिका में प्रत्येक उपलब्ध हवन के साथ वास्तविक सामग्री सूची दी जाती है। संबंधित हवन खोलकर सूची चिह्नित करें; जो सामग्री न हो, उसके संदर्भ के साथ पंडित बुकिंग पर जा सकते हैं।";
    return "हवन मार्गदर्शिका में स्रोत, सुरक्षा पुष्टि, चरण और प्रगति उपलब्ध हैं। पहले उद्देश्य के अनुसार हवन चुनें, सुरक्षा निर्देश पढ़ें और आवश्यकता होने पर सत्यापित पंडित की सहायता लें।";
  }

  if (topic === "puja") {
    if (/(ऑनलाइन|प्रत्यक्ष|offline|online|अंतर)/i.test(normalized)) return "प्रत्यक्ष सेवा में पूरा पता, यात्रा और स्थल व्यवस्था आवश्यक होती है। ऑनलाइन मार्गदर्शन में पते की आवश्यकता नहीं होती और उपलब्ध होने पर दृश्य मार्गदर्शन शुल्क जुड़ सकता है। अंतिम शुल्क भुगतान से पहले साफ दिखाई देता है।";
    return "पंडित बुकिंग पृष्ठ पर शहर और सेवा प्रकार चुनें, उपलब्ध पंडित की सेवा देखें, तिथि और माध्यम भरें, फिर दिखाए गए पूरे शुल्क की पुष्टि करके भुगतान करें। ज्योतिष परामर्श अलग ज्योतिष पृष्ठ पर उपलब्ध है।";
  }

  if (topic === "booking") {
    if (/(रद्द|cancel)/i.test(normalized)) return "अपनी बुकिंग खोलकर उसकी वर्तमान स्थिति देखें। रद्द करने का विकल्प केवल पात्र स्थिति में दिखाई देता है। भुगतान वापसी लागू हो तो उसकी स्थिति भी उसी बुकिंग विवरण में मिलेगी।";
    if (/(कहाँ|status|स्थिति|मेरी)/i.test(normalized)) return "प्रवेश करने के बाद व्यक्तिगत पटल में ‘मेरी बुकिंग’ खोलें। वहाँ निर्धारित समय, भुगतान, सेवा माध्यम और उपलब्ध बातचीत या दृश्य परामर्श विकल्प दिखाई देंगे।";
    return "बुकिंग के चरण हैं: पंडित और सेवा चुनें, तिथि व समय भरें, प्रत्यक्ष या ऑनलाइन माध्यम चुनें, आवश्यक पता और टिप्पणी दें, फिर पूरे शुल्क की पुष्टि कर भुगतान करें।";
  }

  if (topic === "payment") {
    if (/(असफल|failed|कट|deduct)/i.test(normalized)) return "भुगतान असफल दिखे तो पहले ‘मेरी बुकिंग’ या सामग्री थैले में स्थिति जाँचें। राशि कट गई लेकिन पुष्टि नहीं मिली तो दोबारा तुरंत भुगतान न करें; भुगतान संदर्भ सुरक्षित रखें और सहायता से संपर्क करें।";
    return "भुगतान से पहले मूल शुल्क, यात्रा, सामग्री, दक्षिणा या वितरण शुल्क अलग-अलग दिखते हैं। सफल भुगतान के बाद स्थिति और रसीद संबंधित बुकिंग या आदेश में उपलब्ध होती है।";
  }

  if (topic === "store") return "पूजा स्टोर में उपलब्ध सामग्री खोजें, मात्रा चुनकर थैले में जोड़ें और वितरण पता भरकर भुगतान पूरा करें। नाम, मूल्य, भंडार और छूट केवल वास्तविक स्टोर जानकारी से दिखाई जाती है।";
  if (topic === "auth") return "खाते के लिए प्रवेश या पंजीकरण पृष्ठ खोलें। ईमेल सत्यापन संकेत न मिले तो सत्यापन पृष्ठ से दोबारा भेजें। कूटशब्द भूलने पर ईमेल संकेत से नया कूटशब्द बना सकते हैं।";
  if (topic === "pandit") return "पंडित के रूप में पंजीकरण करते समय ‘पंडित / ज्योतिषाचार्य’ खाता प्रकार चुनें। परिचय, सेवाएँ और उपलब्धता पूरी करने के बाद प्रशासकीय स्वीकृति आवश्यक हो सकती है।";
  if (intents.includes("support")) return "मैं सहायता करूँगा। कृपया बताइए समस्या किस भाग में है—खाता, बुकिंग, भुगतान, ज्योतिष, हवन या पूजा स्टोर? कोई संवेदनशील जानकारी, कूटशब्द या पूरा भुगतान विवरण यहाँ न लिखें।";

  const pageTopic = Object.entries(routeHints).find(([, route]) => pathname?.startsWith(route))?.[0];
  if (pageTopic) return `आप अभी ${pageTopic === "store" ? "पूजा स्टोर" : pageTopic === "hawan" ? "हवन मार्गदर्शिका" : pageTopic === "astrology" ? "ज्योतिष" : "DigiPandit सेवा"} पृष्ठ पर हैं। इसी पृष्ठ से संबंधित प्रश्न थोड़ा विस्तार से लिखें, मैं सही अगला चरण बताऊँगा।`;
  return "मैं आपके प्रश्न को पूरी तरह समझ नहीं पाया। कृपया इसे थोड़ा स्पष्ट लिखें—उदाहरण के लिए ‘पूजा कैसे बुक करूँ’, ‘भुगतान असफल हुआ’, ‘कुंडली कैसे बनाएँ’ या ‘सामग्री कहाँ मिलेगी’।";
};

const getPanditJiResponse = ({ message, history = [], pathname = "/" }) => {
  const normalized = String(message || "").trim().slice(0, 800);
  const intents = detectIntents(normalized);
  const topic = intents.find((intent) => !["greeting", "support"].includes(intent)) || previousTopic(history);
  const reply = buildReply({ normalized, intents, topic, pathname });
  const suggestions = topicSuggestions[topic] || topicSuggestions[intents[0]] || ["पूजा बुकिंग में सहायता", "ज्योतिष के बारे में पूछें", "भुगतान समस्या बताएँ"];

  return {
    reply,
    suggestions,
    topic: topic || "general",
    route: routeHints[topic] || null,
  };
};

module.exports = { getPanditJiResponse };
