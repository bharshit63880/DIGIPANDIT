import clsx from "clsx";

export function Button({ className, variant = "primary", ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border border-brand-gold bg-brand-gold text-brand-ink shadow-[0_10px_28px_rgba(210,151,52,0.2)] hover:bg-[#f0c96e] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(210,151,52,0.3)]",
        variant === "secondary" && "border border-brand-gold/45 bg-black/55 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10",
        variant === "ghost" && "border border-transparent bg-transparent text-brand-gold hover:border-brand-gold/30 hover:bg-brand-gold/10",
        className
      )}
      {...props}
    />
  );
}
