import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { StatCard } from "../components/StatCard";
import { Button } from "../components/Button";
import { payEntity } from "../lib/payments";

export default function UserDashboardPage() {
  const [summary, setSummary] = useState({
    bookings: [],
    orders: [],
    hawans: [],
    user: null,
  });
  const [message, setMessage] = useState("");
  const [payingId, setPayingId] = useState("");

  const load = async () => {
    const [userRes, bookingRes, orderRes, hawanRes] = await Promise.all([
      api.get("/users/me"),
      api.get("/bookings/me"),
      api.get("/store/orders/me"),
      api.get("/hawans/me/progress"),
    ]);

    setSummary({
      user: userRes.data.data,
      bookings: bookingRes.data.data,
      orders: orderRes.data.data,
      hawans: hawanRes.data.data || [],
    });
  };

  useEffect(() => {
    load();
  }, []);

  const upcoming = summary.bookings.filter((booking) => new Date(booking.scheduleAt) > new Date()).length;
  const pendingPayments = [
    ...summary.bookings
      .filter((booking) => booking.payment?.status !== "PAID" && booking.status !== "CANCELLED" && booking.status !== "REJECTED")
      .map((booking) => ({
        id: booking._id,
        entityType: "BOOKING",
        title: booking.serviceName,
        amount: booking.payment?.amount || booking.servicePrice,
        paymentStatus: booking.payment?.status,
        failureReason: booking.payment?.failureReason,
      })),
    ...summary.orders
      .filter((order) => order.payment?.status !== "PAID")
      .map((order) => ({
        id: order._id,
        entityType: "STORE_ORDER",
        title: "Store order payment",
        amount: order.payment?.amount || order.pricing?.total,
      })),
  ];

  const payNow = async (paymentItem) => {
    try {
      setPayingId(paymentItem.id);
      setMessage("");
      await payEntity({
        entityType: paymentItem.entityType,
        entityId: paymentItem.id,
        title: paymentItem.title,
        customer: summary.user,
      });
      setMessage(`Payment successful for ${paymentItem.title}.`);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPayingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-clay">आपका डैशबोर्ड</p>
        <h1 className="mt-3 text-4xl font-bold text-brand-ink">नमस्ते, {summary.user?.name || "साधक"}</h1>
        <p className="mt-3 text-brand-ink/70">अपने अनुष्ठान, ज्योतिष यात्रा, ऑर्डर और खाता जानकारी एक ही जगह पर देखें।</p>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="आगामी" value={upcoming} detail="आने वाली पूजा और परामर्श" />
        <StatCard label="कुल बुकिंग" value={summary.bookings.length} detail="पुष्ट और लंबित सेवा बुकिंग" />
        <StatCard label="स्टोर ऑर्डर" value={summary.orders.length} detail="पूजा सामग्री के ऑर्डर" />
        <StatCard label="हवन गाइड" value={summary.hawans.length} detail="सहेजे, सक्रिय और पूरे अनुष्ठान" />
      </div>

      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-bold text-brand-ink">आपकी हवन यात्राएँ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {summary.hawans.length ? summary.hawans.slice(0, 6).map((entry) => {
            const completed = Boolean(entry.completedAt);
            return (
              <div key={entry._id} className="rounded-[24px] border border-brand-sand p-5">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{completed ? "Completed" : entry.saved ? "Saved" : "In progress"}</p>
                <h3 className="mt-3 text-xl font-bold text-brand-ink">{entry.hawan?.title}</h3>
                <p className="mt-2 text-sm text-brand-ink/65">{entry.completedStepIds?.length || 0} steps complete · Last opened {new Date(entry.lastViewedAt || entry.updatedAt).toLocaleDateString()}</p>
                <a href={`/hawan-guide/${entry.hawan?.slug}`} className="mt-4 inline-flex text-sm font-bold text-brand-maroon">{completed ? "View guide" : "Resume guide"} →</a>
              </div>
            );
          }) : <p className="text-sm text-brand-ink/65">No Hawan guide saved yet. Start from the Hawan Guide section.</p>}
        </div>
      </div>

      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-bold text-brand-ink">लंबित भुगतान</h2>
        {message ? <p className="mt-3 text-sm font-medium text-brand-maroon">{message}</p> : null}
        <div className="mt-6 space-y-4">
          {pendingPayments.length ? (
            pendingPayments.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[24px] border border-brand-sand p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{item.entityType === "BOOKING" ? "Booking" : "Store order"}</p>
                  <h3 className="mt-2 text-xl font-bold text-brand-ink">{item.title}</h3>
                  <p className="mt-2 text-sm text-brand-ink/65">Amount due: Rs. {item.amount}</p>
                  {item.failureReason ? <p className="mt-2 text-sm text-red-600">{item.failureReason}</p> : null}
                </div>
                <Button onClick={() => payNow(item)} disabled={payingId === item.id}>
                  {payingId === item.id ? "Processing..." : item.paymentStatus === "FAILED" ? "Retry payment" : "Pay now"}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-brand-ink/65">No pending payments. Sab payments cleared hain.</p>
          )}
        </div>
      </div>

      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-bold text-brand-ink">हाल की गतिविधि</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {summary.bookings.slice(0, 4).map((booking) => (
            <div key={booking._id} className="rounded-[24px] border border-brand-sand p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{booking.status}</p>
              <h3 className="mt-3 text-xl font-bold text-brand-ink">{booking.serviceName}</h3>
              <p className="mt-2 text-sm text-brand-ink/65">{new Date(booking.scheduleAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
