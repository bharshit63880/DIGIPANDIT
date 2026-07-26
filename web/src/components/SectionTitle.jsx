export function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold text-brand-ink md:text-5xl">{title}</h2>
      {description ? <p className="text-base leading-7 text-brand-ink/70">{description}</p> : null}
    </div>
  );
}
