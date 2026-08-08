import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addToCart } from "../features/cart/cartSlice";
import { getExpertImage } from "../lib/media";
import { api } from "../lib/api";
import "../styles/hawan-journey.css";

const categories = ["ALL", "POPULAR", "CAREER", "MARRIAGE", "HEALTH", "WEALTH", "EDUCATION", "FAMILY", "GRAH_DOSH", "SPIRITUAL", "PROPERTY", "BUSINESS"];
const categoryLabels = { ALL: "सभी", POPULAR: "लोकप्रिय", CAREER: "करियर", MARRIAGE: "विवाह", HEALTH: "स्वास्थ्य", WEALTH: "समृद्धि", EDUCATION: "शिक्षा", FAMILY: "परिवार", GRAH_DOSH: "ग्रह दोष", SPIRITUAL: "आध्यात्मिक शांति", PROPERTY: "संपत्ति", BUSINESS: "व्यवसाय" };
const sankalps = [
  ["FAMILY", "गृह शांति"], ["HEALTH", "स्वास्थ्य"], ["MARRIAGE", "विवाह"], ["CAREER", "करियर"], ["EDUCATION", "शिक्षा"],
  ["WEALTH", "समृद्धि"], ["FAMILY", "परिवार"], ["GRAH_DOSH", "ग्रह दोष"], ["BUSINESS", "व्यवसाय"], ["SPIRITUAL", "आध्यात्मिक शांति"],
];
const safetyItems = ["खुला और हवादार स्थान", "अग्निरोधी आधार", "पानी या अग्निशामक पास में", "बच्चों और पालतू जानवरों से सुरक्षित दूरी", "ढीले वस्त्र और ज्वलनशील वस्तुएँ दूर", "आवश्यकता पड़ने पर अनुभवी व्यक्ति उपस्थित"];
const difficultyLabels = { BEGINNER: "सरल तैयारी", INTERMEDIATE: "कुछ मार्गदर्शन उपयोगी", ADVANCED: "पंडित सहायता उचित" };
const verificationLabels = { VERIFIED: "सत्यापित", NEEDS_REVIEW: "विशेषज्ञ समीक्षा जारी", DRAFT: "प्रकाशित नहीं", REJECTED: "प्रकाशित नहीं" };

function HawanKundScene() {
  return <div className="hj-kund-scene" aria-hidden="true">
    <img src="/cinematic/hawan-kund-editorial.webp" alt="" width="1400" height="893" />
    <span className="hj-smoke hj-smoke--one" /><span className="hj-smoke hj-smoke--two" />
    <div className="hj-embers">{Array.from({ length: 9 }).map((_, index) => <i key={index} style={{ "--ember": index }} />)}</div>
  </div>;
}

function SankalpMandala({ value, onChange }) {
  const activeIndex = Math.max(0, sankalps.findIndex(([key]) => key === value));
  const move = (direction) => onChange(sankalps[(activeIndex + direction + sankalps.length) % sankalps.length][0]);
  return <div className="hj-sankalp-wrap">
    <div className="hj-sankalp-copy"><p>संकल्प</p><h2>आप किस उद्देश्य के लिए<br />हवन करना चाहते हैं?</h2><span>तीर कुंजियों, स्पर्श या विकल्प चुनकर आगे बढ़ें।</span></div>
    <div className="hj-mandala" role="radiogroup" aria-label="हवन का उद्देश्य" tabIndex="0" onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); move(1); } if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); move(-1); } }}>
      <div className="hj-mandala-core"><span>अग्नि</span><strong>{sankalps[activeIndex][1]}</strong></div>
      {sankalps.map(([key, label], index) => <button key={`${key}-${label}`} type="button" role="radio" aria-checked={index === activeIndex} className={index === activeIndex ? "is-active" : ""} style={{ "--index": index }} onClick={() => onChange(key)}>{label}</button>)}
    </div>
  </div>;
}

