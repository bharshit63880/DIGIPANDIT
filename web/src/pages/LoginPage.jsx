import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthConversation, AuthGuideLayout } from "../components/AuthConversation";
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

  const fields = [
    { name: "email", type: "email", question: "कृपया अपना ईमेल बताइए।", placeholder: "आपका ईमेल" },
    { name: "password", type: "password", question: "अब अपना सुरक्षित कूटशब्द दर्ज कीजिए।", placeholder: "आपका कूटशब्द" },
  ];

  return <AuthGuideLayout eyebrow="सुरक्षित प्रवेश" title="पंडित जी आपके साथ हैं" links={<><Link to="/forgot-password" state={{ email: form.email }}>कूटशब्द भूल गए?</Link><Link to="/register">नया खाता बनाएँ</Link><Link to="/verify-email" state={{ email: form.email }}>ईमेल सत्यापित करें</Link></>}>
    <AuthConversation fields={fields} values={form} onChange={(name, value) => setForm({ ...form, [name]: value })} onSubmit={handleSubmit} busy={status === "loading"} error={error} message={expiredMessage || resetMessage} submitLabel="DigiPandit में प्रवेश करें" />
  </AuthGuideLayout>;
}
