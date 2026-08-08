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
    location.state?.reason === "expired" ? "Your session has expired. Please sign in again to continue." : "";
  const resetMessage =
    location.state?.email ? `Your password has been reset successfully. Sign in with ${location.state.email}.` : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const action = await dispatch(loginUser(form));

    if (loginUser.fulfilled.match(action)) {
      const roleHome = {
        ADMIN: "/admin",
        PANDIT: "/pandit-dashboard",
        USER: "/dashboard",
      };
      navigate(location.state?.from || roleHome[action.payload.user.role] || "/");
    }
  };

  return (
    <main className="dp-auth-page">
      <div className="dp-auth-glow" aria-hidden="true" />
      <div className="dp-auth-shell">
        <section className="dp-auth-intro" aria-labelledby="login-intro-title">
          <div className="dp-auth-sigil" aria-hidden="true"><span>ॐ</span></div>
          <p className="dp-auth-kicker">DigiPandit · सुरक्षित प्रवेश</p>
          <h2 id="login-intro-title">आपकी आध्यात्मिक यात्रा फिर से यहीं से आगे बढ़ती है।</h2>
          <p>अपनी बुकिंग, परामर्श, पूजा सामग्री और व्यक्तिगत डैशबोर्ड तक सुरक्षित रूप से पहुँचें।</p>
          <div className="dp-auth-trust"><span>सुरक्षित सत्र</span><span>स्पष्ट सेवाएँ</span><span>गोपनीयता का सम्मान</span></div>
        </section>

        <section className="dp-auth-card" aria-labelledby="login-heading">
          <p className="dp-auth-kicker">स्वागतम्</p>
          <h1 id="login-heading">Welcome back</h1>
          <p className="dp-auth-copy">Sign in to manage bookings, chat, store orders, and dashboard access.</p>

        <form onSubmit={handleSubmit} className="dp-auth-form mt-8 space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {expiredMessage ? <p className="text-sm text-brand-maroon">{expiredMessage}</p> : null}
          {resetMessage ? <p className="text-sm text-brand-forest">{resetMessage}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="dp-auth-links mt-5 flex flex-wrap gap-4 text-sm">
          <Link to="/forgot-password" state={{ email: form.email }} className="font-semibold text-brand-maroon">
            Forgot your password?
          </Link>
          <Link to="/verify-email" state={{ email: form.email }} className="font-semibold text-brand-maroon">
            Verify your email
          </Link>
        </div>

        <p className="dp-auth-switch mt-6 text-sm">
          New here?{" "}
          <Link to="/register" className="font-semibold text-brand-maroon">
            Create an account
          </Link>
        </p>
        </section>
      </div>
    </main>
  );
}
