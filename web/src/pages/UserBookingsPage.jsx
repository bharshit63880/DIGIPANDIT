import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { payEntity } from "../lib/payments";
import { BookingReceiptCard } from "../components/BookingReceiptCard";

export default function UserBookingsPage() {
  const user = useSelector((state) => state.auth.user);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [payingId, setPayingId] = useState("");
  const [expandedReceiptId, setExpandedReceiptId] = useState("");

  const loadBookings = async () => {
    const response = await api.get("/bookings/me");
    setBookings(response.data.data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    await api.patch(`/bookings/${bookingId}/status`, { status: "CANCELLED" });
    loadBookings();
  };

  const payBooking = async (booking) => {
    try {
      setPayingId(booking._id);
      setMessage("");
      await payEntity({
        entityType: "BOOKING",
        entityId: booking._id,
        title: booking.serviceName,
        customer: user,
      });
      setMessage(`Payment successful for ${booking.serviceName}.`);
      setExpandedReceiptId(booking._id);
      await loadBookings();
    } catch (error) {
      setMessage(error.message);
      await loadBookings();
    } finally {
      setPayingId("");
    }
  };

  return (
    <div className="rounded-[36px] bg-white p-8 shadow-soft">
      <h1 className="text-4xl font-bold text-brand-ink">Your bookings</h1>
      {message ? <p className="mt-4 text-sm font-medium text-brand-maroon">{message}</p> : null}
      <div className="mt-8 space-y-4">
        {bookings.map((booking) => (
          <div key={booking._id} className="rounded-[24px] border border-brand-sand p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{booking.status}</p>
                <h2 className="mt-2 text-xl font-bold text-brand-ink">{booking.serviceName}</h2>
                <p className="mt-2 text-sm text-brand-ink/65">{booking.pandit?.name} | {new Date(booking.scheduleAt).toLocaleString()}</p>
                <p className="mt-2 text-sm text-brand-ink/65">
                  Session mode: <span className="font-semibold text-brand-ink">{booking.meetingMode === "ONLINE" ? "Online consultation" : "Offline visit"}</span>
                </p>
                <p className="mt-2 text-sm text-brand-ink/65">
                  Payment: <span className={`font-semibold ${booking.payment?.status === "FAILED" ? "text-red-600" : "text-brand-maroon"}`}>{booking.payment?.status || "CREATED"}</span>
                </p>
                {booking.payment?.status === "FAILED" ? (
                  <p className="mt-2 text-sm text-red-600">
                    {booking.payment?.failureReason || "Payment did not complete. You can retry safely."}
                  </p>
                ) : null}
                {booking.meetingMode === "ONLINE" && booking.payment?.status !== "PAID" ? (
                  <p className="mt-2 text-sm text-brand-maroon">
                    Payment complete karte hi video-call ya online consultation button yahin dikh jayega.
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {booking.meetingLink && booking.payment?.status === "PAID" && booking.status !== "CANCELLED" && booking.status !== "REJECTED" ? (
                  <Link to={`/video-call/${booking._id}`}>
                    <Button variant="secondary">Join video call</Button>
                  </Link>
                ) : null}
                {booking.payment?.status !== "PAID" && booking.status !== "CANCELLED" && booking.status !== "REJECTED" ? (
                  <Button onClick={() => payBooking(booking)} disabled={payingId === booking._id}>
                    {payingId === booking._id
                      ? "Processing..."
                      : booking.payment?.status === "FAILED"
                        ? `Retry payment Rs. ${booking.payment?.amount || booking.servicePrice}`
                        : `Pay Rs. ${booking.payment?.amount || booking.servicePrice}`}
                  </Button>
                ) : null}
                {booking.payment?.status === "PAID" ? (
                  <Button variant="secondary" onClick={() => setExpandedReceiptId((current) => (current === booking._id ? "" : booking._id))}>
                    {expandedReceiptId === booking._id ? "Hide receipt" : "View receipt"}
                  </Button>
                ) : null}
                {booking.status === "PENDING" || booking.status === "ACCEPTED" ? (
                  <Button variant="secondary" onClick={() => cancelBooking(booking._id)}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>

            {booking.payment?.status === "PAID" && expandedReceiptId === booking._id ? (
              <div className="mt-5">
                <BookingReceiptCard booking={booking} title="Invoice Receipt" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
