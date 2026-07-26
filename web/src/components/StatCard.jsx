export function StatCard({ label, value, detail }) {
  return (
    <div className="surface-card p-6">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-brand-ink">{value}</p>
      <p className="mt-2 text-sm text-brand-ink/65">{detail}</p>
    </div>
  );
}
