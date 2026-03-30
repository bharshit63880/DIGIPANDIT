import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { StatCard } from "../components/StatCard";
import { Button } from "../components/Button";
import { payEntity } from "../lib/payments";

export default function UserDashboardPage() {
  const [summary, setSummary] = useState({
    bookings: [],
    orders: [],
    user: null,
  });
  const [message, setMessage] = useState("");
  const [payingId, setPayingId] = useState("");

  const load = async () => {
    const [userRes, bookingRes, orderRes] = await Promise.all([
      api.get("/users/me"),
      api.get("/bookings/me"),
      api.get("/store/orders/me"),
    ]);

    setSummary({
      user: userRes.data.data,
      bookings: bookingRes.data.data,
      orders: orderRes.data.data,
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
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-clay">User Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-brand-ink">Namaste, {summary.user?.name || "Seeker"}</h1>
        <p className="mt-3 text-brand-ink/70">Track your rituals, astrology journeys, orders, and account details from one calm workspace.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Upcoming" value={upcoming} detail="Scheduled pujas and consultations ahead" />
        <StatCard label="Total bookings" value={summary.bookings.length} detail="All confirmed and pending service bookings" />
        <StatCard label="Store orders" value={summary.orders.length} detail="Puja samagri orders placed from the storefront" />
      </div>

      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-bold text-brand-ink">Pending payments</h2>
        {message ? <p className="mt-3 text-sm font-medium text-brand-maroon">{message}</p> : null}
        <div className="mt-6 space-y-4">
          {pendingPayments.length ? (
            pendingPayments.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[24px] border border-brand-sand p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{item.entityType === "BOOKING" ? "Booking" : "Store order"}</p>
                  <h3 className="mt-2 text-xl font-bold text-brand-ink">{item.title}</h3>
                  <p className="mt-2 text-sm text-brand-ink/65">Amount due: Rs. {item.amount}</p>
                </div>
                <Button onClick={() => payNow(item)} disabled={payingId === item.id}>
                  {payingId === item.id ? "Processing..." : "Pay now"}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-brand-ink/65">No pending payments. Sab payments cleared hain.</p>
          )}
        </div>
      </div>

      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-bold text-brand-ink">Recent activity</h2>
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
