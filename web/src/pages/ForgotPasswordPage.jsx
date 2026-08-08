import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { postPublicForm } from "../lib/api";

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
      await postPublicForm("/auth/forgot-password", { email });
      setMessage("कूटशब्द बदलने का संकेत आपके ईमेल पर भेज दिया गया है।");
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
      await postPublicForm("/auth/reset-password", { email, otp, newPassword });
      setMessage("आपका कूटशब्द सफलतापूर्वक बदल गया है। अब नए कूटशब्द से प्रवेश करें।");
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
        <h1 className="text-4xl font-bold text-brand-ink">कूटशब्द भूल गए</h1>
        <p className="mt-3 text-brand-ink/65">ईमेल पर भेजे गए सत्यापन संकेत से अपना कूटशब्द बदलें।</p>

        <form onSubmit={handleReset} className="mt-8 space-y-4">
          <Input label="ईमेल" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="छह अंकों का सत्यापन संकेत" value={otp} maxLength={6} onChange={(event) => setOtp(event.target.value)} />
          <Input
            label="नया कूटशब्द"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          {message ? <p className="text-sm text-brand-forest">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" className="w-full" onClick={handleRequestOtp} disabled={requesting || !email}>
              {requesting ? "संकेत भेजा जा रहा है..." : "संकेत भेजें या पुनः भेजें"}
            </Button>
            <Button type="submit" className="w-full" disabled={resetting || !email || otp.length !== 6 || newPassword.length < 6}>
              {resetting ? "कूटशब्द बदला जा रहा है..." : "कूटशब्द बदलें"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-brand-ink/70">
          प्रवेश या ईमेल सत्यापन करना है?{" "}
          <Link to="/login" className="font-semibold text-brand-maroon">
            प्रवेश पर लौटें
          </Link>
        </p>
      </div>
    </div>
  );
}
