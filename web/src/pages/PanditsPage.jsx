import { useEffect, useState } from "react";
import { CalendarDays, CarTaxiFront, MapPinHouse, NotebookText, Sparkles, Star, Video } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { api } from "../lib/api";
import { getExpertImage } from "../lib/media";
import { payEntity } from "../lib/payments";
import { BookingReceiptCard } from "../components/BookingReceiptCard";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { LoadingCard } from "../components/LoadingCard";
import { SectionTitle } from "../components/SectionTitle";
import { hindiContent, hindiError, hindiLabel } from "../lib/hindi";

const serviceTypeTabs = [
  { label: "सभी सेवाएँ", value: "" },
  { label: "पूजा", value: "PUJA" },
  { label: "हवन", value: "HAWAN" },
  { label: "कथा", value: "KATHA" },
];

const DEFAULT_BOOKING_FORM = {
  scheduleAt: "",
  meetingMode: "OFFLINE",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  label: "Home",
  notes: "",
  travelCharge: "",
  samagriCost: "",
  extraDakshina: "",
  videoDakshinaFee: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function parseAmount(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

const toLocalInputValue = (date) => {
  return date.toISOString().slice(0, 16);
};

export default function PanditsPage() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    serviceType: searchParams.get("serviceType") || "",
  });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [bookingForm, setBookingForm] = useState(DEFAULT_BOOKING_FORM);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [recentReceipt, setRecentReceipt] = useState(null);
  const hawanContext = {
    title: searchParams.get("hawan") || "",
    materials: searchParams.get("materials") || "",
    language: searchParams.get("language") || "hi-IN",
  };

  const loadPanditServices = async () => {
    setLoading(true);

    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const response = await api.get("/pandit-services", { params });
      const nextProfiles = response.data.data || [];
      setProfiles(nextProfiles);

      if (selectedOffer) {
        const nextProfile = nextProfiles.find((profile) => profile._id === selectedOffer.profile._id);
        const nextService = nextProfile?.services.find((service) => service.serviceId === selectedOffer.service.serviceId);

        if (nextProfile && nextService) {
          setSelectedOffer({ profile: nextProfile, service: nextService });
        } else {
          setSelectedOffer(null);
        }
      }
    } catch (error) {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPanditServices();
  }, [searchParams]);

  useEffect(() => {
    setFilters({
      city: searchParams.get("city") || "",
      serviceType: searchParams.get("serviceType") || "",
    });
  }, [searchParams]);

  const applyFilters = () => {
    setSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)));
  };

  const handleSelectService = (profile, service) => {
    setSelectedOffer({ profile, service });
    setBookingError("");
    setBookingSuccess("");
    setRecentReceipt(null);
    setBookingForm({
      ...DEFAULT_BOOKING_FORM,
      city: filters.city || profile.serviceCities?.[0] || "",
      travelCharge: String(service.addons?.travelCharge || 0),
      samagriCost: String(service.addons?.samagriCost || 0),
      extraDakshina: String(service.addons?.extraDakshina || 0),
      videoDakshinaFee: String(service.addons?.videoDakshinaFee || 0),
      scheduleAt: toLocalInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      notes: hawanContext.title
        ? `हवन: ${hawanContext.title}\nपसंदीदा भाषा: हिन्दी\nशेष सामग्री: ${hawanContext.materials || "पुष्टि शेष"}`
        : "",
    });
  };

  const handleBookingFieldChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((current) => ({ ...current, [name]: value }));
  };

  const pricing = selectedOffer
    ? {
        basePrice: selectedOffer.service.basePrice || 0,
        travelCharge: parseAmount(bookingForm.travelCharge, selectedOffer.service.addons?.travelCharge || 0),
        samagriCost: parseAmount(bookingForm.samagriCost, selectedOffer.service.addons?.samagriCost || 0),
        extraDakshina: parseAmount(bookingForm.extraDakshina, selectedOffer.service.addons?.extraDakshina || 0),
        videoDakshinaFee:
          bookingForm.meetingMode === "ONLINE"
            ? parseAmount(bookingForm.videoDakshinaFee, selectedOffer.service.addons?.videoDakshinaFee || 0)
            : 0,
      }
    : null;

  const requiresAddress = bookingForm.meetingMode === "OFFLINE";

  const finalTotal = pricing
    ? pricing.basePrice + pricing.travelCharge + pricing.samagriCost + pricing.extraDakshina + pricing.videoDakshinaFee
    : 0;

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!selectedOffer) {
      return;
    }

    if (!bookingForm.scheduleAt) {
      setBookingError("कृपया सेवा की तिथि और समय चुनें।");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      const bookingResponse = await api.post("/book-pandit", {
        panditProfileId: selectedOffer.profile._id,
        serviceId: selectedOffer.service.serviceId,
        scheduleAt: new Date(bookingForm.scheduleAt).toISOString(),
        meetingMode: bookingForm.meetingMode,
        ...(requiresAddress
          ? {
              address: {
                label: bookingForm.label,
                line1: bookingForm.line1,
                line2: bookingForm.line2,
                city: bookingForm.city,
                state: bookingForm.state,
                pincode: bookingForm.pincode,
                landmark: bookingForm.landmark,
              },
            }
          : {}),
        notes: bookingForm.notes,
        travelCharge: requiresAddress ? pricing.travelCharge : 0,
        samagriCost: pricing.samagriCost,
        extraDakshina: pricing.extraDakshina,
        videoDakshinaFee: pricing.videoDakshinaFee,
      });

      const paymentResult = await payEntity({
        entityType: "BOOKING",
        entityId: bookingResponse.data.data._id,
        title: selectedOffer.service.name,
        customer: user,
      });

      setBookingSuccess("पंडित बुकिंग और भुगतान सफलतापूर्वक पूरा हुआ।");
      setRecentReceipt(paymentResult.entity);
    } catch (error) {
      setBookingError(hindiError(error));
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="dp-pandits-page">
    <div className="dp-pandit-sanctum" aria-hidden="true">
      <span className="dp-pandit-yantra" />
      <span className="dp-pandit-pillar dp-pandit-pillar--left" />
      <span className="dp-pandit-pillar dp-pandit-pillar--right" />
      <i /><b />
    </div>
    <div className="container-shell py-12 dp-pandit-content">
      <section className="dp-pandit-hero">
      <SectionTitle
        eyebrow="पंडित बुकिंग"
        title="स्पष्ट पता और कीमत के साथ पूजा, हवन और कथा की बुकिंग करें"
        description="पंडित बुकिंग, ज्योतिष परामर्श से अलग है। इसमें निश्चित सेवा शुल्क के साथ यात्रा, सामग्री और दक्षिणा शुल्क शामिल हो सकते हैं।"
      />
      <div className="dp-pandit-assurance" aria-label="सेवा की विशेषताएँ">
        <span>✦ सत्यापित पंडित</span>
        <span>☆ स्पष्ट मूल्य</span>
        <span>▣ सुरक्षित भुगतान</span>
        <span>◌ सहायता उपलब्ध</span>
      </div>
      </section>
      {hawanContext.title ? (
        <div className="mt-6 rounded-[24px] border border-brand-gold/30 bg-amber-50 p-5">
          <p className="eyebrow">हवन मार्गदर्शिका से बुकिंग</p>
          <h2 className="mt-2 text-2xl">{hawanContext.title}</h2>
          <p className="mt-2 text-sm leading-6 text-brand-ink/65">Language: {hawanContext.language} · Missing materials and ritual context will be prefilled in booking notes.</p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="min-w-0">
          <div className="grid gap-4 rounded-[30px] bg-white p-5 shadow-soft md:grid-cols-[1fr_1fr_auto]">
            <Input label="शहर" value={filters.city} onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))} />

            <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink">
              <span>सेवा प्रकार</span>
              <select
                value={filters.serviceType}
                onChange={(event) => setFilters((current) => ({ ...current, serviceType: event.target.value }))}
                className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none transition focus:border-brand-clay"
              >
                {serviceTypeTabs.map((tab) => (
                  <option key={tab.value || "all"} value={tab.value}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <Button className="w-full" onClick={applyFilters}>
                फ़िल्टर लागू करें
              </Button>
            </div>
          </div>

          <div className="dp-pandit-card-rail mt-8" aria-label="पंडित सूची">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="dp-pandit-card-skeleton">
                    <LoadingCard />
                  </div>
                ))
              : profiles.map((profile) => (
                  <article key={profile._id} className="dp-pandit-card overflow-hidden rounded-[28px] bg-white shadow-soft">
                    <img
                      src={getExpertImage({
                        user: {
                          name: profile.name,
                          avatar: profile.avatar && typeof profile.avatar === "object" ? profile.avatar : { url: profile.avatar || "" },
                        },
                      })}
                      alt={profile.name}
                      className="h-48 w-full object-cover object-[center_18%]"
                    />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-brand-ink">{profile.name}</h3>
                          <p className="mt-1 text-sm text-brand-ink/65">{profile.serviceCities?.join(", ") || "कई शहरों में उपलब्ध"}</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-brand-cream px-3 py-2 text-sm font-semibold text-brand-ink">
                          <Star className="h-4 w-4 text-brand-gold" />
                          {profile.ratingAverage?.toFixed(1) || "4.8"}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-brand-ink/70">{hindiContent(profile.bio, "पूजा, हवन और विधिवत अनुष्ठान के लिए सत्यापित पंडित उपलब्ध हैं।")}</p>

                      <div className="mt-5 space-y-3">
                        {profile.services.map((service) => (
                          <div key={service.serviceId} className="rounded-[24px] bg-brand-cream/65 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-maroon">
                                    {hindiLabel(service.serviceType)}
                                  </span>
                                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-ink">
                                    {formatCurrency(service.basePrice)}
                                  </span>
                                </div>
                                <h4 className="mt-3 text-lg font-bold text-brand-ink">{hindiLabel(service.name)}</h4>
                                <p className="mt-2 text-sm leading-6 text-brand-ink/70">{hindiContent(service.description, "इस सेवा का पूरा विवरण बुकिंग के समय दिखाया जाएगा।")}</p>
                              </div>

                              <Button onClick={() => handleSelectService(profile, service)}>सेवा बुक करें</Button>
                            </div>

                            <div className="mt-4 grid gap-2 text-xs font-semibold text-brand-ink/75 sm:grid-cols-2">
                              <div className="rounded-full bg-white px-3 py-2">यात्रा: {formatCurrency(service.addons?.travelCharge || 0)}</div>
                              <div className="rounded-full bg-white px-3 py-2">सामग्री: {formatCurrency(service.addons?.samagriCost || 0)}</div>
                              <div className="rounded-full bg-white px-3 py-2">दक्षिणा: {formatCurrency(service.addons?.extraDakshina || 0)}</div>
                              <div className="rounded-full bg-white px-3 py-2">दृश्य वार्ता शुल्क: {formatCurrency(service.addons?.videoDakshinaFee || 0)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
          </div>

          {!loading && !profiles.length ? (
            <div className="mt-8 rounded-[28px] bg-white p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-brand-ink">कोई पंडित सेवा नहीं मिली</h3>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                दूसरा शहर या सेवा प्रकार चुनें। ज्योतिष परामर्श अलग ज्योतिष पेज पर उपलब्ध है।
              </p>
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-[32px] bg-white p-6 shadow-soft xl:sticky xl:top-28">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">बुकिंग डेस्क</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-ink">
            {selectedOffer ? selectedOffer.service.name : "पंडित सेवा चुनें"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-ink/70">
            {requiresAddress
              ? "ऑफ़लाइन पंडित सेवा के लिए पूरा पता चाहिए, क्योंकि यात्रा और अन्य व्यवस्था इसी से तय होती है।"
              : "ऑनलाइन मार्गदर्शन में पते की जरूरत नहीं है। केवल समय, नोट्स और वैकल्पिक वीडियो दक्षिणा पर्याप्त है।"}
          </p>

          {selectedOffer ? (
            <form onSubmit={handleBookingSubmit} className="mt-6 space-y-5">
              <div className="rounded-[24px] bg-brand-cream/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-brand-ink">{selectedOffer.profile.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-clay">
                      {hindiLabel(selectedOffer.service.serviceType)} सेवा
                    </p>
                  </div>
                  <p className="text-lg font-bold text-brand-maroon">{formatCurrency(selectedOffer.service.basePrice)}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink md:col-span-2">
                  <span>पसंदीदा दिन और समय</span>
                  <input
                    type="datetime-local"
                    name="scheduleAt"
                    value={bookingForm.scheduleAt}
                    onChange={handleBookingFieldChange}
                    className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none transition focus:border-brand-clay"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink md:col-span-2">
                  <span>सेवा का माध्यम</span>
                  <div className="flex flex-wrap gap-3">
                    {["OFFLINE", "ONLINE"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setBookingForm((current) => ({ ...current, meetingMode: mode }))}
                        className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                          bookingForm.meetingMode === mode
                            ? "bg-brand-maroon text-white shadow-soft"
                            : "bg-brand-cream text-brand-ink"
                        }`}
                      >
                        {hindiLabel(mode)}
                      </button>
                    ))}
                  </div>
                </label>

                {requiresAddress ? (
                  <>
                    <Input label="पते का नाम" name="label" value={bookingForm.label} onChange={handleBookingFieldChange} />
                    <Input label="निकटस्थ स्थान" name="landmark" value={bookingForm.landmark} onChange={handleBookingFieldChange} />
                    <Input label="पता पंक्ति १" name="line1" value={bookingForm.line1} onChange={handleBookingFieldChange} />
                    <Input label="पता पंक्ति २" name="line2" value={bookingForm.line2} onChange={handleBookingFieldChange} />
                    <Input label="शहर" name="city" value={bookingForm.city} onChange={handleBookingFieldChange} />
                    <Input label="राज्य" name="state" value={bookingForm.state} onChange={handleBookingFieldChange} />
                    <Input label="पिनकोड" name="pincode" value={bookingForm.pincode} onChange={handleBookingFieldChange} />
                  </>
                ) : (
                  <div className="rounded-[22px] bg-brand-cream/70 px-4 py-4 text-sm leading-7 text-brand-ink/75 md:col-span-2">
                    ऑनलाइन पंडित मार्गदर्शन के लिए पते की आवश्यकता नहीं है। प्रत्यक्ष सेवा चाहिए तो प्रत्यक्ष सेवा चुनें।
                  </div>
                )}

                <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink md:col-span-2">
                  <span>पंडित के लिए टिप्पणी</span>
                  <textarea
                    name="notes"
                    value={bookingForm.notes}
                    onChange={handleBookingFieldChange}
                    rows="4"
                    className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none transition focus:border-brand-clay"
                    placeholder="सामग्री, भवन के निर्देश या परिवार की प्राथमिकताएँ लिखें"
                  />
                </label>
              </div>

              <div className="rounded-[26px] border border-brand-sand/70 p-4">
                <p className="text-sm font-bold text-brand-ink">शुल्क का पूरा विवरण</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {requiresAddress ? (
                    <Input label="Travel charge" name="travelCharge" type="number" min="0" value={bookingForm.travelCharge} onChange={handleBookingFieldChange} />
                  ) : (
                    <div className="rounded-[22px] bg-brand-cream/70 px-4 py-4 text-sm leading-7 text-brand-ink/75">
                      Travel charge online mode me automatically `₹0` ho jata hai.
                    </div>
                  )}
                  <Input label="Samagri cost" name="samagriCost" type="number" min="0" value={bookingForm.samagriCost} onChange={handleBookingFieldChange} />
                  <Input label="Extra dakshina" name="extraDakshina" type="number" min="0" value={bookingForm.extraDakshina} onChange={handleBookingFieldChange} />
                  <Input
                    label="Video call dakshina"
                    name="videoDakshinaFee"
                    type="number"
                    min="0"
                    value={bookingForm.videoDakshinaFee}
                    onChange={handleBookingFieldChange}
                  />
                </div>

                <div className="mt-5 space-y-3 rounded-[22px] bg-brand-cream/70 p-4 text-sm text-brand-ink">
                  <div className="flex items-center justify-between gap-3">
                    <span>Base price</span>
                    <span className="font-semibold">{formatCurrency(pricing.basePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Travel charge</span>
                    <span className="font-semibold">{formatCurrency(pricing.travelCharge)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Samagri cost</span>
                    <span className="font-semibold">{formatCurrency(pricing.samagriCost)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Extra dakshina</span>
                    <span className="font-semibold">{formatCurrency(pricing.extraDakshina)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Video call dakshina</span>
                    <span className="font-semibold">{formatCurrency(pricing.videoDakshinaFee)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-brand-sand/80 pt-3 text-base font-bold">
                    <span>Final total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {bookingError ? (
                <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {bookingError}
                </div>
              ) : null}

              {bookingSuccess ? (
                <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {bookingSuccess}
                </div>
              ) : null}

              {recentReceipt ? <BookingReceiptCard booking={recentReceipt} title="Booking Invoice" compact /> : null}

              <Button type="submit" disabled={bookingLoading} className="w-full">
                {bookingLoading ? "Booking..." : "Confirm pandit booking"}
              </Button>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              {[
                { icon: MapPinHouse, text: "प्रत्यक्ष पूजा व्यवस्था के लिए पूरा पता आवश्यक है" },
                { icon: CalendarDays, text: "अनुष्ठान के लिए तिथि और समय स्पष्ट रूप से चुनें" },
                { icon: CarTaxiFront, text: "यात्रा, सामग्री और दक्षिणा एक ही विवरण में देखें" },
                { icon: Video, text: "दूरस्थ सहायता के लिए वैकल्पिक ऑनलाइन मार्गदर्शन" },
                { icon: NotebookText, text: "परिवार और अनुष्ठान की विशेष आवश्यकताएँ लिखें" },
                { icon: Sparkles, text: "ज्योतिष परामर्श अलग ज्योतिष पृष्ठ पर उपलब्ध है" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-start gap-3 rounded-[22px] bg-brand-cream/70 px-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-maroon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm leading-7 text-brand-ink/75">{item.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
    </div>
  );
}