function RecommendedHawan({ hawan, pending, onDetailedRecommendation }) {
  if (!hawan) return <div className="hj-recommendation hj-recommendation--empty">
    <div className="hj-empty-copy">
      <p><span aria-hidden="true">✦</span> सत्यापन प्रक्रिया</p>
      <h2>सही मार्गदर्शन<br />तैयार किया जा रहा है।</h2>
      <span>इस संकल्प के लिए प्रमाणित विधि अभी प्रकाशित नहीं हुई है। हम अनुमानित मंत्र या धार्मिक दावा नहीं दिखाते।</span>
      <div className="hj-empty-actions"><button type="button" onClick={onDetailedRecommendation}>दूसरा संकल्प चुनें</button><Link to="/pandits">पंडित से मार्गदर्शन लें</Link></div>
    </div>
    <div className="hj-empty-visual" aria-hidden="true"><div className="hj-empty-rings"><i /><i /><i /><strong>ॐ</strong></div><span>स्रोत जाँच</span><span>विशेषज्ञ समीक्षा</span><span>प्रकाशन</span></div>
  </div>;
  return <article className="hj-recommendation">
    <div className="hj-recommendation-index">01</div>
    <div><p>{verificationLabels[hawan.verificationStatus] || "स्थिति उपलब्ध नहीं"}</p><h2>{hawan.title}</h2><span>{hawan.shortDescription}</span></div>
    <dl><div><dt>समय</dt><dd>{hawan.durationMinutes} मिनट</dd></div><div><dt>तैयारी</dt><dd>{difficultyLabels[hawan.difficulty] || hawan.difficulty}</dd></div><div><dt>लोग</dt><dd>{hawan.participantRange?.min || 1}–{hawan.participantRange?.max || 1}</dd></div><div><dt>पंडित</dt><dd>{hawan.panditRecommended ? "अनुशंसित" : "वैकल्पिक"}</dd></div></dl>
    <div className="hj-recommendation-actions"><Link to={`/hawan-guide/${hawan.slug}`}>गाइड देखें</Link><a href="#samagri">सामग्री तैयार करें</a><Link to={`/pandits?hawan=${encodeURIComponent(hawan.title)}`}>पंडित से पूछें</Link></div>
    {pending ? <small aria-live="polite">विस्तृत जानकारी तैयार हो रही है…</small> : null}
  </article>;
}

function SamagriMandala({ materials, states, onToggle, onAddMissing }) {
  const shown = materials.slice(0, 8);
  return <section id="samagri" className="hj-samagri">
    <div className="hj-section-copy"><p>तैयारी</p><h2>हवन से पहले<br />सामग्री तैयार करें</h2><span>हर सामग्री की स्थिति चुनें। केवल वास्तविक, स्टोर से जुड़ी और उपलब्ध वस्तु ही कार्ट में जाएगी।</span><button type="button" onClick={onAddMissing}>बची सामग्री कार्ट में जोड़ें</button></div>
    <div className="hj-material-orbit" aria-hidden="true"><img src="/cinematic/hawan-kund-editorial.webp" alt="" />{shown.map((item, index) => <span key={item._id || item.name} style={{ "--material": index }}>{item.name}</span>)}</div>
    <ul className="hj-material-list" aria-label="सामग्री की सुलभ सूची">{materials.map((item) => { const state = states[item._id] || "BUY"; return <li key={item._id}><div><strong>{item.name}</strong><span>{item.quantityStatus === "NOT_STATED" ? "मात्रा स्रोत में नहीं बताई गई" : `${item.quantity} ${item.unit}`} · {item.purpose || item.description}</span></div><button type="button" onClick={() => onToggle(item._id)} aria-label={`${item.name} की स्थिति बदलें`}>{state === "READY" ? "उपलब्ध है" : state === "PANDIT" ? "पंडित लाएँगे" : item.required === false ? "वैकल्पिक" : "खरीदना है"}</button></li>; })}</ul>
  </section>;
}

