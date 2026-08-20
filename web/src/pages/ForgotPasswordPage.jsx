import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthConversation, AuthGuideLayout } from "../components/AuthConversation";
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

  const values = { email, otp, newPassword };
  const fields = [
    { name: "email", type: "email", question: "चिंता न करें। पहले अपना पंजीकृत ईमेल बताइए।", placeholder: "आपका ईमेल" },
    { name: "otp", question: "ईमेल पर आया छह अंकों का सत्यापन संकेत लिखिए।", placeholder: "6 अंकों का संकेत" },
    { name: "newPassword", type: "password", question: "अब अपना नया सुरक्षित कूटशब्द चुनिए।", placeholder: "नया कूटशब्द" },
  ];
  const update = (name, value) => ({ email: setEmail, otp: setOtp, newPassword: setNewPassword }[name](value));

  return <AuthGuideLayout eyebrow="सुरक्षित पुनर्प्रवेश" title="हम आपकी सहायता करेंगे" links={<Link to="/login">प्रवेश पर लौटें</Link>}>
    <AuthConversation fields={fields} values={values} onChange={update} onSubmit={handleReset} busy={resetting} error={error} message={message} submitLabel="कूटशब्द बदलें">
      <button type="button" className="dp-guide-otp" onClick={handleRequestOtp} disabled={requesting || !email}>{requesting ? "संकेत भेजा जा रहा है..." : "ईमेल पर सत्यापन संकेत भेजें"}</button>
    </AuthConversation>
  </AuthGuideLayout>;
}
