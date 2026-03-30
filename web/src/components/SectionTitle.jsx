export function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-clay">{eyebrow}</p> : null}
      <h2 className="text-3xl font-bold text-brand-ink md:text-4xl">{title}</h2>
      {description ? <p className="text-base leading-7 text-brand-ink/70">{description}</p> : null}
    </div>
  );
}
