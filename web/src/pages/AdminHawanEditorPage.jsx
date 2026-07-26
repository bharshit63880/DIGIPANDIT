import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { api } from "../lib/api";

const categories = ["POPULAR","CAREER","MARRIAGE","HEALTH","WEALTH","EDUCATION","FAMILY","GRAH_DOSH","SPIRITUAL","FESTIVAL","PROPERTY","BUSINESS"];
const emptySource = { sourceDocument: "", sourceSection: "", sourcePage: 1, sourcePrintedPage: "", tradition: "", verificationStatus: "NEEDS_REVIEW", reviewNote: "" };
const emptyMaterial = { name: "", description: "", quantity: 1, unit: "item", required: true, purpose: "", alternatives: [], product: null, source: { ...emptySource }, quantityStatus: "NOT_STATED", productMappingStatus: "UNMAPPED" };
const emptyMantra = { key: "main", title: "", devanagari: "", hindiTransliteration: "", englishTransliteration: "", meaning: "", audioUrl: "", defaultRepetitionCount: null, source: { ...emptySource }, audioVerificationStatus: "NEEDS_REVIEW" };
const emptyStep = { order: 1, title: "", description: "", mantraKey: "", repetitionCount: 0, durationSeconds: 0, safetyNote: "", requiresManualConfirmation: true, isFireRelated: false, videoUrl: "", phase: "", source: { ...emptySource } };
const emptyFaq = { question: "", answer: "" };
const emptyForm = {
  title: "", slug: "", shortDescription: "", fullDescription: "", category: "POPULAR",
  purposes: [], benefits: [], difficulty: "BEGINNER", durationMinutes: 60,
  estimatedCostRange: { min: 0, max: 0 }, participantRange: { min: 1, max: 8 },
  panditRecommended: false, fastingInformation: "", direction: "East or north-east",
  clothingSuggestion: "", locationRequirements: [], prerequisites: [], materials: [{ ...emptyMaterial }],
  steps: [{ ...emptyStep }], mantras: [{ ...emptyMantra }], safetyInstructions: [
    "Use a stable, fire-resistant Hawan Kund.",
    "Keep water, sand, or an extinguisher nearby.",
    "Maintain ventilation and never leave fire unattended.",
  ],
  faqs: [], relatedProductIds: [], relatedPanditSpecialisations: ["Hawan"], tags: [], isFeatured: false, isPublished: false, source: { ...emptySource }, tradition: "", verificationStatus: "NEEDS_REVIEW", reviewNote: "", guideMode: "SOURCE_DRAFT", purposeOfferings: [],
};
const lines = (value) => value.split("\n").map((item) => item.trim()).filter(Boolean);

function Field({ label, value, onChange, type = "text", min }) {
  return <label className="grid gap-2 text-sm font-bold"><span>{label}</span><input type={type} min={min} value={value} onChange={onChange} className="rounded-2xl border border-brand-sand px-4 py-3 font-normal outline-none focus:border-brand-clay" /></label>;
}
function Area({ label, value, onChange, rows = 4, hint }) {
  return <label className="grid gap-2 text-sm font-bold"><span>{label}</span><textarea rows={rows} value={value} onChange={onChange} className="rounded-2xl border border-brand-sand px-4 py-3 font-normal outline-none focus:border-brand-clay" />{hint ? <small className="font-normal text-brand-ink/50">{hint}</small> : null}</label>;
}

