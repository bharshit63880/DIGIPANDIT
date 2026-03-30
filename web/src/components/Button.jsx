import clsx from "clsx";

export function Button({ className, variant = "primary", ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5",
        variant === "primary" && "bg-brand-maroon text-white shadow-soft hover:bg-brand-ink",
        variant === "secondary" && "bg-white text-brand-ink shadow-soft hover:bg-brand-sand",
        variant === "ghost" && "bg-transparent text-brand-maroon hover:bg-white/70",
        className
      )}
      {...props}
    />
  );
}
