import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, ChevronDown, Clock3, Flame, Pause, Play, Share2, ShieldCheck, ShoppingCart, Volume2, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "../components/Button";
import { RitualCounter } from "../components/RitualCounter";
import { SafetyConfirmation } from "../components/SafetyConfirmation";
import { addToCart } from "../features/cart/cartSlice";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { HawanSourceAttribution } from "../components/HawanSourceAttribution";

const localKey = (id) => `digipandit_hawan_progress_${id}`;

export default function HawanDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hawan, setHawan] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [pandits, setPandits] = useState([]);
  const [muhurat, setMuhurat] = useState(null);
  const [cityQuery, setCityQuery] = useState("New Delhi, DL");
  const [cityOptions, setCityOptions] = useState([]);
  const [muhuratLoading, setMuhuratLoading] = useState(false);
  const [progress, setProgress] = useState({ completedStepIds: [], readyMaterialIds: [], currentStepIndex: 0, mantraCounts: {}, offeringCount: 0, saved: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showSafety, setShowSafety] = useState(false);
  const [guided, setGuided] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem("digipandit_hawan_language") || "hi-IN");
  const [speaking, setSpeaking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioLoop, setAudioLoop] = useState(false);
  const saveTimer = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const detailResponse = await api.get(`/hawans/${slug}`);
        const guide = detailResponse.data.data;
        setHawan(guide);
        const [materialResponse, panditResponse, muhuratResponse] = await Promise.all([
          api.get(`/hawans/${guide._id}/materials`),
          api.get(`/hawans/${guide._id}/pandits`),
          api.get(`/hawans/${guide._id}/muhurat`, { params: { latitude: 28.6139, longitude: 77.209, location: "New Delhi, DL" } }),
        ]);
        setMaterials(materialResponse.data.data || []);
        setPandits(panditResponse.data.data || []);
        setMuhurat(muhuratResponse.data.data);
        const stored = JSON.parse(localStorage.getItem(localKey(guide._id)) || "null");
        if (stored) setProgress((current) => ({ ...current, ...stored }));
        if (isAuthenticated) {
          const savedResponse = await api.get(`/hawans/${guide._id}/progress`);
          if (savedResponse.data.data) setProgress((current) => ({ ...current, ...savedResponse.data.data }));
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, isAuthenticated]);

  const step = hawan?.steps?.[progress.currentStepIndex];
  const mantra = hawan?.mantras?.find((item) => item.key === step?.mantraKey);
  const readyCount = progress.readyMaterialIds?.length || 0;
  const completedCount = progress.completedStepIds?.length || 0;
  const overallPercent = hawan?.steps?.length ? Math.round((completedCount / hawan.steps.length) * 100) : 0;

  const persist = (next) => {
    if (!hawan) return;
    localStorage.setItem(localKey(hawan._id), JSON.stringify(next));
    clearTimeout(saveTimer.current);
    if (isAuthenticated) {
      saveTimer.current = window.setTimeout(() => {
        api.post(`/hawans/${hawan._id}/progress`, next).catch(() => setNotice("Progress is saved on this device; cloud sync will retry when the connection returns."));
      }, 500);
    }
  };
  const updateProgress = (patch) => setProgress((current) => {
    const next = { ...current, ...patch };
    persist(next);
    return next;
  });

  useEffect(() => {
    if (!step) return;
    setTimer(step.durationSeconds || 0);
    setTimerRunning(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [step?._id]);

  useEffect(() => {
    if (!timerRunning || timer <= 0) return undefined;
    const id = window.setInterval(() => setTimer((value) => {
      if (value <= 1) {
        window.clearInterval(id);
        setTimerRunning(false);
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, timer]);

  useEffect(() => () => {
    clearTimeout(saveTimer.current);
    window.speechSynthesis?.cancel();
  }, []);

  const speak = () => setNotice("Narration is unavailable until a verified mantra audio recording is attached.");

  const toggleMaterial = (id) => {
    const current = progress.readyMaterialIds || [];
    updateProgress({ readyMaterialIds: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] });
  };
  const markStep = () => {
    const current = progress.completedStepIds || [];
    const id = step._id;
    updateProgress({ completedStepIds: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] });
  };
  const addMissing = () => {
    const ready = new Set(progress.readyMaterialIds || []);
    const products = materials.filter((item) => !ready.has(item._id) && item.product?.stock > 0);
    products.forEach((item) => dispatch(addToCart(item.product)));
    setNotice(products.length ? `${products.length} available missing items added to cart.` : "No linked in-stock products are currently available. You can still use the checklist.");
  };
  const startGuide = () => {
    if (!progress.safetyConfirmedAt) return setShowSafety(true);
    setGuided(true);
  };
  const confirmSafety = () => {
    const timestamp = new Date().toISOString();
    updateProgress({ safetyConfirmedAt: timestamp, safetyConfirmed: true });
    setShowSafety(false);
    setGuided(true);
  };
  const finish = async () => {
    updateProgress({ completedAt: new Date().toISOString() });
    if (isAuthenticated) await api.post(`/hawans/${hawan._id}/complete`).catch((requestError) => setNotice(requestError.message));
    setGuided(false);
    setNotice("Hawan guide completed. This digital record is a personal souvenir, not a certificate of religious authority.");
  };
  const share = async () => {
    const payload = { title: hawan.title, text: hawan.shortDescription, url: window.location.href };
    if (navigator.share) await navigator.share(payload);
    else {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("Guide link copied.");
    }
  };

  const searchCities = async (value) => {
    setCityQuery(value);
    if (value.trim().length < 2) return setCityOptions([]);
    const response = await api.get("/astrology/cities", { params: { q: value } });
    setCityOptions((response.data.data || []).slice(0, 6));
  };

  const selectMuhuratCity = async (city) => {
    setCityQuery(`${city.name}, ${city.stateCode}`);
    setCityOptions([]);
    try {
      setMuhuratLoading(true);
      const response = await api.get(`/hawans/${hawan._id}/muhurat`, {
        params: { latitude: city.latitude, longitude: city.longitude, location: `${city.name}, ${city.stateCode}` },
      });
      setMuhurat(response.data.data);
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setMuhuratLoading(false);
    }
  };

  if (loading) return <div className="container-shell py-20"><div className="h-[32rem] animate-pulse rounded-[36px] bg-brand-blush" /></div>;
  if (error || !hawan) return <div className="container-shell py-20"><div className="rounded-[32px] bg-white p-8 shadow-soft"><h1 className="text-4xl">Guide unavailable</h1><p className="mt-3 text-brand-ink/65">{error || "This guide may be unpublished or archived."}</p><Link to="/hawan-guide"><Button className="mt-6">Back to Hawan Guide</Button></Link></div></div>;

  return (
    <div className="pb-28">
      <section className="bg-hero-pattern">
        <div className="container-shell py-12 lg:py-20">
          <Link to="/hawan-guide" className="inline-flex items-center gap-2 text-sm font-bold text-brand-maroon"><ArrowLeft className="h-4 w-4" />All Hawans</Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="eyebrow">{hawan.category.replaceAll("_", " ")} ritual guide</p>
              <h1 className="mt-4 text-5xl leading-none md:text-7xl">{hawan.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-ink/70">{hawan.shortDescription}</p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-ink/60">{hawan.fullDescription}</p>
              <div className="mt-5 max-w-3xl"><HawanSourceAttribution source={hawan.source} status={hawan.verificationStatus} /></div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button onClick={startGuide}><Flame className="mr-2 h-4 w-4" />Start guided mode</Button>
                <Button variant="secondary" onClick={() => updateProgress({ saved: !progress.saved })}><Bookmark className="mr-2 h-4 w-4" />{progress.saved ? "Saved" : "Save"}</Button>
                <Button variant="secondary" onClick={share}><Share2 className="mr-2 h-4 w-4" />Share</Button>
              </div>
              {!isAuthenticated ? <p className="mt-4 text-sm text-brand-ink/60">Progress stays on this device. <Link to="/login" className="font-bold text-brand-maroon">Login for cloud sync.</Link></p> : null}
            </div>
            <div className="rounded-[32px] bg-brand-ink p-7 text-white shadow-lift">
              <div className="grid grid-cols-2 gap-4">
                {[["Duration", `${hawan.durationMinutes} min`], ["Difficulty", hawan.difficulty], ["Materials", materials.length], ["Approx. cost", `₹${hawan.estimatedCostRange.min}–₹${hawan.estimatedCostRange.max}`], ["Participants", `${hawan.participantRange.min}–${hawan.participantRange.max}`], ["Pandit", hawan.panditRecommended ? "Recommended" : "Optional"]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/8 p-4"><p className="text-xs uppercase tracking-wider text-brand-gold">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>)}
              </div>
              <div className="mt-5"><div className="flex justify-between text-sm"><span>Guide progress</span><strong>{overallPercent}%</strong></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-brand-gold transition-all" style={{ width: `${overallPercent}%` }} /></div></div>
            </div>
          </div>
        </div>
      </section>

      {notice ? <div className="container-shell pt-6"><div role="status" className="rounded-2xl border border-brand-gold/30 bg-amber-50 px-5 py-4 text-sm text-amber-950">{notice}</div></div> : null}

      <main className="container-shell space-y-12 py-12">
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="surface-card p-6"><p className="eyebrow">Overview</p><h2 className="mt-3 text-3xl">Prepare with context</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="font-bold">Direction</dt><dd className="mt-1 text-brand-ink/65">{hawan.direction}</dd></div><div><dt className="font-bold">Clothing</dt><dd className="mt-1 text-brand-ink/65">{hawan.clothingSuggestion}</dd></div><div><dt className="font-bold">Fasting</dt><dd className="mt-1 text-brand-ink/65">{hawan.fastingInformation}</dd></div></dl></div>
          <div className="surface-card p-6 lg:col-span-2"><p className="eyebrow">Traditional benefits</p><h2 className="mt-3 text-3xl">Respectful, non-guaranteed guidance</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{hawan.benefits.map((benefit) => <div key={benefit} className="flex gap-3 rounded-2xl bg-brand-mist p-4 text-sm leading-6"><Check className="mt-1 h-4 w-4 shrink-0 text-brand-forest" />{benefit}</div>)}</div></div>
        </section>

        <section id="materials" className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><p className="eyebrow">Interactive checklist</p><h2 className="mt-3 text-4xl">Materials: {readyCount} of {materials.length} ready</h2><p className="mt-2 text-sm text-brand-ink/65">Prices and stock come from the DigiPandit store; no guide price is hard-coded.</p></div>
            <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => updateProgress({ readyMaterialIds: materials.map((item) => item._id) })}>Mark all ready</Button><Button onClick={addMissing}><ShoppingCart className="mr-2 h-4 w-4" />Add missing items</Button></div>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {materials.map((item) => {
              const checked = progress.readyMaterialIds?.includes(item._id);
              return <button key={item._id} type="button" onClick={() => toggleMaterial(item._id)} className={`flex gap-4 rounded-[24px] border p-5 text-left ${checked ? "border-brand-forest bg-emerald-50" : "border-brand-sand bg-white"}`}><span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${checked ? "bg-brand-forest text-white" : "border border-brand-sand"}`}>{checked ? <Check className="h-4 w-4" /> : null}</span><span className="min-w-0"><strong className="block">{item.name} · {item.quantityStatus === "NOT_STATED" ? "Quantity not stated" : `${item.quantity} ${item.unit}`}</strong><span className="mt-1 block text-sm leading-6 text-brand-ink/60">{item.purpose || item.description}</span><span className="mt-2 block text-xs font-bold text-brand-clay">{item.required ? "Required" : "Optional"} · {item.product ? item.product.stock > 0 ? `₹${item.product.price} · In stock` : "Out of stock" : "Store match unavailable"}</span></span></button>;
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Step-by-step ritual</p><h2 className="mt-3 text-4xl">{step.title}</h2></div><span className="rounded-full bg-brand-mist px-4 py-2 text-sm font-bold">{progress.currentStepIndex + 1}/{hawan.steps.length}</span></div>
            <p className="mt-5 text-base leading-8 text-brand-ink/70">{step.description}</p>
            {step.safetyNote ? <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><ShieldCheck className="h-5 w-5 shrink-0" />{step.safetyNote}</div> : null}
            {mantra ? <div className="mt-6 rounded-[26px] bg-brand-blush p-6"><p className="eyebrow">Associated mantra · {step.repetitionCount || mantra.defaultRepetitionCount} repetitions</p><p className="mt-3 text-2xl font-bold leading-10">{mantra.devanagari}</p><p className="mt-3 text-sm leading-7 text-brand-ink/70">{mantra.englishTransliteration}</p><p className="mt-3 text-sm italic text-brand-ink/60">{mantra.meaning}</p>{mantra.audioUrl ? <div className="mt-5 rounded-2xl bg-white p-4"><audio ref={audioRef} className="w-full" controls preload="metadata" loop={audioLoop} src={mantra.audioUrl}>Your browser does not support mantra audio.</audio><div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><label className="font-bold">Speed <select value={audioSpeed} onChange={(event) => { const speed=Number(event.target.value); setAudioSpeed(speed); if(audioRef.current) audioRef.current.playbackRate=speed; }} className="ml-2 rounded-lg border border-brand-sand px-2 py-1">{[0.75,1,1.25,1.5].map((speed)=><option key={speed} value={speed}>{speed}×</option>)}</select></label><label className="font-bold"><input type="checkbox" checked={audioLoop} onChange={(event)=>setAudioLoop(event.target.checked)} /> Repeat audio</label></div></div> : <button type="button" onClick={() => speak(`${step.description}. ${mantra.devanagari}`)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-maroon">{speaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{speaking ? "Stop narration" : "Hindi voice fallback"}</button>}</div> : null}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" disabled={progress.currentStepIndex === 0} onClick={() => updateProgress({ currentStepIndex: Math.max(0, progress.currentStepIndex - 1) })}><ArrowLeft className="mr-2 h-4 w-4" />Previous</Button>
              <Button variant={progress.completedStepIds?.includes(step._id) ? "secondary" : "primary"} onClick={markStep}>{progress.completedStepIds?.includes(step._id) ? "Completed" : "Mark complete"}</Button>
              <Button variant="secondary" disabled={progress.currentStepIndex === hawan.steps.length - 1} onClick={() => updateProgress({ currentStepIndex: Math.min(hawan.steps.length - 1, progress.currentStepIndex + 1) })}>Next<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
          <div className="space-y-5">
            <RitualCounter label="Mantra counter" target={step.repetitionCount || mantra?.defaultRepetitionCount || 0} initial={progress.mantraCounts?.[step._id] || 0} onChange={(value) => updateProgress({ mantraCounts: { ...progress.mantraCounts, [step._id]: value } })} />
            <div className="surface-card p-5"><p className="eyebrow">Step timer</p><p className="mt-3 text-4xl font-bold">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</p><div className="mt-4 flex gap-3"><Button onClick={() => setTimerRunning((value) => !value)}>{timerRunning ? "Pause" : "Start"}</Button><Button variant="secondary" onClick={() => { setTimer(step.durationSeconds || 0); setTimerRunning(false); }}>Reset</Button></div></div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-7">
            <p className="eyebrow">Location-based Panchang</p><h2 className="mt-3 text-3xl">Calculated Muhurat windows</h2>
            <div className="relative mt-5">
              <label className="text-sm font-bold" htmlFor="muhurat-city">City</label>
              <input id="muhurat-city" value={cityQuery} onChange={(event) => searchCities(event.target.value)} className="mt-2 min-h-11 w-full rounded-2xl border border-brand-sand px-4" autoComplete="off" />
              {cityOptions.length ? <div className="absolute z-10 mt-2 w-full rounded-2xl border border-brand-sand bg-white p-2 shadow-lift">{cityOptions.map((city) => <button key={`${city.name}-${city.latitude}`} type="button" onClick={() => selectMuhuratCity(city)} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-brand-mist">{city.name}, {city.stateCode}</button>)}</div> : null}
            </div>
            {muhuratLoading ? <p className="mt-4 text-sm">Calculating astronomical timings…</p> : muhurat ? <div className="mt-5">
              <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-brand-mist p-3"><strong>Tithi</strong><span className="mt-1 block text-brand-ink/65">{muhurat.tithi}</span></div><div className="rounded-2xl bg-brand-mist p-3"><strong>Nakshatra</strong><span className="mt-1 block text-brand-ink/65">{muhurat.nakshatra}</span></div><div className="rounded-2xl bg-brand-mist p-3"><strong>Sunrise</strong><span className="mt-1 block text-brand-ink/65">{muhurat.sunrise}</span></div><div className="rounded-2xl bg-amber-50 p-3"><strong>Rahu Kaal</strong><span className="mt-1 block text-amber-900">{muhurat.rahuKaal?.start}–{muhurat.rahuKaal?.end}</span></div></div>
              <div className="mt-4 space-y-2">{muhurat.timings?.map((slot) => <div key={slot.label} className="flex justify-between rounded-xl border border-brand-sand px-4 py-3 text-sm"><strong>{slot.label}</strong><span>{slot.start}–{slot.end}</span></div>)}</div>
              <p className="mt-4 text-xs leading-5 text-brand-ink/55">{muhurat.calculation}</p><p className="mt-2 text-xs leading-5 text-brand-ink/55">{muhurat.disclaimer}</p>
            </div> : null}
          </div>
          <div className="surface-card p-7"><p className="eyebrow">Available ritual experts</p><h2 className="mt-3 text-3xl">{pandits.length ? `${pandits.length} matching Pandits` : "No exact specialist online"}</h2><p className="mt-4 text-sm leading-7 text-brand-ink/65">{pandits.length ? "Review language, service mode, experience, price, and availability before booking." : "Broaden the search and confirm ritual qualifications directly."}</p><Link to={`/pandits?serviceType=HAWAN&hawan=${encodeURIComponent(hawan.title)}&materials=${encodeURIComponent(materials.filter((item) => !progress.readyMaterialIds?.includes(item._id)).map((item) => item.name).join(", "))}&language=${encodeURIComponent(language)}`}><Button className="mt-5">Book assistance</Button></Link></div>
        </section>

        <section className="surface-card p-7"><p className="eyebrow">Frequently asked questions</p><h2 className="mt-3 text-4xl">Practical answers</h2><div className="mt-6 divide-y divide-brand-sand">{hawan.faqs.map((faq) => <details key={faq.question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">{faq.question}<ChevronDown className="h-5 w-5 transition group-open:rotate-180" /></summary><p className="mt-3 max-w-4xl text-sm leading-7 text-brand-ink/65">{faq.answer}</p></details>)}</div></section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-sand bg-white/95 p-3 backdrop-blur md:hidden"><Button onClick={startGuide} className="w-full"><Flame className="mr-2 h-4 w-4" />Resume guided mode · {overallPercent}%</Button></div>
      {showSafety ? <SafetyConfirmation instructions={hawan.safetyInstructions} onConfirm={confirmSafety} onClose={() => setShowSafety(false)} /> : null}
      {guided ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-brand-ink text-white">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="text-xs uppercase tracking-wider text-brand-gold">{hawan.title}</p><p className="mt-1 text-sm text-white/60">Step {progress.currentStepIndex + 1} of {hawan.steps.length} · {overallPercent}% complete</p></div><button type="button" onClick={() => window.confirm("Exit guided mode? Your progress is saved.") && setGuided(false)} className="rounded-xl bg-white/10 p-3" aria-label="Exit guided mode"><X className="h-5 w-5" /></button></header>
          <div className="h-1 bg-white/10"><div className="h-full bg-brand-gold" style={{ width: `${((progress.currentStepIndex + 1) / hawan.steps.length) * 100}%` }} /></div>
          <main className="flex flex-1 items-center overflow-y-auto px-5 py-10"><div className="mx-auto w-full max-w-3xl text-center"><p className="text-sm font-bold uppercase tracking-[.22em] text-brand-gold">Step {progress.currentStepIndex + 1}</p><h2 className="mt-5 text-5xl leading-none sm:text-7xl">{step.title}</h2><p className="mx-auto mt-7 max-w-2xl text-lg leading-9 text-white/72">{step.description}</p>{step.safetyNote ? <p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">{step.safetyNote}</p> : null}{mantra ? <div className="mt-8"><p className="text-2xl leading-10 text-brand-gold">{mantra.devanagari}</p><button type="button" onClick={() => speak(`${step.description}. ${mantra.devanagari}`)} className="mt-5 rounded-full bg-white/10 px-5 py-3 text-sm font-bold">{speaking ? "Stop voice" : "Play Hindi voice"}</button></div> : null}</div></main>
          <footer className="border-t border-white/10 p-4"><div className="mx-auto flex max-w-3xl items-center justify-between gap-3"><Button variant="secondary" disabled={progress.currentStepIndex === 0} onClick={() => updateProgress({ currentStepIndex: progress.currentStepIndex - 1 })}>Previous</Button><Button onClick={markStep}>{progress.completedStepIds?.includes(step._id) ? "Completed" : "Mark complete"}</Button>{progress.currentStepIndex < hawan.steps.length - 1 ? <Button variant="secondary" onClick={() => updateProgress({ currentStepIndex: progress.currentStepIndex + 1 })}>Next</Button> : <Button className="bg-brand-gold text-brand-ink" onClick={finish}>Finish</Button>}</div></footer>
        </div>
      ) : null}
    </div>
  );
}
