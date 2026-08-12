import { useEffect } from "react";

const phrases = new Map(Object.entries({
  "Welcome back": "पुनः स्वागत है",
  "Sign in": "प्रवेश करें",
  "Sign out": "बाहर जाएँ",
  "Create account": "खाता बनाएँ",
  "Forgot password": "कूटशब्द भूल गए",
  "Verify email": "ईमेल सत्यापित करें",
  "Full name": "पूरा नाम",
  "Email": "ईमेल",
  "Phone": "दूरभाष क्रमांक",
  "Password": "कूटशब्द",
  "New password": "नया कूटशब्द",
  "City": "शहर",
  "State": "राज्य",
  "Home": "मुखपृष्ठ",
  "Dashboard": "व्यक्तिगत पटल",
  "Profile": "परिचय",
  "Bookings": "बुकिंग",
  "Booking": "बुकिंग",
  "My bookings": "मेरी बुकिंग",
  "Orders": "आदेश",
  "Cart": "सामग्री थैला",
  "Checkout": "भुगतान चरण",
  "Payment": "भुगतान",
  "Payment Receipt": "भुगतान रसीद",
  "Payment status": "भुगतान की स्थिति",
  "Pending": "लंबित",
  "Paid": "भुगतान पूर्ण",
  "Failed": "असफल",
  "Cancelled": "रद्द",
  "Confirmed": "पुष्ट",
  "Completed": "पूर्ण",
  "Online": "ऑनलाइन",
  "Offline": "प्रत्यक्ष सेवा",
  "Available": "उपलब्ध",
  "Unavailable": "अनुपलब्ध",
  "Service unavailable": "सेवा उपलब्ध नहीं है",
  "Loading...": "जानकारी आ रही है...",
  "Saving...": "सहेजा जा रहा है...",
  "Save": "सहेजें",
  "Cancel": "रद्द करें",
  "Close": "बंद करें",
  "Continue": "आगे बढ़ें",
  "Back": "वापस जाएँ",
  "Search": "खोजें",
  "Explore": "विस्तार से देखें",
  "Life path": "जीवन पथ",
  "Destiny": "भाग्यांक",
  "Soul": "आत्मांक",
  "Personality": "व्यक्तित्व",
  "Your personal number map will appear here.": "आपका व्यक्तिगत अंक मानचित्र यहाँ दिखाई देगा।",
  "Human wisdom, when you need it": "जब आवश्यकता हो, अनुभवी मानवीय मार्गदर्शन",
  "Take your chart into a live conversation.": "अपनी कुंडली पर सीधे विशेषज्ञ से चर्चा करें।",
  "Browse astrologers": "ज्योतिषाचार्य देखें",
  "Chat guidance": "बातचीत द्वारा मार्गदर्शन",
  "Fast, focused questions": "त्वरित और केंद्रित प्रश्न",
  "Career reading": "जीविका मार्गदर्शन",
  "Timing and professional direction": "उचित समय और व्यावसायिक दिशा",
  "Relationship clarity": "संबंधों में स्पष्टता",
  "Compatibility and communication": "अनुकूलता और संवाद",
  "Connect with verified astrologers through chat, audio, or video. Wallet billing and current consultation flows remain fully preserved.": "सत्यापित ज्योतिषाचार्यों से बातचीत, ध्वनि या दृश्य माध्यम से जुड़ें। आपकी धनराशि और वर्तमान परामर्श व्यवस्था पूरी तरह सुरक्षित रहती है।",
  "Lucky color": "शुभ रंग",
  "Common questions": "सामान्य प्रश्न",
  "Clear before you begin": "आरंभ करने से पहले स्पष्ट जानकारी",
  "Apply filters": "छँटाई लागू करें",
  "All services": "सभी सेवाएँ",
  "All": "सभी",
  "User": "श्रद्धालु",
  "Pandit": "पंडित",
  "Astrologer": "ज्योतिषाचार्य",
  "Admin": "प्रशासक",
  "Chat": "बातचीत",
  "Video call": "दृश्य वार्ता",
  "Start chat": "बातचीत आरंभ करें",
  "Book now": "अभी बुक करें",
  "Book a Pandit": "पंडित बुक करें",
  "Select service": "सेवा चुनें",
  "Selected service": "चुनी हुई सेवा",
  "Schedule": "समय चुनें",
  "Scheduled": "निर्धारित समय",
  "Paid At": "भुगतान का समय",
  "Gateway Ref": "भुगतान संदर्भ",
  "Base price": "मूल शुल्क",
  "Travel charge": "यात्रा शुल्क",
  "Samagri cost": "सामग्री शुल्क",
  "Extra dakshina": "अतिरिक्त दक्षिणा",
  "Video guidance fee": "दृश्य मार्गदर्शन शुल्क",
  "Total paid": "कुल भुगतान",
  "Service Address": "सेवा का पता",
  "Daily Horoscope": "दैनिक राशिफल",
  "Birth Details": "जन्म विवरण",
  "Birth date": "जन्म तिथि",
  "Birth time": "जन्म समय",
  "Place name": "जन्म स्थान",
  "Generate Kundali": "कुंडली बनाएँ",
  "Generate your kundali": "अपनी कुंडली बनाएँ",
  "Kundali Matching": "कुंडली मिलान",
  "Numerology": "अंक ज्योतिष",
  "Consultations": "परामर्श",
  "Interpretation": "फलित विवेचना",
  "Strengths": "सबल पक्ष",
  "Watchouts": "सावधानियाँ",
  "Career": "जीविका",
  "Marriage": "विवाह",
  "Current Timing": "वर्तमान दशा",
  "House Placements": "भाव स्थिति",
  "Reading Notes": "फलित संकेत",
  "Materials": "सामग्री",
  "Materials checklist": "सामग्री सूची",
  "Progress": "प्रगति",
  "Safety": "सुरक्षा",
  "Source attribution": "स्रोत विवरण",
  "Beginner friendly": "आरंभ करने वालों के लिए सरल",
  "Some guidance helpful": "थोड़ा मार्गदर्शन उपयोगी",
  "Pandit guidance advised": "पंडित मार्गदर्शन उचित",
  "Pandit advised": "पंडित की सलाह उचित",
  "Optional support": "वैकल्पिक सहायता",
  "View guided ritual": "निर्देशित अनुष्ठान देखें",
  "Start guided mode": "निर्देशित विधि आरंभ करें",
  "Previous step": "पिछला चरण",
  "Next step": "अगला चरण",
  "Start timer": "समय गणना आरंभ करें",
  "Pause timer": "समय गणना रोकें",
  "Reset timer": "समय गणना पुनः आरंभ करें",
  "Product details": "सामग्री का विवरण",
  "Add to cart": "थैले में जोड़ें",
  "Out of stock": "भंडार में नहीं",
  "In stock": "भंडार में उपलब्ध",
  "Quantity": "मात्रा",
  "Subtotal": "उप-योग",
  "Shipping": "वितरण शुल्क",
  "Total": "कुल योग",
  "Something went wrong": "कुछ समस्या हुई",
  "Try again": "पुनः प्रयास करें",
  "Refresh page": "पृष्ठ पुनः खोलें",
  "Question": "प्रश्न",
  "of": "में से",
  "min": "मिनट",
  "minutes": "मिनट",
  "years": "वर्ष",
  "Language": "भाषा",
  "Experience": "अनुभव",
  "Rating": "मूल्यांकन",
  "Reviews": "समीक्षाएँ",
  "Notes": "टिप्पणी",
  "Address": "पता",
  "Pincode": "पिनकोड",
  "Landmark": "निकटस्थ स्थान",
  "Date and time": "तिथि और समय",
  "Status": "स्थिति",
  "Actions": "क्रियाएँ",
  "Edit": "संपादित करें",
  "Delete": "हटाएँ",
  "View": "देखें"
}));

