const hindi = {
  signs: {
    Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह", Virgo: "कन्या",
    Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन",
  },
  planets: {
    Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु",
    Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
  },
  sections: {
    personality: "व्यक्तित्व",
    career: "करियर",
    marriage: "विवाह",
    love: "प्रेम",
    health: "स्वास्थ्य",
    business: "व्यवसाय",
    education: "शिक्षा",
    foreignTravel: "विदेश यात्रा",
    finance: "वित्त",
    property: "संपत्ति",
  },
  scores: {
    life: "जीवन", career: "करियर", finance: "वित्त", marriage: "विवाह", health: "स्वास्थ्य", spiritual: "आध्यात्म",
  },
  doshas: {
    "Manglik Dosh": "मांगलिक दोष",
    "Shani Influence": "शनि प्रभाव",
    "Guru Chandal Pattern": "गुरु चांडाल योग",
    "Grahan Pattern": "ग्रहण योग",
    "Kemadruma Pattern": "केमद्रुम योग",
  },
};

export const translateSign = (value, language) => language === "hi" ? hindi.signs[value] || value : value;
export const translatePlanet = (value, language) => language === "hi" ? hindi.planets[value] || value : value;
export const translateSection = (value, language) => language === "hi"
  ? hindi.sections[value] || value
  : value.replace(/([A-Z])/g, " $1");
export const translateScore = (value, language) => language === "hi" ? hindi.scores[value] || value : value;
export const translateDasha = (value, language) => {
  if (language !== "hi") return value;
  const planet = value.replace(" Mahadasha", "");
  return `${translatePlanet(planet, "hi")} महादशा`;
};
export const translateDosh = (value, language) => language === "hi" ? hindi.doshas[value] || value : value;

export function getHindiSectionCopy(section, result) {
  const lagna = translateSign(result.kundali.lagna.sign.name, "hi");
  const moon = translateSign(result.kundali.planets.find((planet) => planet.name === "Moon")?.sign.name, "hi");
  const copies = {
    personality: `${lagna} लग्न आपके स्वभाव में संवेदनशीलता, संतुलन और परिस्थितियों को समझने की क्षमता बढ़ाता है। ${moon} राशि का चंद्रमा आपकी भावनात्मक प्रतिक्रिया और निर्णय शैली को प्रभावित करता है।`,
    career: "करियर में धैर्य, स्पष्ट लक्ष्य और नियमित प्रयास आपके लिए सबसे उपयोगी रहेंगे। बड़े निर्णय लेते समय समय, कौशल और व्यावहारिक परिस्थितियों का ध्यान रखें।",
    marriage: "विवाह और साझेदारी में संवाद, भरोसा और जिम्मेदारियों का संतुलन महत्वपूर्ण रहेगा। कुंडली के संकेतों को अंतिम निर्णय नहीं, मार्गदर्शन की तरह देखें।",
    love: "प्रेम संबंधों में स्पष्ट संवाद, सम्मान और भावनात्मक स्थिरता आपके लिए सकारात्मक परिणाम देती है।",
    health: "नियमित नींद, संतुलित भोजन, पर्याप्त पानी और व्यायाम आपकी मूल स्वास्थ्य दिनचर्या होनी चाहिए। आवश्यकता होने पर चिकित्सकीय सलाह अवश्य लें।",
    business: "व्यवसाय में योजनाबद्ध निवेश, लिखित समझौते और कम जोखिम वाली स्थिर प्रगति अधिक अनुकूल रहेगी।",
    education: "एक समय में एक लक्ष्य पर केंद्रित अध्ययन और नियमित अभ्यास बेहतर परिणाम देगा।",
    foreignTravel: "विदेश यात्रा या बाहरी अवसरों में दस्तावेज, कौशल और दीर्घकालीन योजना पर विशेष ध्यान रखें।",
    finance: "बचत, आपातकालीन निधि और भावनाओं से अलग होकर किए गए वित्तीय निर्णय स्थिरता बढ़ाएंगे।",
    property: "संपत्ति से जुड़े निर्णयों में दस्तावेजों की जांच, परिवार की सहमति और विशेषज्ञ सलाह उपयोगी रहेगी।",
  };
  return copies[section] || "यह संकेत आपकी जन्म कुंडली की संरचना पर आधारित सामान्य मार्गदर्शन है।";
}
