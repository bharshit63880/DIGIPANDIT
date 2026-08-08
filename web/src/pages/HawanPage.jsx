import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Flame, HeartHandshake, Search, ShieldCheck, ShoppingBasket, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { HawanCard } from "../components/HawanCard";
import { SectionTitle } from "../components/SectionTitle";
import { api } from "../lib/api";

const categories = ["ALL", "POPULAR", "CAREER", "MARRIAGE", "HEALTH", "WEALTH", "EDUCATION", "FAMILY", "GRAH_DOSH", "SPIRITUAL", "PROPERTY", "BUSINESS"];
const categoryLabels = {
  ALL: "सभी", POPULAR: "लोकप्रिय", CAREER: "करियर", MARRIAGE: "विवाह", HEALTH: "स्वास्थ्य",
  WEALTH: "समृद्धि", EDUCATION: "शिक्षा", FAMILY: "परिवार", GRAH_DOSH: "ग्रह दोष",
  SPIRITUAL: "आध्यात्मिक", PROPERTY: "संपत्ति", BUSINESS: "व्यवसाय",
};
const pendingGuideCards = [
  { category: "POPULAR", title: "लोकप्रिय हवन गाइड" }, { category: "CAREER", title: "करियर हेतु हवन गाइड" },
  { category: "MARRIAGE", title: "विवाह हेतु हवन गाइड" }, { category: "HEALTH", title: "स्वास्थ्य हेतु हवन गाइड" },
  { category: "WEALTH", title: "समृद्धि हेतु हवन गाइड" }, { category: "EDUCATION", title: "शिक्षा हेतु हवन गाइड" },
  { category: "FAMILY", title: "पारिवारिक शांति हवन गाइड" }, { category: "GRAH_DOSH", title: "ग्रह दोष हवन गाइड" },
  { category: "PROPERTY", title: "संपत्ति हेतु हवन गाइड" }, { category: "BUSINESS", title: "व्यवसाय हेतु हवन गाइड" },
];
const purposes = ["Remove obstacles", "Career", "Health", "Marriage", "Education", "Wealth", "Business", "Property", "Family peace", "Grah Dosh", "Spiritual growth"];
const wizardQuestions = [
  { key: "purpose", label: "आपका मुख्य उद्देश्य क्या है?", options: purposes },
  { key: "timeMinutes", label: "आपके पास कितना समय है?", options: [{ label: "60 मिनट तक", value: 60 }, { label: "90 मिनट तक", value: 90 }, { label: "2 घंटे या अधिक", value: 180 }] },
  { key: "budget", label: "Approximate material budget?", options: [{ label: "Under ₹1,500", value: 1500 }, { label: "Under ₹3,500", value: 3500 }, { label: "Flexible", value: 10000 }] },
  { key: "needsPandit", label: "क्या आपको विशेषज्ञ सहायता चाहिए?", options: [{ label: "हाँ, पंडित की सलाह दें", value: true }, { label: "केवल आवश्यक होने पर", value: false }] },
];

function PendingGuideCard({ guide }) {
  return <article className="flex h-full min-h-[360px] flex-col overflow-hidden rounded-[28px] border border-brand-sand bg-white shadow-soft">
    <div className="flex min-h-40 items-end bg-gradient-to-br from-brand-ink via-brand-maroon to-brand-clay p-6 text-white"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">{categoryLabels[guide.category]}</p><h3 className="mt-2 text-3xl font-bold">{guide.title}</h3></div></div>
    <div className="flex flex-1 flex-col p-6"><span className="inline-flex w-fit rounded-full bg-brand-blush px-3 py-2 text-xs font-bold text-brand-maroon">विशेषज्ञ सत्यापन लंबित</span><p className="mt-5 text-sm leading-7 text-brand-ink/70">इस श्रेणी की स्रोत-संदर्भित सामग्री की विशेषज्ञ जाँच जारी है। सत्यापन के बाद ही विधि, सामग्री या मंत्र प्रकाशित किए जाएँगे।</p><div className="mt-auto rounded-2xl border border-brand-sand bg-brand-cream px-4 py-3 text-sm font-semibold text-brand-ink/70">अभी केवल सूचना उपलब्ध है</div></div>
  </article>;
}

