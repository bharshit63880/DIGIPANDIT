import { RotateCcw, Undo2 } from "lucide-react";
import { useState } from "react";

export function RitualCounter({ label = "Mantra counter", initial = 0, target = 11, onChange }) {
  const [count, setCount] = useState(initial);
  const progress = Math.min(100, Math.round((count / Math.max(target, 1)) * 100));
  const update = (value) => {
    const next = Math.max(0, value);
    setCount(next);
    onChange?.(next);
    if (navigator.vibrate && next > count) navigator.vibrate(next === target ? [40, 40, 80] : 20);
  };
  return (
    <div className="rounded-[28px] bg-brand-ink p-5 text-white">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">{label}</p><p className="mt-1 text-sm text-white/60">Target {target}</p></div>
        <span className="text-sm font-bold text-white/70">{progress}%</span>
      </div>
      <button type="button" onClick={() => update(count + 1)} aria-label={`Increase ${label}`} className="mx-auto mt-5 grid h-36 w-36 place-items-center rounded-full border-8 border-brand-gold bg-white text-brand-ink shadow-lift">
        <span><strong className="block text-4xl">{count}</strong><small className="text-xs font-bold uppercase tracking-wider">Tap</small></span>
      </button>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={() => update(count - 1)} disabled={!count} className="rounded-xl bg-white/10 p-3 disabled:opacity-40" aria-label="Undo last count"><Undo2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => count && window.confirm("Reset this counter?") && update(0)} disabled={!count} className="rounded-xl bg-white/10 p-3 disabled:opacity-40" aria-label="Reset counter"><RotateCcw className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
