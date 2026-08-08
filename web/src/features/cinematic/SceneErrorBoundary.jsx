import { Component } from "react";
import { Link } from "react-router-dom";

export class SceneErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { if (import.meta.env.DEV) console.error("Cinematic scene error", error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="cinematic-fallback" aria-labelledby="journey-fallback-heading">
        <p className="cinematic-kicker">DigiPandit</p>
        <h1 id="journey-fallback-heading">आपकी आध्यात्मिक यात्रा, विश्वास के साथ।</h1>
        <p>दृश्य अनुभव उपलब्ध नहीं है, लेकिन सभी सेवाएँ सामान्य रूप से उपलब्ध हैं।</p>
        <Link className="cinematic-cta cinematic-cta--gold" to="/pandits">पंडित खोजें</Link>
      </section>
    );
  }
}
