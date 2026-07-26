import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export default function UserProfilePage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    state: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await api.get("/users/me");
      const user = response.data.data;
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        city: user.city || "",
        state: user.state || "",
      });
    };

    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setError("");
      await api.patch("/users/me", form);
      setMessage("आपकी प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई है।");
    } catch (requestError) { setError(requestError.message || "प्रोफ़ाइल अपडेट नहीं हो सकी।"); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-[36px] bg-white p-8 shadow-soft">
      <p className="eyebrow">खाता सेटिंग</p>
      <h1 className="mt-2 text-4xl font-bold text-brand-ink">प्रोफ़ाइल</h1>
      <p className="mt-3 text-sm leading-7 text-brand-ink/65">अपनी संपर्क और स्थान की जानकारी अपडेट रखें, ताकि बुकिंग में सही विवरण इस्तेमाल हो।</p>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        <Input label="पूरा नाम" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="मोबाइल नंबर" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="शहर" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <Input label="राज्य" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <div className="md:col-span-2">
          <Button type="submit" disabled={saving}>{saving ? "सहेजा जा रहा है..." : "बदलाव सहेजें"}</Button>
        </div>
      </form>
      {message ? <p className="mt-4 text-sm text-brand-maroon">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
