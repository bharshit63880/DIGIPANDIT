function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
}

export function BookingReceiptCard({ booking, title = "Payment Receipt", compact = false }) {
  const pricing = booking.pricingBreakdown || {
    basePrice: booking.servicePrice || booking.payment?.amount || 0,
    travelCharge: 0,
    samagriCost: 0,
    extraDakshina: 0,
    videoDakshinaFee: 0,
    total: booking.payment?.amount || booking.servicePrice || 0,
  };

  return (
    <div className={`rounded-[28px] border border-brand-sand/70 bg-white ${compact ? "p-5" : "p-6"} shadow-soft`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-brand-ink">{booking.serviceName}</h3>
          <p className="mt-2 text-sm text-brand-ink/65">Receipt ID: {booking._id?.slice?.(-8)?.toUpperCase?.() || booking._id}</p>
        </div>
        <div className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-maroon">
          {booking.payment?.status || "CREATED"}
        </div>
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        <div className="rounded-[22px] bg-brand-cream/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-clay">Scheduled</p>
          <p className="mt-2 text-sm font-semibold text-brand-ink">{formatDateTime(booking.scheduleAt)}</p>
        </div>
        <div className="rounded-[22px] bg-brand-cream/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-clay">Paid At</p>
          <p className="mt-2 text-sm font-semibold text-brand-ink">{formatDateTime(booking.payment?.paidAt)}</p>
        </div>
        {!compact ? (
          <div className="rounded-[22px] bg-brand-cream/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-clay">Gateway Ref</p>
            <p className="mt-2 break-all text-sm font-semibold text-brand-ink">{booking.payment?.gatewayPaymentId || "Pending"}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-[24px] bg-brand-cream/60 p-4">
        <div className="space-y-3 text-sm text-brand-ink">
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
            <span>Video guidance fee</span>
            <span className="font-semibold">{formatCurrency(pricing.videoDakshinaFee)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-brand-sand/80 pt-3 text-base font-bold">
            <span>Total paid</span>
            <span>{formatCurrency(pricing.total || booking.payment?.amount || 0)}</span>
          </div>
        </div>
      </div>

      {!compact && booking.address ? (
        <div className="mt-6 rounded-[24px] border border-brand-sand/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-clay">Service Address</p>
          <p className="mt-3 text-sm leading-7 text-brand-ink/75">
            {[booking.address.label, booking.address.line1, booking.address.line2, booking.address.landmark, booking.address.city, booking.address.state, booking.address.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
