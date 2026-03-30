export function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink">
      {label ? <span>{label}</span> : null}
      <input
        className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none transition focus:border-brand-clay"
        {...props}
      />
    </label>
  );
}
