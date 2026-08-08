import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "./Button";

export function SafetyConfirmation({ instructions, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-ink/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="safety-title">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-lift sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800"><AlertTriangle className="h-6 w-6" /></div>
            <div><p className="eyebrow">Mandatory safety check</p><h2 id="safety-title" className="mt-2 text-3xl text-brand-ink">Before you light any flame</h2></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-brand-mist" aria-label="सुरक्षा निर्देश बंद करें"><X className="h-5 w-5" /></button>
        </div>
        <ul className="mt-6 grid gap-3">
          {instructions.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-brand-mist p-4 text-sm leading-6 text-brand-ink/80"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />{item}</li>)}
        </ul>
        <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Stop immediately if smoke becomes excessive or the flame cannot be controlled. Seek professional assistance whenever you are unsure.</p>
        <Button onClick={onConfirm} className="mt-6 w-full">I have reviewed the safety instructions</Button>
      </div>
    </div>
  );
}
