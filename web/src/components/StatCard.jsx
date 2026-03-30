export function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-clay">{label}</p>
      <p className="mt-3 text-3xl font-bold text-brand-ink">{value}</p>
      <p className="mt-2 text-sm text-brand-ink/65">{detail}</p>
    </div>
  );
}
