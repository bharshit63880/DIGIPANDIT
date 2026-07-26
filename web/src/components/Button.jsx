import clsx from "clsx";

export function Button({ className, variant = "primary", ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-brand-maroon text-white shadow-[0_10px_24px_rgba(0,0,0,0.24)] hover:bg-brand-ink hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.3)]",
        variant === "secondary" && "border border-brand-sand bg-white text-brand-ink hover:border-brand-clay hover:bg-brand-mist",
        variant === "ghost" && "bg-transparent text-brand-maroon hover:bg-brand-blush",
        className
      )}
      {...props}
    />
  );
}
