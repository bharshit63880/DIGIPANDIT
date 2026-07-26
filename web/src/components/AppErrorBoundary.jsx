import { Component } from "react";

export class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("DigiPandit interface error", error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-brand-cream px-5 text-brand-ink">
        <section className="surface-card max-w-lg p-8 text-center">
          <p className="eyebrow">DigiPandit</p>
          <h1 className="mt-3 text-4xl">This page needs a quick refresh.</h1>
          <p className="mt-4 leading-7 text-brand-ink/65">
            Your entered information has not been submitted again. Refresh the interface and continue.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-7 rounded-2xl bg-black px-6 py-3 font-bold text-white shadow-lift hover:-translate-y-0.5"
          >
            Refresh page
          </button>
        </section>
      </main>
    );
  }
}
