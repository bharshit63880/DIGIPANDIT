import { startTransition, useEffect, useState } from "react";
import {
  Bot,
  Compass,
  CreditCard,
  MapPin,
  MessageCircleMore,
  Mic,
  Orbit,
  PhoneCall,
  Sparkles,
  TimerReset,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { SectionTitle } from "../components/SectionTitle";
import { KundaliChart } from "../components/KundaliChart";
import { KundaliPlanetTable } from "../components/KundaliPlanetTable";
import { LoadingCard } from "../components/LoadingCard";
import { api } from "../lib/api";
import { getExpertImage } from "../lib/media";
import { payEntity } from "../lib/payments";
import { fetchCurrentUser } from "../features/auth/authSlice";

const DEFAULT_KUNDALI_FORM = {
  fullName: "",
  placeName: "",
  birthDate: "",
  birthTime: "",
  latitude: "",
  longitude: "",
};

const CONSULTATION_FILTERS = [
  { value: "CHAT", label: "चैट", icon: MessageCircleMore },
  { value: "AUDIO", label: "ऑडियो कॉल", icon: PhoneCall },
  { value: "VIDEO", label: "वीडियो कॉल", icon: Video },
];

const insightCards = [
  {
    icon: Orbit,
    title: "वास्तविक चार्ट डेटा के साथ कुंडली",
    text: "इसी जगह लग्न, भाव स्थिति, नक्षत्र, दशा और सरल मार्गदर्शन प्राप्त करें।",
  },
  {
    icon: Mic,
    title: "प्रति मिनट परामर्श",
    text: "वॉलेट आधारित प्रति-मिनट बिलिंग के साथ ज्योतिषी से चैट, ऑडियो या वीडियो परामर्श शुरू करें।",
  },
  {
    icon: Bot,
    title: "भविष्यवाणी के लिए तैयार आधार",
    text: "यही ज्योतिष पेज व्याख्या, उपाय और व्यक्तिगत मार्गदर्शन के लिए तैयार है।",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

function getSessionTypeMeta(type) {
  return CONSULTATION_FILTERS.find((item) => item.value === type) || CONSULTATION_FILTERS[0];
}

export default function AstrologyPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [consultationMode, setConsultationMode] = useState("CHAT");
  const [onlineOnly, setOnlineOnly] = useState(true);
  const [astrologers, setAstrologers] = useState([]);
  const [astrologersLoading, setAstrologersLoading] = useState(true);
  const [wallet, setWallet] = useState(user?.wallet || { balance: 0, currency: "INR" });
  const [transactions, setTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletAmount, setWalletAmount] = useState("500");
  const [walletError, setWalletError] = useState("");
  const [walletMessage, setWalletMessage] = useState("");
  const [sessionActionError, setSessionActionError] = useState("");
  const [sessionEnding, setSessionEnding] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [kundaliForm, setKundaliForm] = useState(DEFAULT_KUNDALI_FORM);
  const [kundaliLoading, setKundaliLoading] = useState(false);
  const [kundaliError, setKundaliError] = useState("");
  const [kundaliResult, setKundaliResult] = useState(null);

  const loadAstrologers = async () => {
    setAstrologersLoading(true);

    try {
      const response = await api.get("/astrologers", {
        params: {
          mode: consultationMode,
          ...(onlineOnly ? { onlineOnly: "true" } : {}),
        },
      });

      setAstrologers(response.data.data || []);
    } catch (error) {
      setAstrologers([]);
      setSessionActionError(error.message);
    } finally {
      setAstrologersLoading(false);
    }
  };

  const loadWallet = async () => {
    if (!user) {
      setWallet({ balance: 0, currency: "INR" });
      setTransactions([]);
      return;
    }

    setWalletLoading(true);
    setWalletError("");

    try {
      const response = await api.get("/wallet");
      setWallet(response.data.data.wallet);
      setTransactions(response.data.data.transactions || []);
    } catch (error) {
      setWalletError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    loadAstrologers();
  }, [consultationMode, onlineOnly]);

  useEffect(() => {
    loadWallet();
  }, [user]);

  useEffect(() => {
    if (!activeSession) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession?.estimatedMaxDurationSeconds || sessionEnding) {
      return;
    }

    const startedAt = new Date(activeSession.startedAt).getTime();
    const elapsedSeconds = Math.floor((now - startedAt) / 1000);

    if (elapsedSeconds >= activeSession.estimatedMaxDurationSeconds) {
      const closeSession = async () => {
        setSessionEnding(true);

        try {
          const response = await api.post("/end-session", {
            sessionId: activeSession._id,
          });

          setWallet(response.data.data.wallet);
          setActiveSession(null);
          await loadWallet();
          dispatch(fetchCurrentUser());
        } catch (error) {
          setSessionActionError(error.message);
        } finally {
          setSessionEnding(false);
        }
      };

      closeSession();
    }
  }, [activeSession, now, sessionEnding, dispatch]);

  const handleWalletTopUp = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setWalletLoading(true);
    setWalletError("");
    setWalletMessage("");

    try {
      const topupResponse = await api.post("/add-money", { amount: Number(walletAmount) });
      await payEntity({
        entityType: "WALLET_TOPUP",
        entityId: topupResponse.data.data.topup._id,
        title: `Wallet topup of ${formatCurrency(walletAmount)}`,
        customer: user,
      });
      setWalletMessage("वॉलेट में राशि सफलतापूर्वक जुड़ गई।");
      await loadWallet();
      await dispatch(fetchCurrentUser());
    } catch (error) {
      setWalletError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleStartSession = async (astrologer, service) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSessionActionError("");

    try {
      const response = await api.post("/start-session", {
        astrologerProfileId: astrologer._id,
        serviceId: service.serviceId,
        sessionType: service.sessionType,
      });

      setActiveSession({
        ...response.data.data.session,
        astrologer: response.data.data.astrologer,
        estimatedMaxDurationSeconds: response.data.data.estimatedMaxDurationSeconds,
      });
      setWallet(response.data.data.wallet);

      if (service.sessionType === "CHAT" && response.data.data.chatRoomId) {
        navigate(`/dashboard/chat?room=${response.data.data.chatRoomId}`);
      }
    } catch (error) {
      setSessionActionError(error.message);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) {
      return;
    }

    setSessionEnding(true);
    setSessionActionError("");

    try {
      const response = await api.post("/end-session", { sessionId: activeSession._id });
      setWallet(response.data.data.wallet);
      setActiveSession(null);
      await loadWallet();
      dispatch(fetchCurrentUser());
    } catch (error) {
      setSessionActionError(error.message);
    } finally {
      setSessionEnding(false);
    }
  };

  const handleKundaliChange = (event) => {
    const { name, value } = event.target;
    setKundaliForm((current) => ({ ...current, [name]: value }));
  };

  const handleGenerateKundali = async (event) => {
    event.preventDefault();
    setKundaliLoading(true);
    setKundaliError("");

    try {
      const response = await api.post("/kundali", {
        ...kundaliForm,
        latitude: Number(kundaliForm.latitude),
        longitude: Number(kundaliForm.longitude),
      });

      startTransition(() => {
        setKundaliResult(response.data.data);
      });
    } catch (error) {
      setKundaliResult(null);
      setKundaliError(error.message);
    } finally {
      setKundaliLoading(false);
    }
  };

  const activeElapsedSeconds = activeSession ? Math.max(0, Math.floor((now - new Date(activeSession.startedAt).getTime()) / 1000)) : 0;
  const activeRemainingSeconds = activeSession
    ? Math.max(0, (activeSession.estimatedMaxDurationSeconds || 0) - activeElapsedSeconds)
    : 0;
  const kundali = kundaliResult?.kundali;
  const interpretation = kundaliResult?.interpretation;
  const currentMahadasha = kundali?.dashaTimeline?.find((entry) => entry.currentAtBirth) || kundali?.dashaTimeline?.[0];
  const activeSessionMeta = activeSession ? getSessionTypeMeta(activeSession.sessionType) : getSessionTypeMeta(consultationMode);
  const ActiveSessionIcon = activeSessionMeta.icon;

  return (
    <div className="dp-theme dp-astrology-theme dp-consultation-page pb-20">
      <section className="bg-hero-pattern">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="space-y-7">
            
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-bold leading-tight text-brand-ink md:text-6xl">
                कुंडली, भविष्यवाणी और लाइव परामर्श—सब कुछ एक ही ज्योतिष पेज पर।
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-brand-ink/70">
                कुंडली बनाएँ, दशा समयरेखा देखें, वॉलेट में राशि जोड़ें और बिना अलग-अलग पेजों पर जाए प्रति-मिनट ज्योतिष परामर्श शुरू करें।
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {insightCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="dp-consultation-insight rounded-[28px] bg-white/85 p-5 shadow-soft backdrop-blur">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-brand-ink">{card.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-brand-ink/70">{card.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[34px] bg-white/92 p-6 shadow-soft backdrop-blur sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">वॉलेट</p>
                  <h2 className="mt-2 text-3xl font-bold text-brand-ink">{formatCurrency(wallet.balance)}</h2>
                  <p className="mt-2 text-sm leading-7 text-brand-ink/65">
                    प्रति-मिनट परामर्श शुरू करने से पहले वॉलेट में राशि जोड़ें। सत्र समाप्त होने पर बिलिंग काटी जाती है।
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleWalletTopUp} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label="राशि जोड़ें"
                    type="number"
                    min="100"
                    step="100"
                    value={walletAmount}
                    onChange={(event) => setWalletAmount(event.target.value)}
                  />
                </div>
                <Button type="submit" disabled={walletLoading} className="sm:min-w-[180px]">
                  {walletLoading ? "अपडेट हो रहा है..." : "वॉलेट में राशि जोड़ें"}
                </Button>
              </form>

              {walletError ? (
                <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {walletError}
                </div>
              ) : null}

              {walletMessage ? (
                <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {walletMessage}
                </div>
              ) : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction._id} className="rounded-[22px] bg-brand-cream/70 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-clay">{transaction.type}</p>
                    <p className="mt-2 text-base font-semibold text-brand-ink">{formatCurrency(transaction.amount)}</p>
                    <p className="mt-1 text-xs leading-6 text-brand-ink/65">{transaction.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {activeSession || sessionActionError ? <div className="dp-live-session-panel rounded-[34px] bg-brand-maroon p-6 text-white shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/70">लाइव सत्र</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {activeSession ? `${activeSession.astrologer?.name} के साथ ${activeSessionMeta.label}` : "बिलिंग शुरू करने के लिए सत्र शुरू करें"}
                  </h2>
                </div>
                <ActiveSessionIcon className="h-6 w-6 shrink-0 text-white" />
              </div>

              {activeSession ? (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[22px] bg-white/10 px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">बीता समय</p>
                      <p className="mt-2 text-lg font-semibold">{formatDuration(activeElapsedSeconds)}</p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">शेष समय</p>
                      <p className="mt-2 text-lg font-semibold">{formatDuration(activeRemainingSeconds)}</p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">दर</p>
                      <p className="mt-2 text-lg font-semibold">{formatCurrency(activeSession.pricePerMinute)}/मिनट</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <Button
                      onClick={handleEndSession}
                      disabled={sessionEnding}
                      className="bg-white text-brand-maroon hover:bg-brand-cream"
                    >
                      {sessionEnding ? "समाप्त हो रहा है..." : "सत्र समाप्त करें"}
                    </Button>
                    <p className="max-w-sm text-sm leading-7 text-white/75">
                      उपलब्ध समय पूरा होने पर सत्र अपने-आप रुक जाता है, इसलिए वॉलेट बैलेंस ऋणात्मक नहीं होगा।
                    </p>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm leading-7 text-white/75">
                  नीचे से ज्योतिषी चुनें और इसी पेज से प्रति-मिनट चैट, ऑडियो या वीडियो सत्र शुरू करें।
                </p>
              )}

              {sessionActionError ? <p className="mt-4 text-sm font-medium text-brand-gold">{sessionActionError}</p> : null}
            </div> : null}
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionTitle
          eyebrow="ज्योतिष विशेषज्ञों से परामर्श"
          title="सत्र प्रकार, उपलब्धता और प्रति-मिनट दर के आधार पर ज्योतिषी चुनें"
          description="ज्योतिषी सेवाएँ पंडित सेवाओं से अलग हैं। हर कार्ड लाइव ऑनलाइन मार्गदर्शन के लिए बनाया गया है।"
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {CONSULTATION_FILTERS.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setConsultationMode(filter.value)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  consultationMode === filter.value
                    ? "bg-brand-maroon text-white shadow-soft"
                    : "bg-white text-brand-ink shadow-soft hover:bg-brand-sand"
                }`}
              >
                <Icon className="h-4 w-4" />
                {filter.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setOnlineOnly((current) => !current)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              onlineOnly ? "bg-brand-forest text-white shadow-soft" : "bg-white text-brand-ink shadow-soft"
            }`}
          >
            {onlineOnly ? "केवल ऑनलाइन ज्योतिषी" : "ऑफ़लाइन प्रोफ़ाइल भी दिखाएँ"}
          </button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {astrologersLoading
            ? Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />)
            : astrologers.map((astrologer) => {
                const currentService = astrologer.astrologyServices.find((service) => service.sessionType === consultationMode);
                return (
                  <article key={astrologer._id} className="dp-astrologer-card flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-soft">
                    <img
                      src={getExpertImage({
                        user: {
                          name: astrologer.name,
                          avatar:
                            astrologer.avatar && typeof astrologer.avatar === "object"
                              ? astrologer.avatar
                              : { url: astrologer.avatar || "" },
                        },
                      })}
                      alt={astrologer.name}
                      className="h-48 w-full object-cover object-[center_18%]"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${astrologer.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-brand-cream text-brand-ink"}`}>
                            <span className={`h-2.5 w-2.5 rounded-full ${astrologer.isOnline ? "bg-emerald-500" : "bg-brand-clay"}`} />
                            {astrologer.isOnline ? "ऑनलाइन" : "ऑफ़लाइन"}
                          </div>
                          <h3 className="mt-3 text-2xl font-bold text-brand-ink">{astrologer.name}</h3>
                          <p className="mt-2 text-sm text-brand-ink/65">{astrologer.experienceInYears} वर्ष का अनुभव</p>
                        </div>
                        <div className="rounded-full bg-brand-cream px-3 py-2 text-sm font-semibold text-brand-ink">
                          {astrologer.ratingAverage?.toFixed(1) || "4.8"}★
                        </div>
                      </div>

                      <p className="dp-astrologer-bio mt-4 text-sm leading-7 text-brand-ink/70">{astrologer.bio || "लाइव मार्गदर्शन और सरल उपायों के लिए अनुभवी ज्योतिषाचार्य।"}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(astrologer.specialization || []).slice(0, 3).map((item) => (
                          <span key={item} className="rounded-full bg-brand-sand/40 px-3 py-1 text-xs font-semibold text-brand-ink">
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 rounded-[24px] bg-brand-cream/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-brand-ink">{currentService?.name || "यह सेवा उपलब्ध नहीं है"}</p>
                          <p className="text-sm font-semibold text-brand-maroon">
                            {currentService ? `${formatCurrency(currentService.pricePerMinute)}/मिनट` : "उपलब्ध नहीं"}
                          </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-brand-ink/70">
                          {currentService?.description || "इस ज्योतिषाचार्य की दूसरी लाइव परामर्श सेवा चुनें।"}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        
                        <Button disabled={!currentService} onClick={() => currentService && handleStartSession(astrologer, currentService)}>
                          {currentService ? `${getSessionTypeMeta(consultationMode).label} शुरू करें` : "दूसरी सेवा चुनें"}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>

        {!astrologersLoading && !astrologers.length ? (
          <div className="mt-10 rounded-[30px] bg-white p-8 shadow-soft">
            <h3 className="text-2xl font-bold text-brand-ink">इस प्रकार के लिए कोई ज्योतिषी उपलब्ध नहीं है</h3>
            <p className="mt-3 text-sm leading-7 text-brand-ink/70">दूसरा विकल्प चुनें या अधिक विशेषज्ञ देखने के लिए ऑफ़लाइन प्रोफ़ाइल शामिल करें।</p>
          </div>
        ) : null}
      </section>

      {false ? <section className="container-shell py-6">
        <SectionTitle
          eyebrow="Kundali + Prediction"
          title="Generate kundali without leaving the astrology page"
          description="The same page now combines astrologer discovery with the chart engine so astrology feels like one product, not scattered modules."
        />

        <div className="mt-10 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <form onSubmit={handleGenerateKundali} className="rounded-[34px] bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Birth Details</p>
                <h2 className="mt-2 text-3xl font-bold text-brand-ink">Generate your kundali</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setKundaliForm(DEFAULT_KUNDALI_FORM);
                  setKundaliError("");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-brand-sand px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-cream"
              >
                <TimerReset className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Full name" name="fullName" value={kundaliForm.fullName} onChange={handleKundaliChange} />
              <Input label="Place name" name="placeName" value={kundaliForm.placeName} onChange={handleKundaliChange} />
              <Input label="Birth date" name="birthDate" type="date" value={kundaliForm.birthDate} onChange={handleKundaliChange} />
              <Input label="Birth time" name="birthTime" type="time" value={kundaliForm.birthTime} onChange={handleKundaliChange} />
              <Input label="Latitude" name="latitude" type="number" step="any" value={kundaliForm.latitude} onChange={handleKundaliChange} />
              <Input label="Longitude" name="longitude" type="number" step="any" value={kundaliForm.longitude} onChange={handleKundaliChange} />
            </div>

            <div className="mt-6 rounded-[24px] bg-brand-cream/70 p-4 text-sm leading-7 text-brand-ink/75">
              Use exact birth location coordinates for the best lagna, house, and nakshatra accuracy.
            </div>

            {kundaliError ? (
              <div className="mt-5 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {kundaliError}
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-4">
              <Button type="submit" disabled={kundaliLoading} className="min-w-[190px]">
                {kundaliLoading ? "Generating..." : "Generate Kundali"}
              </Button>
              <p className="max-w-sm text-sm leading-7 text-brand-ink/65">
                Daily horoscope, matching, and remedies can now layer on top of the same birth chart response.
              </p>
            </div>
          </form>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[30px] bg-white p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-brand-ink">Precise lagna and house math</h3>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                The backend returns sign, longitude, nakshatra, house placement, and dasha in a chart-ready structure.
              </p>
            </div>

            <div className="rounded-[30px] bg-white p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-forest text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-brand-ink">Prediction-ready interpretation</h3>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                Career, marriage, strengths, and daily guidance are already stitched into the output for fast product expansion.
              </p>
            </div>

          
          </div>
        </div>

        {!kundali ? (
          <div className="mt-10 rounded-[36px] border border-dashed border-brand-sand bg-white/80 p-10 text-center shadow-soft">
            <p className="text-lg font-semibold text-brand-ink">Generate a chart to see the details here.</p>
            <p className="mt-3 text-sm leading-7 text-brand-ink/70">Submit your birth details above to render the chart, planet table, and timing.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <KundaliChart chart={kundali.northIndianChart} lagna={kundali.lagna} />

              <div className="space-y-6">
                <div className="rounded-[34px] bg-white p-6 shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Birth Context</p>
                      <h3 className="mt-2 text-2xl font-bold text-brand-ink">{kundali.input.fullName}</h3>
                      <p className="mt-1 text-sm text-brand-ink/65">{kundali.input.placeName}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Timezone</p>
                      <p className="mt-2 text-lg font-semibold text-brand-ink">{kundali.meta.timezone}</p>
                    </div>
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Ayanamsha</p>
                      <p className="mt-2 text-lg font-semibold text-brand-ink">{kundali.meta.ayanamsha.formatted}</p>
                    </div>
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Lagna</p>
                      <p className="mt-2 text-lg font-semibold text-brand-ink">{kundali.lagna.sign.name}</p>
                      <p className="text-sm text-brand-ink/65">{kundali.lagna.longitudeDms}</p>
                    </div>
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Moon Nakshatra</p>
                      <p className="mt-2 text-lg font-semibold text-brand-ink">
                        {kundali.planets.find((planet) => planet.name === "Moon")?.nakshatra.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[34px] bg-brand-maroon p-6 text-white shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/75">Current Timing</p>
                  <h3 className="mt-2 text-2xl font-bold">{currentMahadasha?.lord} Mahadasha</h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    Running from {currentMahadasha?.start.display} to {currentMahadasha?.end.display}
                  </p>
                  <p className="mt-5 text-sm leading-7 text-white/75">
                    Balance at birth: {currentMahadasha?.balanceAtBirthYears} years
                  </p>
                </div>
              </div>
            </div>

            <KundaliPlanetTable planets={kundali.planets} />

            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[34px] bg-white p-6 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">House Placements</p>
                <div className="mt-5 space-y-3">
                  {kundali.housePlacements.map((house) => (
                    <div key={house.house} className="rounded-[22px] border border-brand-sand/70 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-ink">House {house.house}</p>
                        <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-ink">
                          {house.sign}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-brand-ink/70">
                        Occupants: {house.occupants.length ? house.occupants.map((occupant) => occupant.name).join(", ") : "Empty"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[34px] bg-white p-6 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Interpretation</p>
                  <h3 className="mt-2 text-2xl font-bold text-brand-ink">Readable chart notes</h3>
                  <p className="mt-4 text-sm leading-7 text-brand-ink/75">{interpretation.summary}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-sm font-bold text-brand-ink">Career</p>
                      <p className="mt-2 text-sm leading-7 text-brand-ink/70">{interpretation.career}</p>
                    </div>
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-sm font-bold text-brand-ink">Marriage</p>
                      <p className="mt-2 text-sm leading-7 text-brand-ink/70">{interpretation.marriage}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-[34px] bg-white p-6 shadow-soft">
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Strengths</p>
                    <div className="mt-4 space-y-3">
                      {interpretation.strengths.map((item) => (
                        <p key={item} className="rounded-[22px] bg-brand-cream/70 px-4 py-3 text-sm leading-7 text-brand-ink/75">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[34px] bg-white p-6 shadow-soft">
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Watchouts</p>
                    <div className="mt-4 space-y-3">
                      {interpretation.weaknesses.map((item) => (
                        <p key={item} className="rounded-[22px] bg-brand-cream/70 px-4 py-3 text-sm leading-7 text-brand-ink/75">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[34px] bg-brand-forest p-6 text-white shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/70">Daily Horoscope</p>
                  <p className="mt-3 text-base leading-8 text-white/85">{interpretation.dailyHoroscope}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section> : null}
    </div>
  );
}
