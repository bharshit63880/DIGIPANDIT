const materials = ["हवन कुंड या अग्निरोधी धातु पात्र", "हवन सामग्री का मिश्रण", "शुद्ध घी", "कपूर या घी में भीगी रूई की बाती", "छोटी सूखी लकड़ियाँ", "जल, पुष्प और धूप"];
const steps = [
  ["स्थान तैयार करें", "शांत और हवादार स्थान चुनें। हवन कुंड को अग्निरोधी, स्थिर सतह पर रखें और सामग्री व्यवस्थित करें।"],
  ["शुद्धि और संकल्प", "कुंड के आसपास थोड़ा जल छिड़कें, शांत बैठें और शांति, स्वास्थ्य या कृतज्ञता का संकल्प लें।"],
  ["छोटी अग्नि प्रज्वलित करें", "कुंड में छोटी लकड़ियाँ रखें। कपूर या घी में भीगी बाती से अग्नि जलाएँ और लौ को नियंत्रित रखें।"],
  ["सीमित आहुति दें", "स्थिर अग्नि में थोड़ी हवन सामग्री और घी दें। हर आहुति के साथ केवल वही मंत्र बोलें जिसका उच्चारण आपको सत्यापित रूप से आता हो।"],
  ["सम्मानपूर्वक समापन", "आहुति के बाद हाथ जोड़कर कृतज्ञता व्यक्त करें। अग्नि को अकेला न छोड़ें और उसे स्वाभाविक रूप से शांत होने दें।"],
];
export default function BeginnerHawanSourceGuide() {
  return <section className="hj-source-guide" aria-labelledby="source-hawan-title"><div className="hj-source-guide__intro"><p>शुरुआती घरेलू हवन</p><h2 id="source-hawan-title">स्रोत से संक्षिप्त, सुरक्षित क्रम</h2><span>यह सामग्री PoojaPaath के शुरुआती लेख का हिंदी सार है; DigiPandit का स्वतंत्र धार्मिक सत्यापन नहीं। विस्तृत या विशेष अनुष्ठान के लिए योग्य पंडित से पुष्टि करें।</span></div><div className="hj-source-guide__materials"><h3>आवश्यक सामग्री</h3><ul>{materials.map((item) => <li key={item}>{item}</li>)}</ul></div><ol>{steps.map(([title, copy], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol><aside><strong>अग्नि-सुरक्षा</strong><p>हवादार स्थान रखें, पास में जल या उपयुक्त अग्निशामक रखें, घी कम मात्रा में दें, बच्चों और पालतू जानवरों को दूर रखें और जलती अग्नि को कभी अकेला न छोड़ें। धुएँ से परेशानी हो तो तुरंत रुकें।</p></aside><a href="https://www.poojapaath.com/blogs/journal/how-to-perform-a-simple-hawan-at-home-a-beginner-s-ritual-guide" target="_blank" rel="noreferrer">मूल लेख पढ़ें — PoojaPaath ↗</a></section>;
}