const replacements = [
  [/DIGIPANDIT JOURNEY/gi, "DigiPandit यात्रा"],
  [/VERIFIED GUIDANCE/gi, "सत्यापित मार्गदर्शन"],
  [/COSMIC INSIGHT/gi, "ब्रह्मांडीय ज्ञान"],
  [/SACRED FIRE/gi, "पवित्र अग्नि"],
  [/CURATED ESSENTIALS/gi, "चुनी हुई पूजा सामग्री"],
  [/DigiPandit tools/gi, "DigiPandit सुविधाएँ"],
  [/guide content, progress and safety confirmations/gi, "मार्गदर्शिका, प्रगति और सुरक्षा पुष्टियाँ"],
  [/stock\/store data/gi, "भंडार की वास्तविक जानकारी"],
  [/Wallet topup/gi, "धनराशि जोड़ना"],
  [/Specialist astrologer for live guidance and remedies\.?/gi, "जीवंत मार्गदर्शन और उपायों के विशेषज्ञ ज्योतिषाचार्य।"],
  [/To be confirmed/gi, "पुष्टि शेष"],
];

function translate(value) {
  const text = String(value || "");
  const trimmed = text.trim();
  if (!trimmed || !/[A-Za-z]/.test(trimmed) || /^(DigiPandit|OTP|₹|https?:)/i.test(trimmed)) return text;
  let result = phrases.get(trimmed) || trimmed;
  replacements.forEach(([pattern, replacement]) => { result = result.replace(pattern, replacement); });
  return result === trimmed ? text : text.replace(trimmed, result);
}

function translateTree(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (["SCRIPT", "STYLE", "CODE"].includes(node.parentElement?.tagName) || node.parentElement?.closest("[data-no-translate]")) return;
    const next = translate(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  });
  root.querySelectorAll?.("[placeholder],[title],[aria-label]").forEach((element) => {
    ["placeholder", "title", "aria-label"].forEach((attribute) => {
      if (element.hasAttribute(attribute)) element.setAttribute(attribute, translate(element.getAttribute(attribute)));
    });
  });
}

export function HindiInterface() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      document.documentElement.lang = "en";
      return undefined;
    }
    document.documentElement.lang = "hi";
    translateTree(document.body);
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => {
      if (mutation.type === "characterData") {
        const next = translate(mutation.target.nodeValue);
        if (next !== mutation.target.nodeValue) mutation.target.nodeValue = next;
        return;
      }
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const next = translate(node.nodeValue);
          if (next !== node.nodeValue) node.nodeValue = next;
        } else if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
      });
    }));
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