export default function HawanPage() {
  const [hawans, setHawans] = useState([]);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [wizardLoading, setWizardLoading] = useState(false);

  const loadHawans = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/hawans", { params: { limit: 40 } });
      setHawans(response.data.data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHawans(); }, []);

  const filtered = useMemo(() => hawans.filter((hawan) => {
    const categoryMatch = category === "ALL" || hawan.category === category;
    const term = search.trim().toLowerCase();
    const searchMatch = !term || `${hawan.title} ${hawan.shortDescription} ${(hawan.purposes || []).join(" ")}`.toLowerCase().includes(term);
    return categoryMatch && searchMatch;
  }), [hawans, category, search]);

  const visiblePendingGuides = useMemo(() => {
    if (search.trim()) return [];
    if (category === "ALL") return pendingGuideCards;
    return pendingGuideCards.filter((guide) => guide.category === category);
  }, [category, search]);
  const showHorizontalGuideRail = category === "ALL" && !search.trim();

  const answerQuestion = async (value) => {
    const nextAnswers = { ...answers, [wizardQuestions[wizardStep].key]: value };
    setAnswers(nextAnswers);
    if (wizardStep < wizardQuestions.length - 1) return setWizardStep((current) => current + 1);
    try {
      setWizardLoading(true);
      const response = await api.post("/hawans/recommend", nextAnswers);
      setRecommendations(response.data.data || []);
    } catch (requestError) {
      setError(requestError.message);
      setWizardOpen(false);
    } finally {
      setWizardLoading(false);
    }
  };

  const resetWizard = () => {
    setWizardOpen(false);
    setWizardStep(0);
    setAnswers({});
    setRecommendations([]);
  };

  return (
    <div className="dp-theme dp-hawan-theme pb-20">
      <section className="relative overflow-hidden bg-hero-pattern">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="self-center">
            <p className="eyebrow">आपका हवन मार्गदर्शक</p>
            <h1 className="mt-5 max-w-3xl text-5xl leading-[.98] text-brand-ink md:text-7xl">हर हवन को स्पष्टता और विश्वास के साथ करें।</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-ink/70">स्रोत-संदर्भित गाइड देखें, सामग्री तैयार करें, सत्यापित चरणों का पालन करें और जरूरत पड़ने पर योग्य पंडित से सहायता लें।</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setWizardOpen(true)}>सही हवन खोजें <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <a href="#all-hawans"><Button variant="secondary">सभी हवन देखें</Button></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-brand-ink/65">
              {["स्रोत का उल्लेख", "सामग्री सूची", "केवल सत्यापित ऑडियो", "प्रगति सहेजी जाती है"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-forest" />{item}</span>)}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Flame, "चरण-दर-चरण मार्गदर्शन", "हर बार एक स्पष्ट अनुष्ठान निर्देश।"],
              [ShoppingBasket, "स्मार्ट सामग्री सूची", "जो उपलब्ध है उसे चिह्नित करें और केवल बची सामग्री खरीदें।"],
              [ShieldCheck, "ज़रूरी सुरक्षा", "गाइडेड मोड से पहले अग्नि-सुरक्षा की तैयारी।"],
              [HeartHandshake, "पंडित सहायता", "जरूरत पड़ने पर विशेषज्ञ सहायता लें।"],
            ].map(([Icon, title, text]) => (
              <div key={title} className="surface-card p-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-blush text-brand-maroon"><Icon className="h-6 w-6" /></div>
                <h2 className="mt-5 text-2xl text-brand-ink">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-brand-ink/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {recommendations.length ? (
        <section className="container-shell py-16">
          <SectionTitle eyebrow="आपके लिए सुझाव" title="विचार करने योग्य तीन विकल्प" description="सुझाव आपकी पसंद और प्रचलित परंपरा पर आधारित हैं; ये किसी परिणाम की गारंटी नहीं देते।" />
          <div className="mt-9 grid gap-6 lg:grid-cols-3">{recommendations.map((hawan) => <HawanCard key={hawan._id} hawan={hawan} reason={hawan.recommendationReason} />)}</div>
          <Button variant="ghost" onClick={resetWizard} className="mt-6">सुझाव हटाएँ</Button>
        </section>
      ) : null}

      <section id="all-hawans" className="container-shell scroll-mt-24 py-16">
        <SectionTitle eyebrow="हवन संग्रह" title="अपने उद्देश्य के अनुसार हवन चुनें" description="हर गाइड में क्रमबद्ध चरण, संक्षिप्त जानकारी, सुरक्षा संकेत और व्यावहारिक तैयारी दी गई है।" />
        <div className="mt-8 flex flex-col gap-4">
          <label className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-clay" />
            <span className="sr-only">हवन खोजें</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="हवन या उद्देश्य से खोजें" className="min-h-12 w-full rounded-2xl border border-brand-sand bg-white pl-12 pr-4 outline-none focus:border-brand-clay" />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Hawan categories">
            {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${category === item ? "bg-brand-maroon text-white" : "border border-brand-sand bg-white text-brand-ink"}`}>{categoryLabels[item]}</button>)}
          </div>
        </div>
        {loading ? <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <div key={item} className="h-96 animate-pulse rounded-[28px] bg-brand-blush" />)}</div> : null}
        {error ? <div className="mt-10 rounded-[28px] border border-red-200 bg-red-50 p-7"><h3 className="text-2xl text-red-950">गाइड लोड नहीं हो सके</h3><p className="mt-2 text-sm text-red-800">{error}</p><Button onClick={loadHawans} className="mt-5">फिर से कोशिश करें</Button></div> : null}
        {!loading && !error && (filtered.length || visiblePendingGuides.length) ? (
          <div className={showHorizontalGuideRail ? "mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-5" : "mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"}>
            {filtered.map((hawan) => <div key={hawan._id} className={showHorizontalGuideRail ? "w-[320px] shrink-0 snap-start" : ""}><HawanCard hawan={hawan} /></div>)}
            {visiblePendingGuides.map((guide) => <div key={guide.category} className={showHorizontalGuideRail ? "w-[320px] shrink-0 snap-start" : ""}><PendingGuideCard guide={guide} /></div>)}
          </div>
        ) : null}
        {!loading && !error && !filtered.length ? <div className="mt-10 rounded-[28px] bg-white p-8 text-center shadow-soft"><Sparkles className="mx-auto h-8 w-8 text-brand-gold" /><h3 className="mt-4 text-2xl">मिलता-जुलता हवन नहीं मिला</h3><p className="mt-2 text-sm text-brand-ink/65">दूसरा उद्देश्य चुनें या खोज साफ़ करें।</p></div> : null}
      </section>

      <section className="container-shell py-8">
        <div className="rounded-[36px] bg-brand-ink p-8 text-white md:flex md:items-center md:justify-between md:p-12">
          <div><p className="eyebrow !text-brand-gold">Professional ritual support</p><h2 className="mt-3 text-4xl">Not sure about fire, mantras, or sequence?</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">Choose a verified Pandit for home visit or ask for online guidance. Never continue a fire ritual when you feel unsafe.</p></div>
          <Link to="/pandits?category=PUJA" className="mt-6 inline-flex md:mt-0"><Button className="bg-brand-gold text-brand-ink hover:bg-white">Book a Pandit</Button></Link>
        </div>
      </section>

      {wizardOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-lift sm:p-8">
            <div className="flex items-center justify-between"><p className="eyebrow">Question {wizardStep + 1} of {wizardQuestions.length}</p><button type="button" onClick={resetWizard} className="text-sm font-bold text-brand-maroon">Close</button></div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-brand-mist"><div className="h-full bg-brand-gold transition-all" style={{ width: `${((wizardStep + 1) / wizardQuestions.length) * 100}%` }} /></div>
            <h2 id="wizard-title" className="mt-7 text-3xl text-brand-ink">{wizardQuestions[wizardStep].label}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {wizardQuestions[wizardStep].options.map((option) => {
                const label = typeof option === "string" ? option : option.label;
                const value = typeof option === "string" ? option : option.value;
                return <button key={label} type="button" disabled={wizardLoading} onClick={() => answerQuestion(value)} className="rounded-2xl border border-brand-sand bg-brand-cream p-4 text-left text-sm font-bold text-brand-ink transition hover:border-brand-gold hover:bg-brand-blush">{label}</button>;
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
