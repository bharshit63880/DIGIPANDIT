import { Clock3, IndianRupee, Sparkles, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";

const difficultyLabels = { BEGINNER: "आरंभ करने वालों के लिए सरल", INTERMEDIATE: "थोड़ा मार्गदर्शन उपयोगी", ADVANCED: "पंडित मार्गदर्शन उचित" };

export function HawanCard({ hawan, reason }) {
  return (
    <article className="surface-card flex h-full flex-col overflow-hidden">
      <div className="flex min-h-40 items-end bg-gradient-to-br from-brand-maroon via-brand-clay to-brand-gold p-6 text-white">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{hawan.category?.replaceAll("_", " ")}</p>
          <h3 className="mt-2 text-3xl font-bold">{hawan.title}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {reason ? <p className="mb-3 rounded-2xl bg-brand-blush px-4 py-3 text-sm font-medium text-brand-maroon">{reason}</p> : null}
        <p className="text-sm leading-7 text-brand-ink/70">{hawan.shortDescription}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-semibold text-brand-ink/70">
          <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand-clay" />{hawan.durationMinutes} मिनट</span>
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-clay" />{difficultyLabels[hawan.difficulty]}</span>
          <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-brand-clay" />{hawan.estimatedCostRange?.min}–{hawan.estimatedCostRange?.max}</span>
          <span className="flex items-center gap-2"><UserRoundCheck className="h-4 w-4 text-brand-clay" />{hawan.panditRecommended ? "पंडित की सलाह उचित" : "वैकल्पिक सहायता"}</span>
        </div>
        <Link to={`/hawan-guide/${hawan.slug}`} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-brand-maroon px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-ink">
          निर्देशित अनुष्ठान देखें
        </Link>
      </div>
    </article>
  );
}
