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
    <div className="container-shell py-16">
      <div className="mx-auto max-w-2xl rounded-[36px] bg-white p-8 shadow-soft">
        <h1 className="text-4xl font-bold text-brand-ink">Create your DigiPandit account</h1>
        <p className="mt-3 text-brand-ink/65">
          Register as a customer or pandit. Email verification will be available as the next step after registration.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />

          <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink md:col-span-2">
            <span>Account type</span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none"
            >
              <option value="USER">User</option>
              <option value="PANDIT">Pandit / Astrologer</option>
            </select>
          </label>

          {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}

          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-brand-ink/70">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-maroon">
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-sm text-brand-ink/70">
          Need a new verification code?{" "}
          <Link to="/verify-email" state={{ email: form.email }} className="font-semibold text-brand-maroon">
            Verify your email
          </Link>
        </p>
      </div>
    </div>
  );
}
