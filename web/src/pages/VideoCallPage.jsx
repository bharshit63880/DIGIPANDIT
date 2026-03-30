import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/Button";

export default function VideoCallPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data.data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  if (loading) {
    return <div className="container-shell py-16 text-sm text-brand-ink/70">Video consultation room load ho rahi hai...</div>;
  }

  if (!booking || !booking.meetingLink) {
    return (
      <div className="container-shell py-16">
        <div className="rounded-[28px] bg-white p-8 shadow-soft">
          <p className="text-sm text-brand-ink/70">{error || "Is booking ke liye video call room available nahi hai."}</p>
          <Link to="/dashboard/bookings" className="mt-5 inline-flex">
            <Button variant="secondary">Bookings par wapas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-10">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Video Consultation</p>
            <h1 className="mt-2 text-3xl font-bold text-brand-ink">{booking.serviceName}</h1>
            <p className="mt-2 text-sm text-brand-ink/70">
              {new Date(booking.scheduleAt).toLocaleString()} | {booking.pandit?.name || booking.user?.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={booking.meetingLink} target="_blank" rel="noreferrer">
              <Button>Open in new tab</Button>
            </a>
            <Link to="/dashboard/chat">
              <Button variant="secondary">Back to chat</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[32px] bg-white shadow-soft">
        <iframe
          src={`${booking.meetingLink}#config.prejoinPageEnabled=false`}
          title="DigiPandit Video Consultation"
          className="h-[78vh] w-full border-0"
          allow="camera; microphone; fullscreen; display-capture"
        />
      </div>
    </div>
  );
}
