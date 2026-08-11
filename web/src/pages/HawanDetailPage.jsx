import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { HawanSourceAttribution } from "../components/HawanSourceAttribution";
import { clearLocalHawanProgress, emptyHawanProgress, loadLocalHawanProgress, progressPayload, saveLocalHawanProgress } from "../features/hawan/hawanProgress";
import "../styles/hawan-journey.css";

const safetyChecks = [
  "हवन केवल खुले या अच्छी तरह हवादार स्थान में करें।",
  "हवन कुंड को समतल और अग्निरोधी आधार पर रखें।",
  "पानी, रेत या उपयुक्त अग्निशामक साधन पास रखें।",
  "बच्चों और पालतू पशुओं को सुरक्षित दूरी पर रखें।",
  "ढीले वस्त्र, पर्दे और ज्वलनशील वस्तुएँ अग्नि से दूर रखें।",
  "जलती अग्नि को कभी अकेला न छोड़ें।",
  "धुएँ से परेशानी, श्वसन संबंधी समस्या या अस्वस्थता होने पर तुरंत रुकें।",
  "स्थानीय अग्नि-सुरक्षा नियमों का पालन करें और संदेह होने पर विशेषज्ञ सहायता लें।",
];
const difficultyLabels = { BEGINNER: "आरंभिक", INTERMEDIATE: "मध्यम", ADVANCED: "विशेषज्ञ सहायता उचित" };

function LoadingState() { return <div className="hg-page"><div className="hg-shell hg-state hg-detail-state"><strong>मार्गदर्शिका लोड हो रही है…</strong></div></div>; }

