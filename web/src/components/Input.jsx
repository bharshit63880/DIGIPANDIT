export function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink">
      {label ? <span>{label}</span> : null}
      <input
        className="min-h-11 rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none transition placeholder:text-brand-ink/35 focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/15"
        {...props}
      />
    </label>
  );
}