function SafetyCheckpoint({ checked, onToggle, guide }) {
  const complete = safetyItems.every((item) => checked.includes(item));
  return <section className="hj-safety"><div className="hj-threshold-line" /><div className="hj-safety-title"><p>सुरक्षा सीमा</p><h2>अग्नि प्रज्वलित करने से पहले</h2><span>इन सामान्य अग्नि-सुरक्षा तैयारियों की पुष्टि आवश्यक है। सजावटी गति यहाँ जानबूझकर रोक दी गई है।</span></div><fieldset><legend className="sr-only">सुरक्षा पुष्टि</legend>{safetyItems.map((item) => <label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={() => onToggle(item)} /><span>{item}</span></label>)}</fieldset><div className="hj-safety-action"><strong>{complete ? "सुरक्षा तैयारी पूरी" : `${checked.length} / ${safetyItems.length} पुष्टि पूरी`}</strong>{guide ? <Link className={complete ? "" : "is-disabled"} aria-disabled={!complete} onClick={(event) => !complete && event.preventDefault()} to={`/hawan-guide/${guide.slug}`}>{complete ? "गाइडेड मोड खोलें" : "पहले सभी पुष्टि करें"}</Link> : null}</div></section>;
}

function GuidedPreview({ guide }) {
  const steps = guide?.steps || [];
  return <section className="hj-guided"><div className="hj-section-copy"><p>गाइडेड हवन</p><h2>हर चरण,<br />सही समय पर</h2><span>एक समय में एक चरण। कोई ऑडियो अपने-आप नहीं चलेगा और अगला चरण आपकी पुष्टि के बिना नहीं खुलेगा।</span>{guide ? <Link to={`/hawan-guide/${guide.slug}`}>गाइड का पूर्वावलोकन करें</Link> : <em>सत्यापित चरण उपलब्ध होने पर यहाँ दिखेंगे।</em>}</div><ol className="hj-ritual-path">{steps.length ? steps.slice(0, 5).map((step, index) => <li key={step._id || step.order} className={index === 0 ? "is-current" : ""}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><small>{step.phase || "अनुष्ठान चरण"}</small></div></li>) : ["तैयारी", "सुरक्षा पुष्टि", "निर्देशित चरण"].map((title, index) => <li key={title}><span>0{index + 1}</span><div><strong>{title}</strong><small>विशेषज्ञ समीक्षा जारी</small></div></li>)}</ol><button type="button" className="hj-stop" disabled>हवन रोकें</button></section>;
}

function SourceLedger({ guide }) {
  const source = guide?.source;
  return <section className="hj-source"><details><summary><span>यह मार्गदर्शन कहाँ से आता है?</span><strong>{verificationLabels[guide?.verificationStatus] || "विशेषज्ञ समीक्षा जारी"}</strong></summary><div>{source ? <dl><div><dt>स्रोत</dt><dd>{source.sourceDocument}</dd></div><div><dt>संदर्भ</dt><dd>{source.sourceSection} · पृष्ठ {source.sourcePrintedPage || source.sourcePage}</dd></div><div><dt>परंपरा</dt><dd>{source.tradition}</dd></div><div><dt>समीक्षा</dt><dd>{source.verifiedAt ? new Date(source.verifiedAt).toLocaleDateString("hi-IN") : "विशेषज्ञ समीक्षा जारी"}</dd></div><div><dt>ऑडियो</dt><dd>{guide?.mantras?.some((item) => item.audioVerificationStatus === "VERIFIED") ? "ऑडियो सत्यापित" : "सत्यापित ऑडियो प्रकाशित नहीं"}</dd></div></dl> : <p>स्रोत-संदर्भित और विशेषज्ञ-सत्यापित सामग्री उपलब्ध होने पर ही प्रकाशित होगी।</p>}<p>यह पारंपरिक मार्गदर्शन है; चिकित्सा, कानूनी, वित्तीय या पेशेवर अग्नि-सुरक्षा सलाह का विकल्प नहीं।</p></div></details></section>;
}

