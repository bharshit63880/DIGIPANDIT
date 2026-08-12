import { forwardRef, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Bot, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, Check, ChevronDown,
  CircleGauge, Compass, Download, Gem, HeartHandshake, LoaderCircle, Moon, Orbit, Search,
  ShieldCheck, Sparkles, Star, Sun, Users, WandSparkles, X, Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { KundaliChart } from "../components/KundaliChart";
import { KundaliPlanetTable } from "../components/KundaliPlanetTable";
import {
  getHindiSectionCopy, translateDasha, translateDosh, translatePlanet, translateScore, translateSection, translateSign,
} from "../lib/kundaliI18n";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const modules = [
  { id: "kundali", title: "जन्म कुंडली", text: "चार्ट, ग्रह, दशाएँ और जीवन की विस्तृत रिपोर्ट।", icon: Orbit, tone: "from-brand-maroon to-brand-clay" },
  { id: "matching", title: "कुंडली मिलान", text: "छत्तीस गुणों और संबंधों की अनुकूलता का स्पष्ट विश्लेषण।", icon: HeartHandshake, tone: "from-brand-clay to-brand-gold" },
  { id: "numerology", title: "अंक ज्योतिष", text: "जीवन पथ, भाग्यांक और व्यक्तित्व अंक का मार्गदर्शन।", icon: CircleGauge, tone: "from-brand-forest to-brand-maroon" },
  { id: "remedies", title: "दोष और उपाय", text: "सरल दोष जाँच और व्यावहारिक आध्यात्मिक मार्गदर्शन।", icon: ShieldCheck, tone: "from-amber-500 to-orange-600" },
  { id: "dashas", title: "महादशा", text: "प्रमुख ग्रह दशाओं की सरल और स्पष्ट समयरेखा।", icon: ChartNoAxesCombined, tone: "from-brand-forest to-brand-clay" },
  { id: "consultations", title: "ज्योतिषाचार्य से पूछें", text: "सत्यापित विशेषज्ञ से बातचीत, ध्वनि या दृश्य परामर्श।", icon: Bot, tone: "from-brand-maroon to-brand-forest", href: "/astrology/consultations" },
];

const orbitPlanets = [
  ["सूर्य", "☉"], ["चंद्र", "☾"], ["मंगल", "♂"], ["बुध", "☿"],
  ["गुरु", "♃"], ["शुक्र", "♀"], ["शनि", "♄"], ["राहु", "◉"],
];

function PlanetaryOrbit({ daily, loading }) {
  return (
    <div className="dp-planetarium" aria-label="गतिशील नवग्रह मंडल">
      <div className="dp-planetarium-glow" />
      {[0, 1, 2].map((ring) => <span key={ring} className={`dp-orbit-ring dp-orbit-ring--${ring + 1}`} />)}
      <div className="dp-orbit-core">
        <span>ॐ</span>
        <strong>{daily?.panchang?.nakshatra || (loading ? "गणना" : "नक्षत्र")}</strong>
      </div>
      {orbitPlanets.map(([name, symbol], index) => (
        <span key={name} className="dp-orbit-planet" style={{ "--planet-index": index }}>
          <i>{symbol}</i><small>{name}</small>
        </span>
      ))}
    </div>
  );
}

const defaultPerson = {
  fullName: "", gender: "Prefer not to say", birthDate: "", birthTime: "", placeName: "",
};

const Field = forwardRef(function Field({ label, error, ...props }, ref) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      <input
        className="min-h-12 rounded-2xl border border-slate-200 bg-white/80 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
        ref={ref}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
});

