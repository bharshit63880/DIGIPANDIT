import { BookOpenCheck } from "lucide-react";

export function HawanSourceAttribution({ source, status }) {
  if (!source) return null;
  return <div className="rounded-2xl border border-brand-gold/30 bg-amber-50 p-4 text-sm text-amber-950">
    <p className="flex items-center gap-2 font-bold"><BookOpenCheck className="h-4 w-4" />स्रोत विवरण · {status || source.verificationStatus}</p>
    <p className="mt-2">{source.sourceDocument} · {source.sourceSection} · PDF p. {source.sourcePage}{source.sourcePrintedPage ? ` / printed p. ${source.sourcePrintedPage}` : ""}</p>
    {source.tradition ? <p className="mt-1 text-xs">Tradition: {source.tradition}</p> : null}
  </div>;
}
