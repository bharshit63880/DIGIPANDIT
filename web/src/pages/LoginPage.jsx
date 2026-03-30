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
      navigate(location.state?.from || "/");
    }
  };

  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-lg rounded-[36px] bg-white p-8 shadow-soft">
        <h1 className="text-4xl font-bold text-brand-ink">Welcome back</h1>
        <p className="mt-3 text-brand-ink/65">Sign in to manage bookings, chat, store orders, and dashboard access.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <Link to="/forgot-password" state={{ email: form.email }} className="font-semibold text-brand-maroon">
            Forgot your password?
          </Link>
          <Link to="/verify-email" state={{ email: form.email }} className="font-semibold text-brand-maroon">
            Verify your email
          </Link>
        </div>

        <p className="mt-6 text-sm text-brand-ink/70">
          New here?{" "}
          <Link to="/register" className="font-semibold text-brand-maroon">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
