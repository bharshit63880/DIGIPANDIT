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

const serviceTypeTabs = [
  { label: "All Services", value: "" },
  { label: "Puja", value: "PUJA" },
  { label: "Hawan", value: "HAWAN" },
  { label: "Katha", value: "KATHA" },
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
      setBookingError("Please choose a date and time for the service.");
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

      setBookingSuccess("Pandit booking created and payment completed successfully.");
      setRecentReceipt(paymentResult.entity);
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container-shell py-12">
      <SectionTitle
        eyebrow="Pandit Booking"
        title="Book offline puja, hawan, and katha services with clear address and pricing logic"
        description="Pandit bookings stay completely separate from astrology consultations. These services use fixed pricing plus travel, samagri, and dakshina add-ons."
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="grid gap-4 rounded-[30px] bg-white p-5 shadow-soft md:grid-cols-[1fr_1fr_auto]">
            <Input label="City" value={filters.city} onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))} />

            <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink">
              <span>Service type</span>
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
                Apply filters
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <LoadingCard key={index} />)
              : profiles.map((profile) => (
                  <article key={profile._id} className="overflow-hidden rounded-[28px] bg-white shadow-soft">
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
                          <p className="mt-1 text-sm text-brand-ink/65">{profile.serviceCities?.join(", ") || "Multiple cities"}</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-brand-cream px-3 py-2 text-sm font-semibold text-brand-ink">
                          <Star className="h-4 w-4 text-brand-gold" />
                          {profile.ratingAverage?.toFixed(1) || "4.8"}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-brand-ink/70">{profile.bio || "Verified pandit available for rituals, hawan, and guided ceremonies."}</p>

                      <div className="mt-5 space-y-3">
                        {profile.services.map((service) => (
                          <div key={service.serviceId} className="rounded-[24px] bg-brand-cream/65 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-maroon">
                                    {service.serviceType}
                                  </span>
                                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-ink">
                                    {formatCurrency(service.basePrice)}
                                  </span>
                                </div>
                                <h4 className="mt-3 text-lg font-bold text-brand-ink">{service.name}</h4>
                                <p className="mt-2 text-sm leading-6 text-brand-ink/70">{service.description}</p>
                              </div>

                              <Button onClick={() => handleSelectService(profile, service)}>Book service</Button>
                            </div>

                            <div className="mt-4 grid gap-2 text-xs font-semibold text-brand-ink/75 sm:grid-cols-2">
                              <div className="rounded-full bg-white px-3 py-2">Travel: {formatCurrency(service.addons?.travelCharge || 0)}</div>
                              <div className="rounded-full bg-white px-3 py-2">Samagri: {formatCurrency(service.addons?.samagriCost || 0)}</div>
                              <div className="rounded-full bg-white px-3 py-2">Dakshina: {formatCurrency(service.addons?.extraDakshina || 0)}</div>
                              <div className="rounded-full bg-white px-3 py-2">Video fee: {formatCurrency(service.addons?.videoDakshinaFee || 0)}</div>
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
              <h3 className="text-2xl font-bold text-brand-ink">No pandit services found</h3>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                Try another city or switch service type. Astrology consultations have been moved to the separate Astrology page.
              </p>
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-[32px] bg-white p-6 shadow-soft xl:sticky xl:top-28">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Booking Desk</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-ink">
            {selectedOffer ? selectedOffer.service.name : "Select a pandit service"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-ink/70">
            {requiresAddress
              ? "Offline pandit visit ke liye full address chahiye, because logistics aur travel isi se calculate hote hain."
              : "Online guidance mode me address ki zarurat nahi hai. Sirf schedule, notes, aur optional video dakshina enough hai."}
          </p>

          {selectedOffer ? (
            <form onSubmit={handleBookingSubmit} className="mt-6 space-y-5">
              <div className="rounded-[24px] bg-brand-cream/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-brand-ink">{selectedOffer.profile.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-clay">
                      {selectedOffer.service.serviceType} service
                    </p>
                  </div>
                  <p className="text-lg font-bold text-brand-maroon">{formatCurrency(selectedOffer.service.basePrice)}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink md:col-span-2">
                  <span>Preferred date and time</span>
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
                  <span>Meeting mode</span>
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
                        {mode}
                      </button>
                    ))}
                  </div>
                </label>

                {requiresAddress ? (
                  <>
                    <Input label="Address label" name="label" value={bookingForm.label} onChange={handleBookingFieldChange} />
                    <Input label="Landmark" name="landmark" value={bookingForm.landmark} onChange={handleBookingFieldChange} />
                    <Input label="Address line 1" name="line1" value={bookingForm.line1} onChange={handleBookingFieldChange} />
                    <Input label="Address line 2" name="line2" value={bookingForm.line2} onChange={handleBookingFieldChange} />
                    <Input label="City" name="city" value={bookingForm.city} onChange={handleBookingFieldChange} />
                    <Input label="State" name="state" value={bookingForm.state} onChange={handleBookingFieldChange} />
                    <Input label="Pincode" name="pincode" value={bookingForm.pincode} onChange={handleBookingFieldChange} />
                  </>
                ) : (
                  <div className="rounded-[22px] bg-brand-cream/70 px-4 py-4 text-sm leading-7 text-brand-ink/75 md:col-span-2">
                    Online pandit guidance ke liye address fields hide kar diye gaye hain. Agar physical visit chahiye ho to `OFFLINE` select karo.
                  </div>
                )}

                <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink md:col-span-2">
                  <span>Notes for pandit</span>
                  <textarea
                    name="notes"
                    value={bookingForm.notes}
                    onChange={handleBookingFieldChange}
                    rows="4"
                    className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none transition focus:border-brand-clay"
                    placeholder="Mention samagri expectations, society instructions, or family preferences"
                  />
                </label>
              </div>

              <div className="rounded-[26px] border border-brand-sand/70 p-4">
                <p className="text-sm font-bold text-brand-ink">Pricing breakdown</p>
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
                { icon: MapPinHouse, text: "Mandatory full address for offline puja logistics" },
                { icon: CalendarDays, text: "Date and time capture for the ritual schedule" },
                { icon: CarTaxiFront, text: "Travel, samagri, and dakshina shown in one bill" },
                { icon: Video, text: "Optional online guidance fee for remote support" },
                { icon: NotebookText, text: "Special notes field for family and ceremony requests" },
                { icon: Sparkles, text: "Astrology stays on the Astrology page and is not mixed here" },
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
  );
}