function PanditAssistance({ pandits, guide }) {
  return <section className="hj-pandits"><div className="hj-section-copy"><p>मानवीय सहायता</p><h2>जहाँ आवश्यकता हो,<br />पंडित आपके साथ हैं।</h2><span>मंत्र, क्रम या अग्नि-सुरक्षा को लेकर संदेह हो तो सत्यापित पंडित से ऑनलाइन या घर पर सहायता लें।</span><Link to={`/pandits${guide ? `?hawan=${encodeURIComponent(guide.title)}` : ""}`}>सभी पंडित देखें</Link></div>{pandits.length ? <div className="hj-pandit-rail">{pandits.slice(0, 5).map((pandit) => <article key={pandit._id}><div className="hj-pandit-portrait"><img src={getExpertImage(pandit)} alt={pandit.user?.name || "सत्यापित पंडित"} /></div><h3>{pandit.user?.name}</h3><p>{pandit.serviceCities?.[0] || pandit.user?.city || "शहर उपलब्ध नहीं"} · {pandit.experienceInYears || 0} वर्ष</p><span>{(pandit.languages || []).join(", ") || "भाषा उपलब्ध नहीं"}</span><Link to={`/pandits?hawan=${encodeURIComponent(guide?.title || "हवन")}`}>सहायता लें</Link></article>)}</div> : <div className="hj-pandit-empty"><p>इस गाइड के लिए सत्यापित पंडित प्रोफ़ाइल अभी उपलब्ध नहीं है।</p><Link to="/pandits">पंडित खोजें</Link></div>}</section>;
}

