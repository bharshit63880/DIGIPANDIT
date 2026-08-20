import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthConversation, AuthGuideLayout } from "../components/AuthConversation";
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

  const fields = [
    { name: "name", question: "शुभ आरंभ के लिए अपना पूरा नाम बताइए।", placeholder: "आपका पूरा नाम" },
    { name: "email", type: "email", question: "अब अपनी ईमेल आईडी साझा कीजिए।", placeholder: "आपका ईमेल" },
    { name: "phone", type: "tel", question: "आपका दूरभाष क्रमांक क्या है?", placeholder: "मोबाइल नंबर" },
    { name: "password", type: "password", question: "अपने खाते के लिए सुरक्षित कूटशब्द चुनिए।", placeholder: "नया कूटशब्द" },
    { name: "city", question: "आप किस शहर में रहते हैं?", placeholder: "आपका शहर" },
    { name: "state", question: "और आपका राज्य?", placeholder: "आपका राज्य" },
    { name: "role", type: "select", question: "अंत में बताइए—आप DigiPandit से कैसे जुड़ना चाहते हैं?", options: [{ value: "USER", label: "श्रद्धालु" }, { value: "PANDIT", label: "पंडित / ज्योतिषाचार्य" }] },
  ];

  return <AuthGuideLayout eyebrow="नवीन शुभारंभ" title="अपनी यात्रा आरंभ करें" links={<><Link to="/login">पहले से खाता है? प्रवेश करें</Link><Link to="/verify-email" state={{ email: form.email }}>ईमेल सत्यापित करें</Link></>}>
    <AuthConversation fields={fields} values={form} onChange={(name, value) => setForm({ ...form, [name]: value })} onSubmit={handleSubmit} busy={status === "loading"} error={error} submitLabel="मेरा खाता बनाएँ" />
  </AuthGuideLayout>;
}
