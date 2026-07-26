import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CircleCheck, CircleX, CreditCard, ReceiptText } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { BookingReceiptCard } from "../components/BookingReceiptCard";
import { fetchCurrentUser } from "../features/auth/authSlice";
import { clearCart } from "../features/cart/cartSlice";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function PaymentStatusPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "failed";
  const entityType = searchParams.get("entityType") || "";
  const entityId = searchParams.get("entityId") || "";
  const message = searchParams.get("message") || "Payment status could not be resolved.";
  const title = searchParams.get("title") || "Payment";
  const amount = Number(searchParams.get("amount") || 0);
  const isSuccess = status === "success";
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    if (entityType === "WALLET_TOPUP") {
      dispatch(fetchCurrentUser());
    }

    if (entityType === "STORE_ORDER") {
      dispatch(clearCart());
    }
  }, [dispatch, entityType, isSuccess]);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        if (entityType === "BOOKING" && entityId) {
          const response = await api.get(`/bookings/${entityId}`);
          setDetails(response.data.data);
          return;
        }

        if (entityType === "STORE_ORDER" && entityId) {
          const response = await api.get(`/store/orders/${entityId}`);
          setDetails(response.data.data);
          return;
        }

        if (entityType === "WALLET_TOPUP") {
          const response = await api.get("/wallet");
          setDetails(response.data.data.wallet);
        }
      } catch (error) {
        setDetails(null);
      }
    };

    loadDetails();
  }, [entityId, entityType]);

  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[36px] bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {isSuccess ? <CircleCheck className="h-7 w-7" /> : <CircleX className="h-7 w-7" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Payment Status</p>
                <h1 className="mt-2 text-4xl font-bold text-brand-ink">
                  {isSuccess ? "Payment completed successfully" : "Payment was not completed"}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-8 text-brand-ink/70">{message}</p>
              </div>
            </div>

            <div className="rounded-[24px] bg-brand-cream/70 p-5 md:min-w-[220px]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-clay">Summary</p>
              <p className="mt-2 text-lg font-bold text-brand-ink">{title}</p>
              <p className="mt-2 text-sm text-brand-ink/70">Amount: {formatCurrency(amount)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {entityType === "BOOKING" ? (
              <Link to="/dashboard/bookings">
                <Button>{isSuccess ? "Open bookings" : "Retry from bookings"}</Button>
              </Link>
            ) : null}
            {entityType === "STORE_ORDER" ? (
              <Link to="/cart">
                <Button>{isSuccess ? "Continue shopping" : "Return to cart"}</Button>
              </Link>
            ) : null}
            {entityType === "WALLET_TOPUP" ? (
              <Link to="/astrology">
                <Button>{isSuccess ? "Return to astrology" : "Try wallet top-up again"}</Button>
              </Link>
            ) : null}
            <Link to="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
          </div>
        </section>

        {entityType === "BOOKING" && details ? <BookingReceiptCard booking={details} title="Booking Receipt" /> : null}

        {entityType === "STORE_ORDER" && details ? (
          <section className="rounded-[36px] bg-white p-8 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-maroon">
                <ReceiptText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Store Order</p>
                <h2 className="mt-2 text-3xl font-bold text-brand-ink">Order summary</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {details.items?.map((item) => (
                <div key={`${item.product}-${item.name}`} className="flex items-center justify-between gap-4 rounded-[24px] bg-brand-cream/70 px-4 py-4 text-sm text-brand-ink">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {entityType === "WALLET_TOPUP" && details ? (
          <section className="rounded-[36px] bg-white p-8 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-maroon">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Wallet Balance</p>
                <h2 className="mt-2 text-3xl font-bold text-brand-ink">{formatCurrency(details.balance)}</h2>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
