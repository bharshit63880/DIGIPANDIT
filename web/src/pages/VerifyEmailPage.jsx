import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { api } from "../lib/api";
import { fetchCurrentUser } from "../features/auth/authSlice";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const initialEmail = useMemo(
    () => location.state?.email || authUser?.email || "",
    [authUser?.email, location.state?.email]
  );

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState(
    location.state?.email
      ? "A verification code has been sent automatically. In demo mode, you can find it in the backend mock email log."
      : ""
  );
  const [error, setError] = useState("");

  const handleRequestOtp = async () => {
    try {
      setRequesting(true);
      setError("");
      setMessage("");
      await api.post("/auth/verify-email/request", { email });
      setMessage("A verification code has been sent. In demo mode, you can find it in the backend mock email log.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRequesting(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    try {
      setVerifying(true);
      setError("");
      setMessage("");
      await api.post("/auth/verify-email", { email, otp });
      setMessage("Your email has been verified successfully.");

      if (localStorage.getItem("digipandit_token")) {
        await dispatch(fetchCurrentUser());
      }

      setTimeout(() => navigate("/"), 1200);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-lg rounded-[36px] bg-white p-8 shadow-soft">
        <h1 className="text-4xl font-bold text-brand-ink">Verify your email</h1>
        <p className="mt-3 text-brand-ink/65">
          Complete your email verification here. In demo mode, the verification code appears in the backend mock email log.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="6 digit OTP" value={otp} maxLength={6} onChange={(event) => setOtp(event.target.value)} />

          {message ? <p className="text-sm text-brand-forest">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" className="w-full" onClick={handleRequestOtp} disabled={requesting || !email}>
              {requesting ? "Sending code..." : "Send or resend code"}
            </Button>
            <Button type="submit" className="w-full" disabled={verifying || !email || otp.length !== 6}>
              {verifying ? "Verifying..." : "Verify email"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-brand-ink/70">
          Want to return to the sign-in page?{" "}
          <Link to="/login" className="font-semibold text-brand-maroon">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
