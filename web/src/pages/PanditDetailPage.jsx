import { useEffect, useState } from "react";
import { Globe, Languages, MapPin, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { getExpertImage } from "../lib/media";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";

export default function PanditDetailPage() {
  const { panditId } = useParams();
  const { isAuthenticated } = useAuth();
  const [pandit, setPandit] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [message, setMessage] = useState("");

  const currentService = pandit?.services?.find((service) => service._id === selectedService);
  const isOnlineService = currentService ? currentService.category !== "PUJA" : false;
  const bookingModeLabel = isOnlineService ? "Online consultation" : "Offline puja visit";
  const bookingModeNote = currentService
    ? isOnlineService
      ? "After payment, your video consultation access will appear in both your bookings and chat workspace."
      : "This booking will be created for an offline puja visit at your home, temple, or selected service address."
    : "Select a service to view the booking mode and next steps here.";

  useEffect(() => {
    const fetchPandit = async () => {
      const response = await api.get(`/pandits/${panditId}`);
      setPandit(response.data.data);
    };

    fetchPandit();
  }, [panditId]);

  const handleBooking = async () => {
    if (!isAuthenticated || !selectedService || !bookingDate) {
      setMessage("Please sign in, choose a service, and select your preferred date and time before creating a booking.");
      return;
    }

    try {
      await api.post("/bookings", {
        panditProfileId: pandit._id,
        serviceId: selectedService,
        scheduleAt: new Date(bookingDate).toISOString(),
        meetingMode: isOnlineService ? "ONLINE" : "OFFLINE",
        address: {
          label: "Primary",
          line1: "Service address line 1",
          city: pandit.serviceCities?.[0] || "Your city",
          state: pandit.user?.state || "Your state",
          pincode: "000000",
        },
      });
      setMessage(
        isOnlineService
          ? "Your booking has been created. Once payment is completed, the video consultation option will appear in your dashboard."
          : "Your booking has been created. Complete payment to continue managing the next steps from your dashboard."
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!pandit) {
    return <div className="container-shell py-16">Loading profile...</div>;
  }

  return (
    <div className="container-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[36px] bg-white p-8 shadow-soft">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div>
              <img
                src={getExpertImage(pandit)}
                alt={pandit.user?.name}
                className="h-72 w-full rounded-[28px] object-cover object-[center_18%]"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${pandit.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${pandit.isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {pandit.isOnline ? "Online now" : "Offline now"}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-brand-ink">{pandit.user?.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-brand-ink/70">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{pandit.serviceCities?.join(", ")}</span>
                <span className="inline-flex items-center gap-2"><Languages className="h-4 w-4" />{pandit.languages?.join(", ") || "Hindi, English"}</span>
                <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4" />{pandit.experienceInYears || 5}+ years</span>
              </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-brand-cream px-4 py-2 font-semibold text-brand-ink">
              <Star className="h-4 w-4 text-brand-gold" />
              {pandit.ratingAverage?.toFixed(1) || "4.9"}
                </div>
              </div>

              <p className="mt-6 text-base leading-8 text-brand-ink/75">
                {pandit.bio || "A trusted spiritual expert offering puja, anushthan, and consultation services with experience and care."}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {pandit.services?.map((service) => (
              <button
                key={service._id}
                onClick={() => setSelectedService(service._id)}
                className={`rounded-[24px] border p-5 text-left ${
                  selectedService === service._id ? "border-brand-maroon bg-brand-cream" : "border-brand-sand bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-ink">{service.name}</h3>
                    <p className="mt-1 text-sm text-brand-ink/65">{service.description || "Customizable spiritual service"}</p>
                  </div>
                  <p className="text-lg font-bold text-brand-maroon">Rs. {service.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[36px] bg-white p-8 shadow-soft">
          <h2 className="text-3xl font-bold text-brand-ink">Confirm your booking</h2>
          <p className="mt-3 text-sm leading-7 text-brand-ink/70">
            Choose a service and select your preferred date and time. Once the booking is created, payment can be completed from your dashboard.
          </p>

          <div className="mt-6 rounded-[24px] bg-brand-cream p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Booking mode</p>
            <p className="mt-2 text-lg font-bold text-brand-ink">{bookingModeLabel}</p>
            <p className="mt-2 text-sm leading-7 text-brand-ink/70">{bookingModeNote}</p>
          </div>

          <label className="mt-6 flex flex-col gap-2 text-sm font-medium text-brand-ink">
            <span>Preferred date and time</span>
            <input
              type="datetime-local"
              className="rounded-2xl border border-brand-sand px-4 py-3 outline-none"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
          </label>

          <Button className="mt-6 w-full" onClick={handleBooking}>
            Create booking
          </Button>

          {message ? <p className="mt-4 text-sm text-brand-maroon">{message}</p> : null}
        </aside>
      </div>
    </div>
  );
}
