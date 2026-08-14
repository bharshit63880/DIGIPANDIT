import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { registerUser } from "../features/auth/authSlice";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    state: "",
    role: "USER",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const action = await dispatch(registerUser(form));

    if (registerUser.fulfilled.match(action)) {
      navigate("/verify-email", {
        state: {
          email: form.email,
        },
      });
    }
  };

  return (
    <main className="dp-auth-page dp-auth-page--register">
      <div className="dp-auth-glow" aria-hidden="true" />
      <div className="dp-auth-shell">
        <section className="dp-auth-intro" aria-labelledby="register-intro-title">
          <div className="dp-auth-sigil" aria-hidden="true"><img src="/digipandit-emblem.webp" alt="" /></div>
          <p className="dp-auth-kicker">DigiPandit · नवीन आरंभ</p>
          <h2 id="register-intro-title">विश्वसनीय मार्गदर्शन के लिए अपना स्थान बनाएं।</h2>
          <p>एक खाते से बुकिंग, परामर्श, हवन प्रगति और पूजा स्टोर की यात्रा संभालें।</p>
          <div className="dp-auth-trust"><span>सुरक्षित जानकारी</span><span>सरल अनुभव</span><span>आपका नियंत्रण</span></div>
        </section>

        <section className="dp-auth-card dp-auth-card--wide" aria-labelledby="register-heading">
        <p className="dp-auth-kicker">नवीन आरंभ</p>
        <h1 id="register-heading">अपना DigiPandit खाता बनाएँ</h1>
        <p className="dp-auth-copy">
          श्रद्धालु या पंडित के रूप में पंजीकरण करें। अगले चरण में ईमेल सत्यापन पूरा करें।
        </p>

        <form onSubmit={handleSubmit} className="dp-auth-form mt-8 grid gap-4 md:grid-cols-2">
          <Input label="पूरा नाम" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="ईमेल" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="दूरभाष क्रमांक" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="कूटशब्द" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="शहर" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="राज्य" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />

          <label className="dp-auth-select flex flex-col gap-2 text-sm font-medium md:col-span-2">
            <span>खाते का प्रकार</span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none"
            >
              <option value="USER">श्रद्धालु</option>
              <option value="PANDIT">पंडित / ज्योतिषाचार्य</option>
            </select>
          </label>

          {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}

          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "खाता बनाया जा रहा है..." : "खाता बनाएँ"}
            </Button>
          </div>
        </form>

        <p className="dp-auth-switch mt-6 text-sm">
          पहले से खाता है?{" "}
          <Link to="/login" className="font-semibold text-brand-maroon">
            प्रवेश करें
          </Link>
        </p>
        <p className="dp-auth-switch mt-2 text-sm">
          नया सत्यापन संकेत चाहिए?{" "}
          <Link to="/verify-email" state={{ email: form.email }} className="font-semibold text-brand-maroon">
            ईमेल सत्यापित करें
          </Link>
        </p>
        </section>
      </div>
    </main>
  );
}