function CitySearch({ error, onSelect, language = "en" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  const cityQuery = useQuery({
    queryKey: ["india-city-search", debouncedQuery],
    queryFn: async () => (await api.get("/astrology/cities", { params: { q: debouncedQuery } })).data.data,
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 60 * 1000,
  });
  const matches = cityQuery.data || [];

  return (
    <div className="relative grid gap-2 sm:col-span-2">
      <label htmlFor="birth-city" className="text-sm font-semibold text-slate-700 dark:text-slate-200">{language === "hi" ? "जन्म स्थान" : "Birth place"}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id="birth-city"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); onSelect(null); }}
          onFocus={() => setOpen(true)}
          placeholder={language === "hi" ? "शहर खोजें, जैसे प्रयागराज" : "Search city or town, e.g. Prayagraj"}
          autoComplete="off"
          className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/80 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white"
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls="birth-city-results"
        />
      </div>
      {open && matches.length ? (
        <div id="birth-city-results" role="listbox" className="absolute left-0 right-0 top-[76px] z-20 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-900">
          {matches.map((city) => (
            <button key={`${city.name}-${city.stateCode}-${city.latitude}`} type="button" role="option" className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm hover:bg-violet-50 dark:hover:bg-white/10" onClick={() => { setQuery(`${city.name}, ${city.stateCode}`); setOpen(false); onSelect(city); }}>
              <span className="font-semibold text-slate-900 dark:text-white">{city.name}</span>
              <span className="text-xs text-slate-500">{city.stateCode}, India</span>
            </button>
          ))}
        </div>
      ) : null}
      {open && query.trim().length >= 2 && !matches.length && !cityQuery.isFetching && !cityQuery.isError ? <span className="text-xs text-slate-500">No matching Indian city found. Check the spelling and try again.</span> : null}
      {cityQuery.isFetching ? <span className="text-xs text-violet-600">Searching cities...</span> : null}
      {cityQuery.isError ? <span className="text-xs font-medium text-rose-600">City search service is unavailable. Please restart the backend.</span> : null}
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{language === "hi" ? "कम से कम 2 अक्षर लिखें और सही शहर चुनें।" : "Type at least 2 letters and select the correct result."}</span>
    </div>
  );
}

function ScoreRing({ label, value }) {
  return (
    <div className="grid place-items-center gap-3">
      <div
        className="grid h-24 w-24 place-items-center rounded-full p-2"
        style={{ background: `conic-gradient(#111111 ${value * 3.6}deg, rgba(0,0,0,.12) 0)` }}
      >
        <div className="grid h-full w-full place-items-center rounded-full bg-white text-xl font-extrabold text-slate-900 dark:bg-slate-900 dark:text-white">{value}</div>
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-36 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-white/10" />;
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-clay">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-bold leading-none text-slate-950 md:text-5xl dark:text-white">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{description}</p> : null}
    </div>
  );
}

