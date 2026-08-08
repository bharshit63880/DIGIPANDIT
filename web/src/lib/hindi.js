const textMap = {
  ONLINE: "ऑनलाइन", OFFLINE: "प्रत्यक्ष सेवा", CREATED: "बनाया गया", PENDING: "लंबित",
  PAID: "भुगतान पूर्ण", FAILED: "असफल", CANCELLED: "रद्द", CONFIRMED: "पुष्ट",
  COMPLETED: "पूर्ण", PUJA: "पूजा", HAWAN: "हवन", KATHA: "कथा", USER: "उपयोगकर्ता",
  PANDIT: "पंडित", ADMIN: "प्रशासक", REQUIRED: "आवश्यक", OPTIONAL: "वैकल्पिक",
  "Brass Diya Set of 2": "पीतल के दो दीपकों का सेट",
  "Premium Sandal Incense Sticks": "प्रीमियम चंदन अगरबत्ती",
  "Rudrabhishek Samagri Kit": "रुद्राभिषेक सामग्री किट",
  "Dhoop Cone Devotional Pack": "पूजा धूप कोन पैक",
  "Navgraha Puja Samagri Box": "नवग्रह पूजा सामग्री पेटी",
  "Brass Ganesha Idol": "पीतल की गणेश प्रतिमा",
  "Marble Shiva Lingam Idol": "संगमरमर शिवलिंग प्रतिमा",
  "Complete Satyanarayan Puja Kit": "संपूर्ण सत्यनारायण पूजा किट",
  "Pt. Raghav Shastri": "पं. राघव शास्त्री", "Pt. Suresh Kulkarni": "पं. सुरेश कुलकर्णी",
  "Acharya Devendra Mishra": "आचार्य देवेंद्र मिश्र", "Pt. Omkar Tripathi": "पं. ओंकार त्रिपाठी",
  "Griha Pravesh Puja": "गृह प्रवेश पूजा", "Ganesh Sthapana Puja": "गणेश स्थापना पूजा",
  "Wedding Ceremony Puja": "विवाह संस्कार पूजा", "Naamkaran Puja": "नामकरण पूजा",
  "Rudrabhishek Puja": "रुद्राभिषेक पूजा",
};

export function hindiLabel(value, fallback = "जानकारी उपलब्ध नहीं") {
  if (value === null || value === undefined || value === "") return fallback;
  const text = String(value);
  return textMap[text] || text;
}

export function hindiContent(value, fallback = "विस्तृत जानकारी शीघ्र उपलब्ध होगी।") {
  if (!value) return fallback;
  const text = String(value);
  if (/[\u0900-\u097F]/.test(text)) return text;
  return textMap[text] || fallback;
}

export function hindiError(error, fallback = "कुछ समस्या हुई। कृपया पुनः प्रयास करें।") {
  const status = error?.response?.status;
  if (status === 400) return "दी गई जानकारी सही नहीं है। कृपया जाँचकर पुनः प्रयास करें।";
  if (status === 401) return "आपका सत्र समाप्त हो गया है। कृपया दोबारा प्रवेश करें।";
  if (status === 403) return "आपको यह कार्य करने की अनुमति नहीं है।";
  if (status === 404) return "माँगी गई जानकारी उपलब्ध नहीं है।";
  if (status >= 500) return "सेवा अभी उपलब्ध नहीं है। कृपया कुछ समय बाद पुनः प्रयास करें।";
  return fallback;
}

export function formatHindiDate(value) {
  if (!value) return "तिथि उपलब्ध नहीं";
  return new Intl.DateTimeFormat("hi-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
