import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { api } from "../lib/api";

export default function ForgotPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const presetEmail = useMemo(() => location.state?.email || "", [location.state?.email]);

  const [email, setEmail] = useState(presetEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequestOtp = async () => {
    try {
      setRequesting(true);
      setError("");
      setMessage("");
      await api.post("/auth/forgot-password", { email });
      setMessage("A password reset code has been sent. In demo mode, you can find it in the backend mock email log.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRequesting(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();

    try {
      setResetting(true);
      setError("");
      setMessage("");
      await api.post("/auth/reset-password", { email, otp, newPassword });
      setMessage("Your password has been reset successfully. You can now sign in with your new password.");
      setTimeout(() => navigate("/login", { state: { email } }), 1200);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-lg rounded-[36px] bg-white p-8 shadow-soft">
        <h1 className="text-4xl font-bold text-brand-ink">Forgot password</h1>
        <p className="mt-3 text-brand-ink/65">
          Reset your password using the email verification code. In demo mode, the code appears in the backend mock email log.
        </p>

        <form onSubmit={handleReset} className="mt-8 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="6 digit OTP" value={otp} maxLength={6} onChange={(event) => setOtp(event.target.value)} />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          {message ? <p className="text-sm text-brand-forest">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" className="w-full" onClick={handleRequestOtp} disabled={requesting || !email}>
              {requesting ? "Sending code..." : "Send or resend code"}
            </Button>
            <Button type="submit" className="w-full" disabled={resetting || !email || otp.length !== 6 || newPassword.length < 6}>
              {resetting ? "Resetting..." : "Reset password"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-brand-ink/70">
          Need to sign in or verify your email?{" "}
          <Link to="/login" className="font-semibold text-brand-maroon">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