export default function AdminHawanEditorPage() {
  const { hawanId = "new" } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(hawanId !== "new");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (hawanId === "new") return;
    api.get("/admin/hawans").then((response) => {
      const item = response.data.data.find((guide) => guide._id === hawanId);
      if (!item) throw new Error("Hawan guide not found");
      setForm({ ...emptyForm, ...item });
    }).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, [hawanId]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateListItem = (key, index, patch) => setForm((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const removeListItem = (key, index) => setForm((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));
  const addListItem = (key, value) => setForm((current) => ({ ...current, [key]: [...current[key], { ...value, ...(key === "steps" ? { order: current.steps.length + 1 } : {}) }] }));
  const uploadAudio = async (file, index) => {
    if (!file) return;
    const payload = new FormData();
    payload.append("audio", file);
    try {
      setMessage("Uploading mantra audio…");
      const response = await api.post("/uploads/audio", payload);
      updateListItem("mantras", index, { audioUrl: response.data.data.url });
      setMessage("Audio uploaded and attached.");
    } catch (error) { setMessage(error.message); }
  };
  const uploadCover = async (file) => {
    if (!file) return;
    const payload = new FormData();
    payload.append("image", file);
    try {
      setMessage("Uploading cover image…");
      const response = await api.post("/uploads/image", payload);
      set("coverImage", response.data.data);
      setMessage("Cover image uploaded.");
    } catch (error) { setMessage(error.message); }
  };
  const save = async () => {
    try {
      setSaving(true);
      setMessage("");
      const payload = {
        ...form,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        durationMinutes: Number(form.durationMinutes),
        materials: form.materials.map((item) => ({ ...item, quantity: Number(item.quantity), product: item.product || null, alternatives: item.alternatives || [] })),
        steps: form.steps.map((item, index) => ({ ...item, order: index + 1, repetitionCount: Number(item.repetitionCount || 0), durationSeconds: Number(item.durationSeconds || 0) })),
        mantras: form.mantras.map((item) => ({ ...item, defaultRepetitionCount: Number(item.defaultRepetitionCount || 11) })),
      };
      delete payload._id; delete payload.createdAt; delete payload.updatedAt; delete payload.__v; delete payload.isArchived; delete payload.createdBy; delete payload.updatedBy; delete payload.completionCount; delete payload.ratingAverage;
      if (hawanId === "new") {
        const response = await api.post("/admin/hawans", payload);
        navigate(`/admin/hawans/${response.data.data._id}/edit`, { replace: true });
      } else await api.patch(`/admin/hawans/${hawanId}`, payload);
      setMessage("Structured Hawan guide saved successfully.");
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };
  const updateReview = async (verificationStatus) => {
    if (hawanId === "new") return setMessage("Save the guide before changing its review status.");
    try { const response = await api.patch(`/admin/hawans/${hawanId}/review`, { verificationStatus, reviewNote: form.reviewNote || "" }); setForm((current) => ({ ...current, ...response.data.data })); setMessage("Review status updated."); } catch (error) { setMessage(error.message); }
  };

  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-soft">Loading structured editor…</div>;
  return <div className="space-y-6">
    <div className="rounded-[32px] bg-brand-ink p-7 text-white"><Link to="/admin" className="inline-flex items-center gap-2 text-sm text-brand-gold"><ArrowLeft className="h-4 w-4" />Admin Console</Link><h1 className="mt-4 text-4xl">{hawanId === "new" ? "Create Hawan guide" : `Edit ${form.title}`}</h1><p className="mt-2 text-sm text-white/60">Every material, step, mantra, safety note and FAQ remains structured and independently editable.</p></div>
    {message ? <div role="status" className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">{message}</div> : null}
    <section className="rounded-[32px] bg-white p-7 shadow-soft"><h2 className="text-3xl">Core details</h2><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} /><Field label="Slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} /><label className="grid gap-2 text-sm font-bold"><span>Category</span><select value={form.category} onChange={(e) => set("category", e.target.value)} className="rounded-2xl border border-brand-sand px-4 py-3">{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-bold"><span>Difficulty</span><select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className="rounded-2xl border border-brand-sand px-4 py-3">{["BEGINNER","INTERMEDIATE","ADVANCED"].map((item) => <option key={item}>{item}</option>)}</select></label><Field label="Duration (minutes)" type="number" min="10" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} /><Field label="Direction" value={form.direction} onChange={(e) => set("direction", e.target.value)} /></div><div className="mt-6 rounded-2xl border border-brand-gold/30 bg-amber-50 p-5"><p className="eyebrow">Source and verification</p><div className="mt-4 grid gap-3 md:grid-cols-2"><Field label="Source document" value={form.source?.sourceDocument || ""} onChange={(e) => set("source", { ...form.source, sourceDocument: e.target.value })} /><Field label="Source section" value={form.source?.sourceSection || ""} onChange={(e) => set("source", { ...form.source, sourceSection: e.target.value })} /><Field label="PDF page" type="number" value={form.source?.sourcePage || ""} onChange={(e) => set("source", { ...form.source, sourcePage: Number(e.target.value) })} /><Field label="Printed page" type="number" value={form.source?.sourcePrintedPage || ""} onChange={(e) => set("source", { ...form.source, sourcePrintedPage: Number(e.target.value) })} /><Field label="Tradition" value={form.source?.tradition || ""} onChange={(e) => set("source", { ...form.source, tradition: e.target.value })} /><label className="grid gap-2 text-sm font-bold"><span>Review status</span><select value={form.verificationStatus} onChange={(e) => set("verificationStatus", e.target.value)} className="rounded-2xl border border-brand-sand px-4 py-3">{["DRAFT","NEEDS_REVIEW","VERIFIED","REJECTED"].map((item) => <option key={item}>{item}</option>)}</select></label></div><Area label="Review note" value={form.reviewNote || ""} onChange={(e) => set("reviewNote", e.target.value)} rows={2} /><div className="mt-3 flex gap-3"><Button variant="secondary" onClick={() => updateReview("NEEDS_REVIEW")}>Mark needs review</Button><Button variant="secondary" onClick={() => updateReview("VERIFIED")}>Mark verified</Button></div></div><label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-sand px-4 py-3 text-sm font-bold"><Upload className="h-4 w-4" />Upload cover image<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => uploadCover(e.target.files?.[0])} /></label>{form.coverImage?.url ? <img src={form.coverImage.url} alt="Hawan cover preview" className="mt-4 h-48 w-full rounded-2xl object-cover" /> : null}<div className="mt-4 grid gap-4"><Area label="Short description" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} /><Area label="Full description" value={form.fullDescription} onChange={(e) => set("fullDescription", e.target.value)} /><Area label="Purposes" value={form.purposes.join("\n")} onChange={(e) => set("purposes", lines(e.target.value))} hint="One purpose per line" /><Area label="Benefits" value={form.benefits.join("\n")} onChange={(e) => set("benefits", lines(e.target.value))} hint="Use respectful, non-guaranteed wording" /><Area label="Prerequisites" value={form.prerequisites.join("\n")} onChange={(e) => set("prerequisites", lines(e.target.value))} hint="One prerequisite per line" /><Area label="Location requirements" value={form.locationRequirements.join("\n")} onChange={(e) => set("locationRequirements", lines(e.target.value))} /><Area label="Qualified Pandit specialisations" value={form.relatedPanditSpecialisations.join("\n")} onChange={(e) => set("relatedPanditSpecialisations", lines(e.target.value))} /><Area label="Safety instructions" value={form.safetyInstructions.join("\n")} onChange={(e) => set("safetyInstructions", lines(e.target.value))} hint="One mandatory instruction per line" /></div></section>
    <section className="rounded-[32px] bg-white p-7 shadow-soft"><div className="flex justify-between"><h2 className="text-3xl">Materials</h2><Button variant="secondary" onClick={() => addListItem("materials", emptyMaterial)}><Plus className="mr-2 h-4 w-4" />Material</Button></div><div className="mt-6 space-y-4">{form.materials.map((item,index) => <div key={item._id || index} className="rounded-2xl border border-brand-sand p-5"><div className="grid gap-3 md:grid-cols-3"><Field label="Name" value={item.name} onChange={(e) => updateListItem("materials",index,{name:e.target.value})} /><Field label="Quantity" type="number" value={item.quantity} onChange={(e) => updateListItem("materials",index,{quantity:e.target.value})} /><Field label="Unit" value={item.unit} onChange={(e) => updateListItem("materials",index,{unit:e.target.value})} /></div><Area label="Purpose / description" rows={2} value={item.purpose || ""} onChange={(e) => updateListItem("materials",index,{purpose:e.target.value})} /><button type="button" onClick={() => removeListItem("materials",index)} className="mt-3 inline-flex gap-2 text-sm font-bold text-red-700"><Trash2 className="h-4 w-4" />Remove</button></div>)}</div></section>
    <section className="rounded-[32px] bg-white p-7 shadow-soft"><div className="flex justify-between"><h2 className="text-3xl">Mantras</h2><Button variant="secondary" onClick={() => addListItem("mantras", emptyMantra)}><Plus className="mr-2 h-4 w-4" />Mantra</Button></div><div className="mt-6 space-y-4">{form.mantras.map((item,index) => <div key={`${item.key}-${index}`} className="rounded-2xl border border-brand-sand p-5"><div className="grid gap-3 md:grid-cols-2"><Field label="Key" value={item.key} onChange={(e) => updateListItem("mantras",index,{key:e.target.value})} /><Field label="Title" value={item.title} onChange={(e) => updateListItem("mantras",index,{title:e.target.value})} /></div><Area label="Devanagari" value={item.devanagari} onChange={(e) => updateListItem("mantras",index,{devanagari:e.target.value})} /><Area label="English transliteration" value={item.englishTransliteration} onChange={(e) => updateListItem("mantras",index,{englishTransliteration:e.target.value})} /><Area label="Meaning" value={item.meaning} onChange={(e) => updateListItem("mantras",index,{meaning:e.target.value})} /><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-sand px-4 py-3 text-sm font-bold"><Upload className="h-4 w-4" />Upload audio<input type="file" accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm" className="sr-only" onChange={(e) => uploadAudio(e.target.files?.[0],index)} /></label>{item.audioUrl ? <audio className="mt-3 w-full" controls preload="none" src={item.audioUrl} /> : null}<button type="button" onClick={() => removeListItem("mantras",index)} className="mt-3 block text-sm font-bold text-red-700">Remove mantra</button></div>)}</div></section>
    <section className="rounded-[32px] bg-white p-7 shadow-soft"><div className="flex justify-between"><h2 className="text-3xl">Ordered steps</h2><Button variant="secondary" onClick={() => addListItem("steps", emptyStep)}><Plus className="mr-2 h-4 w-4" />Step</Button></div><div className="mt-6 space-y-4">{form.steps.map((item,index) => <div key={item._id || index} className="rounded-2xl border border-brand-sand p-5"><p className="eyebrow">Step {index+1}</p><div className="mt-3 grid gap-3 md:grid-cols-2"><Field label="Title" value={item.title} onChange={(e) => updateListItem("steps",index,{title:e.target.value})} /><Field label="Mantra key" value={item.mantraKey || ""} onChange={(e) => updateListItem("steps",index,{mantraKey:e.target.value})} /><Field label="Video URL" value={item.videoUrl || ""} onChange={(e) => updateListItem("steps",index,{videoUrl:e.target.value})} /><Field label="Duration seconds" type="number" value={item.durationSeconds || 0} onChange={(e) => updateListItem("steps",index,{durationSeconds:e.target.value})} /></div><Area label="Instruction" value={item.description} onChange={(e) => updateListItem("steps",index,{description:e.target.value})} /><Area label="Contextual safety note" value={item.safetyNote || ""} onChange={(e) => updateListItem("steps",index,{safetyNote:e.target.value})} /><div className="mt-3 flex flex-wrap gap-5 text-sm"><label><input type="checkbox" checked={item.isFireRelated} onChange={(e) => updateListItem("steps",index,{isFireRelated:e.target.checked})} /> Fire-related</label><label><input type="checkbox" checked={item.requiresManualConfirmation} onChange={(e) => updateListItem("steps",index,{requiresManualConfirmation:e.target.checked})} /> Manual confirmation</label></div><button type="button" onClick={() => removeListItem("steps",index)} className="mt-3 text-sm font-bold text-red-700">Remove step</button></div>)}</div></section>
    <section className="rounded-[32px] bg-white p-7 shadow-soft"><div className="flex justify-between"><h2 className="text-3xl">FAQs</h2><Button variant="secondary" onClick={() => addListItem("faqs", emptyFaq)}><Plus className="mr-2 h-4 w-4" />FAQ</Button></div><div className="mt-6 space-y-4">{form.faqs.map((item,index)=><div key={item._id || index} className="rounded-2xl border border-brand-sand p-5"><Field label="Question" value={item.question} onChange={(e)=>updateListItem("faqs",index,{question:e.target.value})}/><Area label="Answer" value={item.answer} onChange={(e)=>updateListItem("faqs",index,{answer:e.target.value})}/><button type="button" onClick={()=>removeListItem("faqs",index)} className="text-sm font-bold text-red-700">Remove FAQ</button></div>)}</div></section>
    <div className="sticky bottom-4 flex justify-end rounded-2xl border border-brand-sand bg-white/95 p-4 shadow-lift backdrop-blur"><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save structured guide"}</Button></div>
  </div>;
}