export default function HawanDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [hawan, setHawan] = useState(null);
  const [progress, setProgress] = useState(emptyHawanProgress());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [guided, setGuided] = useState(false);
  const saveTimer = useRef(null);

  const loadGuide = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await api.get(`/hawans/${slug}`);
      const guide = response.data?.data;
      setHawan(guide);
      let restored = loadLocalHawanProgress(guide._id);
      if (isAuthenticated) {
        try {
          const cloud = await api.get(`/hawans/${guide._id}/progress`);
          if (cloud.data?.data && String(cloud.data.data.updatedAt || "") > String(restored.updatedAt || "")) restored = { ...restored, ...cloud.data.data };
        } catch { setNotice("स्थानीय प्रगति उपलब्ध है। ऑनलाइन समन्वय अभी नहीं हो सका।"); }
      }
      setProgress(restored);
    } catch (requestError) { setError(requestError.message || "मार्गदर्शिका उपलब्ध नहीं है।"); }
    finally { setLoading(false); }
  }, [slug, isAuthenticated]);

  useEffect(() => { loadGuide(); }, [loadGuide]);
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const persist = useCallback((next, message = "") => {
    if (!hawan) return;
    const local = saveLocalHawanProgress(hawan._id, next, { slug: hawan.slug, title: hawan.title });
    setProgress(local);
    if (message) setNotice(message);
    if (isAuthenticated) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try { await api.post(`/hawans/${hawan._id}/progress`, progressPayload(local)); }
        catch { setNotice("प्रगति इस उपकरण पर सुरक्षित है; ऑनलाइन समन्वय बाद में फिर प्रयास करेगा।"); }
      }, 450);
    }
  }, [hawan, isAuthenticated]);

  const materials = hawan?.materials || [];
  const steps = hawan?.steps || [];
  const requiredMaterials = materials.filter((item) => item.required !== false);
  const requiredReady = requiredMaterials.every((item) => progress.readyMaterialIds?.includes(String(item._id)));
  const currentIndex = Math.min(progress.currentStepIndex || 0, Math.max(steps.length - 1, 0));
  const currentStep = steps[currentIndex];
  const completedCount = progress.completedStepIds?.length || 0;
  const percent = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const mantra = useMemo(() => hawan?.mantras?.find((item) => item.key === currentStep?.mantraKey && item.verificationStatus === "VERIFIED"), [hawan, currentStep]);

  const toggleMaterial = (id) => {
    const key = String(id); const current = progress.readyMaterialIds || [];
    persist({ ...progress, readyMaterialIds: current.includes(key) ? current.filter((item) => item !== key) : [...current, key] });
  };
  const toggleStep = () => {
    const key = String(currentStep._id); const current = progress.completedStepIds || [];
    persist({ ...progress, completedStepIds: current.includes(key) ? current.filter((item) => item !== key) : [...current, key] });
  };
  const startGuide = () => {
    if (!requiredReady || !safetyAccepted) return;
    const next = { ...progress, saved: true, safetyConfirmedAt: new Date().toISOString(), startedAt: progress.startedAt || new Date().toISOString() };
    persist(next, "सुरक्षा पुष्टि और प्रगति सुरक्षित कर दी गई है।"); setGuided(true);
  };
  const finish = async () => {
    if (completedCount !== steps.length) { setNotice("समाप्त करने से पहले सभी चरण पूरे चिह्नित करें।"); return; }
    const next = { ...progress, completedAt: new Date().toISOString(), saved: true };
    persist(next, "हवन मार्गदर्शिका पूर्ण चिह्नित की गई।"); setGuided(false);
    if (isAuthenticated) { try { await api.post(`/hawans/${hawan._id}/progress`, progressPayload(next)); await api.post(`/hawans/${hawan._id}/complete`); } catch { /* local completion remains safe */ } }
  };
  const restart = () => {
    if (!window.confirm("क्या आप इस हवन की पूरी सुरक्षित प्रगति मिटाकर दोबारा आरंभ करना चाहते हैं?")) return;
    clearLocalHawanProgress(hawan._id); setProgress(emptyHawanProgress()); setSafetyAccepted(false); setGuided(false); setNotice("स्थानीय प्रगति साफ कर दी गई है।");
  };

  if (loading) return <LoadingState />;
  if (error || !hawan) return <div className="hg-page"><div className="hg-shell hg-state hg-detail-state" role="alert"><strong>मार्गदर्शिका नहीं खुल सकी</strong><span>{error}</span><button type="button" onClick={loadGuide}>फिर प्रयास करें</button><Link to="/hawan-guide">हवन संग्रह पर लौटें</Link></div></div>;

  return <div className="hg-page">
    <header className="hg-detail-hero"><div className="hg-shell">
      <Link className="hg-back-link" to="/hawan-guide">← सभी हवन</Link><p className="hg-eyebrow">{hawan.category?.replaceAll("_", " ")}</p>
      <h1>{hawan.title}</h1><p className="hg-hero__copy">{hawan.shortDescription}</p>
      <dl className="hg-summary">
        <div><dt>अनुमानित समय</dt><dd>{hawan.durationMinutes} मिनट</dd></div><div><dt>स्तर</dt><dd>{difficultyLabels[hawan.difficulty] || hawan.difficulty}</dd></div>
        <div><dt>सहभागी</dt><dd>{hawan.participantRange?.min || 1}–{hawan.participantRange?.max || 1}</dd></div><div><dt>प्रगति</dt><dd>{percent}%</dd></div>
      </dl>
    </div></header>

    <main className="hg-shell hg-detail">
      {notice ? <div className="hg-notice" role="status">{notice}</div> : null}
      <section className="hg-panel"><div className="hg-section-heading"><div><p className="hg-eyebrow">तैयारी</p><h2>आरंभ करने से पहले</h2></div></div>
        {hawan.fullDescription ? <p className="hg-prose">{hawan.fullDescription}</p> : null}
        <dl className="hg-preparation">
          {hawan.locationRequirements ? <div><dt>स्थान</dt><dd>{hawan.locationRequirements}</dd></div> : null}
          {hawan.direction ? <div><dt>दिशा</dt><dd>{hawan.direction}</dd></div> : null}
          {hawan.clothingSuggestion ? <div><dt>वस्त्र</dt><dd>{hawan.clothingSuggestion}</dd></div> : null}
          {hawan.fastingInformation ? <div><dt>उपवास</dt><dd>{hawan.fastingInformation}</dd></div> : null}
        </dl>
        {hawan.prerequisites?.length ? <div className="hg-list-block"><h3>पूर्व तैयारी</h3><ul>{hawan.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
      </section>

      <section className="hg-panel" id="materials"><div className="hg-section-heading"><div><p className="hg-eyebrow">सामग्री सूची</p><h2>{progress.readyMaterialIds?.length || 0} / {materials.length} तैयार</h2></div><p>आवश्यक और वैकल्पिक सामग्री अलग-अलग चिह्नित है।</p></div>
        <div className="hg-materials">{materials.map((item) => { const id = String(item._id); const checked = progress.readyMaterialIds?.includes(id); return <label key={id} className={checked ? "is-checked" : ""}><input type="checkbox" checked={checked} onChange={() => toggleMaterial(id)} /><span><strong>{item.name}</strong><small>{item.required === false ? "वैकल्पिक" : "आवश्यक"}{item.quantityStatus === "NOT_STATED" ? " · मात्रा स्रोत में नहीं बताई गई" : item.quantity ? ` · ${item.quantity} ${item.unit || ""}` : ""}</small>{item.purpose || item.description ? <em>{item.purpose || item.description}</em> : null}</span></label>; })}</div>
        <p className={`hg-readiness ${requiredReady ? "is-ready" : ""}`}>{requiredReady ? "सभी आवश्यक सामग्री तैयार है।" : "आगे बढ़ने से पहले सभी आवश्यक सामग्री तैयार चिह्नित करें।"}</p>
      </section>

      <section className="hg-panel hg-safety"><div className="hg-section-heading"><div><p className="hg-eyebrow">अनिवार्य सुरक्षा सीमा</p><h2>अग्नि जलाने से पहले पुष्टि करें</h2></div></div>
        <ul>{safetyChecks.map((item) => <li key={item}>{item}</li>)}</ul>
        {hawan.safetyInstructions?.length ? <div className="hg-list-block"><h3>इस हवन के विशेष निर्देश</h3><ul>{hawan.safetyInstructions.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
        <label className="hg-safety-confirm"><input type="checkbox" checked={safetyAccepted} onChange={(event) => setSafetyAccepted(event.target.checked)} /><span>मैंने सुरक्षा निर्देश पढ़ लिए हैं, स्थान और आवश्यक सामग्री तैयार है, और मैं इनका पालन करूँगा/करूँगी।</span></label>
        <button className="hg-button hg-button--primary" type="button" disabled={!requiredReady || !safetyAccepted || !steps.length} onClick={startGuide}>{progress.startedAt ? "निर्देशित हवन जारी रखें" : "निर्देशित हवन आरंभ करें"}</button>
      </section>

      {guided && currentStep ? <section className="hg-panel hg-guided" aria-live="polite">
        <div className="hg-guided__head"><div><p className="hg-eyebrow">चरण {currentIndex + 1} / {steps.length}</p><h2>{currentStep.title}</h2></div><strong>{percent}% पूर्ण</strong></div>
        <div className="hg-progress"><span style={{ width: `${percent}%` }} /></div><p className="hg-prose">{currentStep.description}</p>
        {currentStep.safetyNote ? <div className="hg-step-warning"><strong>इस चरण की सावधानी</strong><span>{currentStep.safetyNote}</span></div> : null}
        {mantra ? <div className="hg-mantra"><p className="hg-eyebrow">सत्यापित मंत्र{currentStep.repetitionCount ? ` · ${currentStep.repetitionCount} बार` : ""}</p><strong>{mantra.devanagari}</strong>{mantra.hindiTransliteration ? <span>{mantra.hindiTransliteration}</span> : null}{mantra.hindiMeaning || mantra.meaning ? <p>{mantra.hindiMeaning || mantra.meaning}</p> : null}{mantra.audioUrl && mantra.audioVerificationStatus === "VERIFIED" ? <audio controls preload="metadata" src={mantra.audioUrl}>आपका ब्राउज़र ध्वनि नहीं चला सकता।</audio> : null}</div> : null}
        <div className="hg-guided__controls">
          <button type="button" disabled={currentIndex === 0} onClick={() => persist({ ...progress, currentStepIndex: currentIndex - 1 })}>पिछला चरण</button>
          <button type="button" className="hg-button--primary" onClick={toggleStep}>{progress.completedStepIds?.includes(String(currentStep._id)) ? "पूर्ण चिह्न हटाएँ" : "चरण पूर्ण चिह्नित करें"}</button>
          <button type="button" disabled={currentIndex === steps.length - 1} onClick={() => persist({ ...progress, currentStepIndex: currentIndex + 1 })}>अगला चरण</button>
        </div>
        <div className="hg-guided__secondary"><button type="button" onClick={() => { persist({ ...progress, saved: true }, "प्रगति सुरक्षित है। आप बाद में यहीं से जारी रख सकते हैं।"); setGuided(false); }}>अभी रोकें, बाद में जारी रखें</button>{currentIndex === steps.length - 1 ? <button type="button" disabled={completedCount !== steps.length} onClick={finish}>हवन मार्गदर्शिका पूर्ण करें</button> : null}</div>
      </section> : null}

      {progress.completedAt ? <section className="hg-panel hg-complete"><p className="hg-eyebrow">पूर्ण</p><h2>यह हवन मार्गदर्शिका पूरी हुई</h2><p>आपकी पूर्णता इस उपकरण पर सुरक्षित है{isAuthenticated ? " और खाते से समन्वित की जा रही है" : ""}।</p><button type="button" onClick={restart}>दोबारा आरंभ करें</button></section> : null}

      <HawanSourceAttribution source={hawan.source} status={hawan.verificationStatus} />
      {hawan.panditRecommended ? <section className="hg-panel hg-pandit-help"><div><p className="hg-eyebrow">मानवीय सहायता</p><h2>इस हवन में पंडित मार्गदर्शन उचित है</h2><p>मंत्रोच्चार, क्रम या अग्नि-सुरक्षा को लेकर संदेह हो तो योग्य पंडित से पुष्टि करें।</p></div><Link className="hg-button hg-button--outline" to={`/pandits?hawan=${encodeURIComponent(hawan.title)}`}>पंडित सहायता देखें</Link></section> : null}
    </main>
  </div>;
}