function KundaliWorkspace() {
  const [result, setResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [language] = useState("hi");
  const { register, handleSubmit, setError, clearErrors, setValue, formState: { errors } } = useForm({ defaultValues: defaultPerson });
  const kundaliMutation = useMutation({
    mutationFn: async (values) => (await api.post("/astrology/kundali", {
      ...values,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
    })).data.data,
    onSuccess: (data) => { setResult(data); setResultOpen(true); },
  });
  useEffect(() => {
    if (!resultOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => { if (event.key === "Escape") setResultOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [resultOpen]);

  return (
    <section id="kundali" className="scroll-mt-28 py-20">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <SectionHeading
          eyebrow={language === "hi" ? "आपकी जन्म कुंडली" : "Your cosmic blueprint"}
          title={language === "hi" ? "संपूर्ण जन्म कुंडली" : "Professional Janam Kundali"}
          description={language === "hi" ? "सटीक जन्म विवरण भरकर ग्रह स्थिति, भाव, दशा, दोष और जीवन से जुड़ा सरल विश्लेषण देखें।" : "Enter exact birth details to generate sidereal planetary positions, chart houses, dasha timeline, dosh screening, and an easy-to-read life report."}
        />
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
        <form onSubmit={handleSubmit((values) => {
          if (!selectedCity) {
            setError("placeName", { message: "Please select a city from the search results" });
            return;
          }
          kundaliMutation.mutate({
            ...values,
            placeName: `${selectedCity.name}, ${selectedCity.stateCode}, India`,
            latitude: Number(selectedCity.latitude),
            longitude: Number(selectedCity.longitude),
          });
        })} className="h-fit rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,.12)] backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label={language === "hi" ? "पूरा नाम" : "Full name"} placeholder={language === "hi" ? "अपना पूरा नाम लिखें" : "Your full name"} {...register("fullName", { required: "Full name is required", minLength: { value: 2, message: "Enter at least 2 characters" } })} error={errors.fullName?.message} /></div>
            <Field label={language === "hi" ? "जन्म तिथि" : "Date of birth"} type="date" {...register("birthDate", { required: "Birth date is required" })} error={errors.birthDate?.message} />
            <Field label={language === "hi" ? "जन्म का सही समय" : "Exact birth time"} type="time" {...register("birthTime", { required: "Birth time is required" })} error={errors.birthTime?.message} />
            <CitySearch
              language={language}
              error={errors.placeName?.message}
              onSelect={(city) => {
                setSelectedCity(city);
                setValue("placeName", city ? `${city.name}, ${city.stateCode}, India` : "");
                if (city) clearErrors("placeName");
              }}
            />
          </div>
          <Button type="submit" disabled={kundaliMutation.isPending} className="mt-6 w-full bg-gradient-to-r from-brand-maroon to-brand-clay py-4">
            {kundaliMutation.isPending ? <><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> {language === "hi" ? "कुंडली बन रही है..." : "Reading the sky..."}</> : <><Sparkles className="mr-2 h-5 w-5" /> {language === "hi" ? "मेरी कुंडली बनाएं" : "Generate my Kundali"}</>}
          </Button>
          {kundaliMutation.error ? <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{kundaliMutation.error.message}</p> : null}
          <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">{language === "hi" ? "शहर चुनते ही अक्षांश और देशांतर अपने आप सेट हो जाते हैं। परिणाम मार्गदर्शन हैं, निश्चित भविष्यवाणी नहीं।" : "Location coordinates are selected automatically from the city. Results are interpretive guidance, not deterministic guarantees."}</p>
        </form>

        <div className="min-w-0">
          {!result && !kundaliMutation.isPending ? (
            <div className="grid min-h-[520px] place-items-center rounded-[32px] border border-dashed border-violet-300 bg-violet-50/50 p-8 text-center dark:border-violet-500/30 dark:bg-violet-500/5">
              <div>
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-gradient-to-br from-brand-maroon to-brand-clay text-white shadow-xl"><Orbit className="h-9 w-9" /></div>
                <h3 className="mt-6 text-3xl font-bold text-slate-950 dark:text-white">{language === "hi" ? "आपकी कुंडली यहाँ दिखाई देगी" : "Your chart appears here"}</h3>
                <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600 dark:text-slate-300">{language === "hi" ? "कुंडली बनाकर ग्रह, भाव, भविष्य संकेत, दशा और उपाय देखें।" : "Generate once to unlock charts, planetary data, AI-style interpretation, scores, dashas, and remedies."}</p>
              </div>
            </div>
          ) : null}
          {result && !resultOpen && !kundaliMutation.isPending ? (
            <div className="dp-kundali-ready">
              <Orbit className="h-10 w-10" />
              <h3>{language === "hi" ? "आपकी कुंडली तैयार है" : "Your Kundali is ready"}</h3>
              <p>{language === "hi" ? "पूरा परिणाम एक सुव्यवस्थित रिपोर्ट में देखें।" : "Open the complete report in a focused view."}</p>
              <Button type="button" onClick={() => setResultOpen(true)}>{language === "hi" ? "कुंडली परिणाम देखें" : "View Kundali result"}</Button>
            </div>
          ) : null}
          {kundaliMutation.isPending ? <div className="grid gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : null}
          {result && resultOpen ? (
            <div className="dp-kundali-dialog" role="dialog" aria-modal="true" aria-label={language === "hi" ? "कुंडली परिणाम" : "Kundali result"} onMouseDown={(event) => { if (event.target === event.currentTarget) setResultOpen(false); }}>
              <div className="dp-kundali-dialog-shell">
                <button type="button" className="dp-kundali-dialog-close" onClick={() => setResultOpen(false)} aria-label={language === "hi" ? "परिणाम बंद करें" : "Close result"}><X /></button>
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-8">
              <div className="rounded-[32px] bg-gradient-to-br from-brand-ink via-brand-maroon to-brand-forest p-7 text-white shadow-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-violet-300">{language === "hi" ? "ज्योतिषीय पहचान" : "Cosmic identity"}</p>
                <h3 className="mt-3 text-4xl font-bold">{result.kundali.input.fullName}</h3>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[[language === "hi" ? "लग्न" : "Lagna", translateSign(result.kundali.lagna.sign.name, language)], [language === "hi" ? "चंद्र राशि" : "Moon sign", translateSign(result.kundali.planets.find((p) => p.name === "Moon")?.sign.name, language)], [language === "hi" ? "नक्षत्र" : "Nakshatra", result.kundali.lagna.nakshatra.name]].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/10 p-4"><p className="text-xs uppercase tracking-wider text-white/55">{label}</p><p className="mt-2 font-bold">{value}</p></div>
                  ))}
                </div>
              </div>
              <div className="rounded-[32px] bg-white p-6 shadow-xl dark:bg-slate-900">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  {Object.entries(result.report.scores).map(([label, value]) => <ScoreRing key={label} label={translateScore(label, language)} value={value} />)}
                </div>
              </div>
              <KundaliChart chart={result.kundali.northIndianChart} lagna={result.kundali.lagna} language={language} />
              <KundaliPlanetTable planets={result.kundali.planets} language={language} />
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(result.report.sections).slice(0, 10).map(([title, copy]) => (
                  <article key={title} className="rounded-[26px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <h4 className="text-xl capitalize text-slate-950 dark:text-white">{translateSection(title, language)}</h4>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{language === "hi" ? getHindiSectionCopy(title, result) : copy}</p>
                  </article>
                ))}
              </div>
              <div id="dashas" className="scroll-mt-28 rounded-[32px] bg-white p-6 shadow-xl dark:bg-slate-900">
                <h3 className="text-3xl font-bold text-slate-950 dark:text-white">{language === "hi" ? "महादशा समयरेखा" : "Mahadasha timeline"}</h3>
                <div className="mt-6 space-y-4 border-l-2 border-violet-200 pl-6 dark:border-violet-500/30">
                  {result.report.timeline.map((period, index) => (
                    <div key={`${period.title}-${index}`} className="relative rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                      <span className="absolute -left-[31px] top-5 h-3 w-3 rounded-full bg-violet-600 ring-4 ring-violet-100 dark:ring-violet-900" />
                      <div className="flex flex-wrap justify-between gap-3"><strong>{translateDasha(period.title, language)}</strong><span className="text-xs text-slate-500">{period.start} – {period.end}</span></div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{language === "hi" ? "विकास, आत्मचिंतन और संतुलित निर्णय का समय।" : period.tone}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div id="remedies" className="scroll-mt-28 rounded-[32px] bg-amber-50 p-6 dark:bg-amber-500/10">
                <h3 className="text-3xl font-bold text-slate-950 dark:text-white">{language === "hi" ? "दोष जांच और उपाय" : "Dosh screening & remedies"}</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {result.doshas.map((dosh) => (
                    <article key={dosh.name} className="rounded-2xl bg-white p-5 dark:bg-white/5">
                      <div className="flex items-center justify-between gap-3"><strong>{translateDosh(dosh.name, language)}</strong><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{language === "hi" ? (dosh.active ? "प्रभाव मौजूद" : "प्रमुख दोष नहीं") : dosh.severity}</span></div>
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{language === "hi" ? `${translatePlanet(dosh.planet, "hi")} की स्थिति के आधार पर यह सामान्य दोष-जांच है। व्यक्तिगत उपाय से पहले विशेषज्ञ सलाह लें।` : dosh.cause}</p>
                      <p className="mt-3 text-xs font-semibold text-violet-700 dark:text-violet-300">{dosh.remedies.mantra}</p>
                    </article>
                  ))}
                </div>
              </div>
              <Button type="button" onClick={() => window.print()} className="w-full py-4"><Download className="mr-2 h-5 w-5" /> {language === "hi" ? "कुंडली डाउनलोड / प्रिंट करें" : "Download / Print professional report"}</Button>
                </motion.div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MatchingWorkspace() {
  const [result, setResult] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const mutation = useMutation({
    mutationFn: async (values) => {
      const person = (prefix) => ({ fullName: values[`${prefix}Name`], birthDate: values[`${prefix}Date`], birthTime: values[`${prefix}Time`], placeName: values[`${prefix}Place`] });
      return (await api.post("/astrology/matching", { bride: person("bride"), groom: person("groom") })).data.data;
    },
    onSuccess: setResult,
  });
  return (
    <section id="matching" className="scroll-mt-28 py-20">
      <SectionHeading eyebrow="वैवाहिक अनुकूलता" title="छत्तीस गुण कुंडली मिलान" description="शास्त्रीय गुणों और व्यावहारिक संबंध आयामों के साथ दोनों जन्म विवरणों का स्पष्ट मिलान।" />
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="rounded-[32px] bg-white p-7 shadow-xl dark:bg-white/5">
          {["bride", "groom"].map((person) => (
            <fieldset key={person} className="mb-7 grid gap-4 sm:grid-cols-2">
              <legend className="mb-4 text-2xl font-bold capitalize text-slate-950 dark:text-white">{person === "bride" ? "वधू का विवरण" : "वर का विवरण"}</legend>
              <div className="sm:col-span-2"><Field label="पूरा नाम" {...register(`${person}Name`, { required: true })} error={errors[`${person}Name`] ? "यह जानकारी आवश्यक है" : ""} /></div>
              <Field label="जन्म तिथि" type="date" {...register(`${person}Date`, { required: true })} error={errors[`${person}Date`] ? "यह जानकारी आवश्यक है" : ""} />
              <Field label="जन्म समय" type="time" {...register(`${person}Time`, { required: true })} error={errors[`${person}Time`] ? "यह जानकारी आवश्यक है" : ""} />
              <div className="sm:col-span-2"><Field label="जन्म स्थान" {...register(`${person}Place`, { required: true })} error={errors[`${person}Place`] ? "यह जानकारी आवश्यक है" : ""} /></div>
            </fieldset>
          ))}
          <Button type="submit" disabled={mutation.isPending} className="w-full bg-gradient-to-r from-brand-maroon to-brand-clay py-4">{mutation.isPending ? "कुंडलियाँ मिलाई जा रही हैं..." : "अनुकूलता जाँचें"}</Button>
        </form>
        <div>
            {!result ? <div className="dp-matching-placeholder grid min-h-[420px] place-items-center rounded-[32px] p-8 text-center"><div><HeartHandshake className="mx-auto h-14 w-14" /><h3 className="mt-5 text-3xl font-bold">मिलान परिणाम</h3><p className="mt-2">दोनों जन्म विवरणों का संयुक्त विश्लेषण यहाँ दिखाई देगा।</p></div></div> : (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-[32px] bg-gradient-to-br from-brand-maroon to-brand-forest p-7 text-white shadow-2xl">
              <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-rose-200">गुण मिलान</p><p className="mt-2 text-6xl font-extrabold">{result.total}<span className="text-2xl text-white/50">/36</span></p></div><ScoreRing label="अनुकूलता" value={result.compatibility} /></div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">{result.factors.map((factor) => <div key={factor.name} className="flex justify-between rounded-2xl bg-white/10 p-4"><span>{factor.name}</span><strong>{factor.score}/{factor.maxScore}</strong></div>)}</div>
              <p className="mt-6 rounded-2xl bg-white/10 p-4 leading-7">{result.recommendation}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function NumerologyWorkspace() {
  const [result, setResult] = useState(null);
  const { register, handleSubmit } = useForm();
  const mutation = useMutation({ mutationFn: async (values) => (await api.post("/astrology/numerology", values)).data.data, onSuccess: setResult });
  return (
    <section id="numerology" className="scroll-mt-28 py-20">
      <div className="dp-cosmic-panel rounded-[36px] bg-gradient-to-br from-brand-forest via-brand-ink to-brand-maroon p-7 text-white md:p-10">
        <SectionHeading eyebrow="अंकों में छिपे संकेत" title="व्यक्तिगत अंक ज्योतिष" description="अपने नाम और जन्म तिथि से जुड़े अंकों और जीवन संकेतों को समझें।" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="rounded-[28px] bg-white/10 p-6 backdrop-blur">
            <div className="grid gap-5"><Field label="पूरा नाम" {...register("fullName", { required: true })} /><Field label="जन्म तिथि" type="date" {...register("birthDate", { required: true })} /></div>
            <Button type="submit" className="mt-6 w-full bg-brand-gold text-brand-ink hover:bg-white">मेरे अंक ज्ञात करें</Button>
          </form>
          {result ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["जीवन पथ", result.lifePath], ["भाग्यांक", result.destiny], ["आत्मांक", result.soul], ["व्यक्तित्व", result.personality]].map(([label, value]) => <div key={label} className="rounded-[26px] bg-white/10 p-6 text-center"><p className="text-5xl font-black text-cyan-300">{value}</p><p className="mt-3 text-sm font-bold uppercase tracking-wider text-white/70">{label}</p></div>)}<p className="sm:col-span-2 lg:col-span-4 rounded-[26px] bg-white/10 p-6 leading-7">{result.prediction} शुभ रंग: <strong>{result.luckyColor}</strong>।</p></div> : <div className="grid place-items-center rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/65">आपका व्यक्तिगत अंक मानचित्र यहाँ दिखाई देगा।</div>}
        </div>
      </div>
    </section>
  );
}

export default function AstrologyHubPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const dailyQuery = useQuery({ queryKey: ["astrology-daily"], queryFn: async () => (await api.get("/astrology/daily")).data.data });
  const daily = dailyQuery.data;
  const faq = useMemo(() => [
    ["गणना कितनी सटीक है?", "ग्रह स्थिति की गणना परियोजना के खगोलीय गणना तंत्र से होती है। सही परिणाम के लिए जन्म विवरण का सटीक होना आवश्यक है।"],
    ["क्या मेरी जन्म जानकारी सुरक्षित है?", "दिए गए विवरण केवल रिपोर्ट तैयार करने के लिए संसाधित किए जाते हैं। अनावश्यक निजी जानकारी दर्ज न करें।"],
    ["क्या ज्योतिष पेशेवर सलाह का विकल्प है?", "नहीं। ज्योतिष चिकित्सा, कानूनी, वित्तीय या मानसिक स्वास्थ्य सलाह का विकल्प नहीं है।"],
    ["क्या मैं वास्तविक ज्योतिषाचार्य से बात कर सकता हूँ?", "हाँ। DigiPandit पर सत्यापित बातचीत, ध्वनि और दृश्य परामर्श उपलब्ध हैं।"],
  ], []);

  return (
    <div className="dp-theme dp-astrology-theme">
      <div className="overflow-hidden bg-brand-cream text-brand-ink">
        <section className="relative overflow-hidden bg-brand-ink text-white">
          <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_80%_20%,rgba(255,255,255,.13),transparent_25%),radial-gradient(circle_at_13%_87%,rgba(255,255,255,.07),transparent_27%)]" />
          <div className="container-shell relative grid items-center gap-12 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h1 className="dp-astro-typewriter max-w-3xl text-5xl font-semibold leading-[.96] text-white md:text-7xl"><span>अपनी कुंडली समझें।</span><span>स्पष्टता से आगे बढ़ें।</span></h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">कुंडली, पंचांग, मिलान, महादशा, उपाय और विश्वसनीय ज्योतिषाचार्य—सब एक सहज DigiPandit अनुभव में।</p>
              <div className="mt-8 flex flex-wrap gap-4"><a href="#kundali"><Button className="bg-brand-gold px-7 py-4 text-brand-ink hover:bg-white">निःशुल्क कुंडली बनाएँ <ArrowRight className="ml-2 h-5 w-5" /></Button></a><Link to="/astrology/consultations"><Button variant="secondary" className="px-7 py-4">ज्योतिषी से बात करें</Button></Link></div>
              <div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold text-white/55">{["साइन-अप जरूरी नहीं", "क्रमबद्ध गणना", "आपकी गोपनीयता सुरक्षित"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-gold" />{item}</span>)}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className="relative">
              <PlanetaryOrbit daily={daily} loading={dailyQuery.isLoading} />
            </motion.div>
          </div>
        </section>

        <main className="container-shell">
          <section className="py-20">
            <SectionHeading eyebrow="खोजें" title="मार्गदर्शन का एक संपूर्ण संसार" description="सभी ज्योतिष सुविधाएँ एक ही सरल और सुसंगत अनुभव में उपलब्ध हैं।" />
            <div className="dp-astro-marquee mt-12"><div className="dp-astro-marquee-track">{[...modules, ...modules].map((item, index) => { const Icon = item.icon; const duplicate = index >= modules.length; const content = <article className="dp-astro-module-card group"><div className={`dp-astro-module-icon bg-gradient-to-br ${item.tone}`}><Icon /></div><h3>{item.title}</h3><p>{item.text}</p><span>विस्तार से देखें <ArrowRight /></span></article>; return item.href ? <Link aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined} key={`${item.id}-${index}`} to={item.href}>{content}</Link> : <a aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined} key={`${item.id}-${index}`} href={`#${item.id}`}>{content}</a>; })}</div></div>
          </section>

          {daily ? <section className="dp-panchang-spiral-section py-16"><SectionHeading eyebrow="आज का वैदिक संकेत" title="एक दृष्टि में पंचांग" /><div className="dp-panchang-spiral"><div className="dp-panchang-center"><span>ॐ</span><strong>{daily.panchang.nakshatra}</strong></div>{[["सूर्योदय", daily.panchang.sunrise, Sun], ["तिथि", daily.panchang.tithi, CalendarDays], ["राहु काल", daily.panchang.rahuKaal, Zap], ["अभिजित मुहूर्त", daily.panchang.abhijitMuhurat, Star]].map(([label, value, Icon], index) => <article key={label} className="dp-panchang-node" style={{ "--node-index": index }}><Icon /><div><small>{label}</small><strong>{value}</strong></div></article>)}</div><div className="dp-horoscope-ribbon">{daily.horoscope.slice(0, 3).map((item) => <article key={item.sign}><div><h3>{item.sign}</h3><strong>{item.score}%</strong></div><p>{item.summary}</p></article>)}</div></section> : null}

          <KundaliWorkspace />
          <MatchingWorkspace />
          <NumerologyWorkspace />

          <section className="py-20">
            <div className="dp-cosmic-consult rounded-[38px] bg-gradient-to-br from-brand-maroon to-brand-forest p-8 text-white md:p-12">
              <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr]"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-violet-200">जब मानवीय मार्गदर्शन चाहिए</p><h2 className="mt-4 text-5xl font-bold leading-none">अपनी कुंडली पर सीधे ज्योतिषाचार्य से चर्चा करें।</h2><p className="mt-5 max-w-xl leading-8 text-white/75">सत्यापित विशेषज्ञों से बातचीत, ध्वनि या दृश्य परामर्श लें। मौजूदा भुगतान और परामर्श प्रक्रिया पूरी तरह सुरक्षित रहेगी।</p><Link to="/astrology/consultations"><Button className="mt-7 bg-white text-violet-950 hover:bg-violet-100">ज्योतिषाचार्य देखें <ArrowRight className="ml-2 h-5 w-5" /></Button></Link></div><div className="grid gap-4">{[["बातचीत मार्गदर्शन", "तेज़ और केंद्रित प्रश्न", Bot], ["व्यवसाय मार्गदर्शन", "समय और पेशेवर दिशा", BriefcaseBusiness], ["संबंध स्पष्टता", "अनुकूलता और संवाद", Users]].map(([title, copy, Icon]) => <div key={title} className="flex gap-4 rounded-[24px] bg-white/10 p-5 backdrop-blur"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-violet-700"><Icon className="h-5 w-5" /></div><div><strong>{title}</strong><p className="mt-1 text-sm text-white/65">{copy}</p></div></div>)}</div></div>
            </div>
          </section>

          <section className="py-20">
            <SectionHeading eyebrow="सामान्य प्रश्न" title="शुरू करने से पहले जानें" />
            <div className="mt-8 grid gap-3">{faq.map(([question, answer], index) => <div key={question} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold" aria-expanded={openFaq === index}>{question}<ChevronDown className={`h-5 w-5 transition ${openFaq === index ? "rotate-180" : ""}`} /></button><AnimatePresence>{openFaq === index ? <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-5 leading-7 text-slate-600 dark:text-slate-300">{answer}</motion.p> : null}</AnimatePresence></div>)}</div>
          </section>
        </main>
      </div>
    </div>
  );
}