export default function HawanPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [hawans, setHawans] = useState([]); const [category, setCategory] = useState("ALL"); const [search, setSearch] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("FAMILY"); const [detail, setDetail] = useState(null); const [detailLoading, setDetailLoading] = useState(false); const [pandits, setPandits] = useState([]); const [materialStates, setMaterialStates] = useState({}); const [safety, setSafety] = useState([]); const [notice, setNotice] = useState("");

  const loadHawans = async () => { try { setLoading(true); setError(""); const response = await api.get("/hawans", { params: { limit: 40 } }); setHawans(response.data.data || []); } catch { setError("हवन गाइड अभी उपलब्ध नहीं हो पाया। कृपया पुनः प्रयास करें।"); } finally { setLoading(false); } };
  useEffect(() => { loadHawans(); }, []);
  const filtered = useMemo(() => hawans.filter((hawan) => { const categoryMatch = category === "ALL" || hawan.category === category; const term = search.trim().toLowerCase(); return categoryMatch && (!term || `${hawan.title} ${hawan.shortDescription} ${(hawan.purposes || []).join(" ")}`.toLowerCase().includes(term)); }), [hawans, category, search]);
  const selectedHawan = useMemo(() => hawans.find((hawan) => hawan.category === selectedPurpose) || filtered[0] || hawans[0] || null, [hawans, filtered, selectedPurpose]);
  useEffect(() => { if (!selectedHawan?.slug) { setDetail(null); setPandits([]); return; } let alive = true; (async () => { try { setDetailLoading(true); const response = await api.get(`/hawans/${selectedHawan.slug}`); if (!alive) return; const next = response.data.data; setDetail(next); const panditResponse = await api.get(`/hawans/${next._id}/pandits`).catch(() => ({ data: { data: [] } })); if (alive) setPandits(panditResponse.data.data || []); } catch { if (alive) { setDetail(null); setPandits([]); } } finally { if (alive) setDetailLoading(false); } })(); return () => { alive = false; }; }, [selectedHawan?.slug]);
  const choosePurpose = (value) => { setSelectedPurpose(value); setCategory(value); setTimeout(() => document.querySelector(".hj-recommendation")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80); };
  const toggleMaterial = (id) => setMaterialStates((current) => ({ ...current, [id]: current[id] === "BUY" || !current[id] ? "READY" : current[id] === "READY" ? "PANDIT" : "BUY" }));
  const addMissing = () => { const products = (detail?.materials || []).filter((item) => (materialStates[item._id] || "BUY") === "BUY" && item.product?.stock > 0 && !cartItems.some((cartItem) => (cartItem._id || cartItem.id) === item.product._id)); products.forEach((item) => dispatch(addToCart(item.product))); setNotice(products.length ? `${products.length} उपलब्ध सामग्री कार्ट में जोड़ी गई।` : "कोई नई, स्टोर से जुड़ी सामग्री उपलब्ध नहीं है।"); };
  const toggleSafety = (item) => setSafety((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]);

  return <div className="hj-page">
    <header className="hj-hero"><div className="hj-hero-copy"><p>आपका हवन मार्गदर्शक</p><h1>अपने संकल्प से<br />सही हवन तक।</h1><span>अपना उद्देश्य चुनें, सामग्री तैयार करें और सत्यापित मार्गदर्शन के साथ सुरक्षित रूप से आगे बढ़ें।</span><div><a className="hj-primary" href="#sankalp">अपना संकल्प चुनें</a><a href="#all-hawans">सभी हवन देखें</a></div><ul><li>स्रोत-संदर्भित जानकारी</li><li>सुरक्षा पहले</li><li>प्रगति सुरक्षित</li><li>पंडित सहायता उपलब्ध</li></ul></div><HawanKundScene /></header>
    <main className="hj-journey"><div className="hj-thread" aria-hidden="true" />
      <section id="sankalp" className="hj-chapter"><SankalpMandala value={selectedPurpose} onChange={choosePurpose} /><label className="hj-search"><span>हवन या उद्देश्य खोजें</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="नाम या उद्देश्य लिखें" /></label></section>
      <section className="hj-chapter"><RecommendedHawan hawan={selectedHawan} pending={detailLoading} onDetailedRecommendation={() => document.querySelector("#sankalp")?.scrollIntoView({ behavior: "smooth" })} /></section>
      {loading ? <div className="hj-loading" role="status"><i />आपका हवन मार्ग तैयार हो रहा है…</div> : null}
      {error ? <div className="hj-error" role="alert"><p>{error}</p><button onClick={loadHawans}>पुनः प्रयास करें</button><Link to="/pandits">पंडित से सहायता लें</Link></div> : null}
      {detail ? <><SamagriMandala materials={detail.materials || []} states={materialStates} onToggle={toggleMaterial} onAddMissing={addMissing} /><SafetyCheckpoint checked={safety} onToggle={toggleSafety} guide={detail} /><GuidedPreview guide={detail} /><SourceLedger guide={detail} /><PanditAssistance pandits={pandits} guide={detail} /></> : !loading && !error ? <><div className="hj-pending"><h2>अन्य सत्यापित हवन गाइड शीघ्र उपलब्ध होंगे।</h2><p>असत्यापित मंत्र, विधि या धार्मिक दावा प्रकाशित नहीं किया गया है।</p></div><SafetyCheckpoint checked={safety} onToggle={toggleSafety} guide={null} /><GuidedPreview guide={null} /><SourceLedger guide={null} /><PanditAssistance pandits={[]} guide={null} /></> : null}
      {notice ? <p className="hj-notice" role="status">{notice}</p> : null}
      <section id="all-hawans" className="hj-catalogue"><div><p>सत्यापित संग्रह</p><h2>सभी उपलब्ध हवन</h2></div><div className="hj-category-rail" role="tablist" aria-label="हवन श्रेणियाँ">{categories.map((item) => <button key={item} role="tab" aria-selected={category === item} onClick={() => setCategory(item)}>{categoryLabels[item]}</button>)}</div>{!loading && !error && filtered.length ? <div className="hj-guide-rail">{filtered.map((hawan) => <article key={hawan._id}><span>{categoryLabels[hawan.category]}</span><h3>{hawan.title}</h3><p>{hawan.shortDescription}</p><Link to={`/hawan-guide/${hawan.slug}`}>गाइड देखें</Link></article>)}</div> : !loading && !error ? <p className="hj-no-results">इस चयन में सत्यापित हवन उपलब्ध नहीं है। दूसरा संकल्प चुनें।</p> : null}</section>
    </main>
  </div>;
}
