import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { loginUser } from "../features/auth/authSlice";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const expiredMessage =
    location.state?.reason === "expired" ? "आपका सत्र समाप्त हो गया है। आगे बढ़ने के लिए दोबारा प्रवेश करें।" : "";
  const resetMessage =
    location.state?.email ? `आपका कूटशब्द सफलतापूर्वक बदल गया है। ${location.state.email} से प्रवेश करें।` : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const action = await dispatch(loginUser(form));

    if (loginUser.fulfilled.match(action)) {
      const roleHome = {
        ADMIN: "/admin",
        PANDIT: "/pandit-dashboard",
        USER: "/",
      };
      navigate(location.state?.from || roleHome[action.payload.user.role] || "/");
    }
  };

  return (
    <main className="dp-auth-page">
      <div className="dp-auth-glow" aria-hidden="true" />
      <div className="dp-auth-shell">
        <section className="dp-auth-intro" aria-labelledby="login-intro-title">
          <div className="dp-auth-sigil" aria-hidden="true"><img src="/digipandit-emblem.webp" alt="" /></div>
          <p className="dp-auth-kicker">DigiPandit · सुरक्षित प्रवेश</p>
          <h2 id="login-intro-title">आपकी आध्यात्मिक यात्रा फिर से यहीं से आगे बढ़ती है।</h2>
          <p>अपनी बुकिंग, परामर्श, पूजा सामग्री और व्यक्तिगत डैशबोर्ड तक सुरक्षित रूप से पहुँचें।</p>
          <div className="dp-auth-trust"><span>सुरक्षित सत्र</span><span>स्पष्ट सेवाएँ</span><span>गोपनीयता का सम्मान</span></div>
        </section>

        <section className="dp-auth-card" aria-labelledby="login-heading">
          <p className="dp-auth-kicker">स्वागतम्</p>
          <h1 id="login-heading">पुनः स्वागत है</h1>
          <p className="dp-auth-copy">अपनी बुकिंग, बातचीत, सामग्री के आदेश और व्यक्तिगत पटल को एक स्थान से सँभालें।</p>

        <form onSubmit={handleSubmit} className="dp-auth-form mt-8 space-y-4">
          <Input label="ईमेल" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            label="कूटशब्द"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {expiredMessage ? <p className="text-sm text-brand-maroon">{expiredMessage}</p> : null}
          {resetMessage ? <p className="text-sm text-brand-forest">{resetMessage}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "प्रवेश हो रहा है..." : "प्रवेश करें"}
          </Button>
        </form>

        <div className="dp-auth-links mt-5 flex flex-wrap gap-4 text-sm">
          <Link to="/forgot-password" state={{ email: form.email }} className="font-semibold text-brand-maroon">
            कूटशब्द भूल गए?
          </Link>
          <Link to="/verify-email" state={{ email: form.email }} className="font-semibold text-brand-maroon">
            ईमेल सत्यापित करें
          </Link>
        </div>

        <p className="dp-auth-switch mt-6 text-sm">
          पहली बार आए हैं?{" "}
          <Link to="/register" className="font-semibold text-brand-maroon">
            खाता बनाएँ
          </Link>
        </p>
        </section>
      </div>
    </main>
  );
}
