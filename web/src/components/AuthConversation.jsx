import { useState } from "react";

export function AuthConversation({ fields, values, onChange, onSubmit, busy, error, message, submitLabel, children }) {
  const [step, setStep] = useState(0);
  const field = fields[step];
  const isLast = step === fields.length - 1;

  const advance = (event) => {
    event.preventDefault();
    if (!values[field.name]?.toString().trim()) return;
    if (!isLast) setStep((current) => current + 1);
    else onSubmit(event);
  };

  return (
    <form className="dp-guide-conversation" onSubmit={advance}>
      <p className="dp-guide-namaste">नमस्ते 🙏</p>
      <p className="dp-guide-question" key={field.name}>{field.question}</p>
      <div className="dp-guide-field" key={`${field.name}-field`}>
        {field.type === "select" ? (
          <select autoFocus value={values[field.name]} onChange={(event) => onChange(field.name, event.target.value)}>
            {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        ) : (
          <input autoFocus required type={field.type || "text"} value={values[field.name]} placeholder={field.placeholder} onChange={(event) => onChange(field.name, event.target.value)} />
        )}
      </div>
      <div className="dp-guide-progress" aria-label={`चरण ${step + 1} / ${fields.length}`}>
        {fields.map((item, index) => <i key={item.name} className={index <= step ? "is-done" : ""} />)}
      </div>
      {message ? <p className="dp-guide-message">{message}</p> : null}
      {error ? <p className="dp-guide-error">{error}</p> : null}
      <div className="dp-guide-actions">
        {step > 0 ? <button type="button" className="dp-guide-back" onClick={() => setStep((current) => current - 1)}>पीछे</button> : null}
        <button type="submit" className="dp-guide-next" disabled={busy || !values[field.name]?.toString().trim()}>
          {busy ? "कृपया प्रतीक्षा करें..." : isLast ? submitLabel : "आगे बढ़ें"}
        </button>
      </div>
      {isLast ? <p className="dp-guide-blessing">बस यह बटन दबाइए—DigiPandit में आपका स्वागत है।</p> : null}
      {children}
    </form>
  );
}

export function AuthGuideLayout({ eyebrow, title, children, links }) {
  return (
    <main className="dp-guide-page">
      <section className="dp-guide-art" aria-label="DigiPandit आध्यात्मिक मार्गदर्शक">
        <img src="/cinematic/auth-pandit-lotus-transparent.png" alt="स्वर्ण कमल और तितलियों के साथ ध्यानमग्न पंडित जी" />
      </section>
      <section className="dp-guide-flow">
        <div className="dp-guide-heading"><span>{eyebrow}</span><h1>{title}</h1></div>
        {children}
        <nav className="dp-guide-links">{links}</nav>
      </section>
    </main>
  );
}
