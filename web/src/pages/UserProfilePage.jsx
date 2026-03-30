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
    await api.patch("/users/me", form);
    setMessage("Your profile has been updated successfully.");
  };

  return (
    <div className="rounded-[36px] bg-white p-8 shadow-soft">
      <h1 className="text-4xl font-bold text-brand-ink">Profile</h1>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <div className="md:col-span-2">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
      {message ? <p className="mt-4 text-sm text-brand-maroon">{message}</p> : null}
    </div>
  );
}
