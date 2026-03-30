import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <Outlet />
      <footer className="border-t border-brand-sand/60 py-8">
        <div className="container-shell flex flex-col gap-3 text-sm text-brand-ink/65 md:flex-row md:items-center md:justify-between">
          <p>Book pandits, access astrology guidance, and order puja essentials from one platform.</p>
          <p>Designed for a polished experience across web and mobile devices.</p>
        </div>
      </footer>
    </div>
  );
}
