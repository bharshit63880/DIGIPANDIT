import { LayoutDashboard, MessageCircle, ShoppingBag, UserRound, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navbar } from "../components/Navbar";

const linkMap = {
  USER: [
    { to: "/dashboard", label: "डैशबोर्ड", icon: LayoutDashboard },
    { to: "/dashboard/bookings", label: "बुकिंग", icon: ShoppingBag },
    { to: "/dashboard/chat", label: "चैट", icon: MessageCircle },
    { to: "/dashboard/profile", label: "प्रोफ़ाइल", icon: UserRound },
  ],
  PANDIT: [
    { to: "/pandit-dashboard", label: "पंडित केंद्र", icon: LayoutDashboard },
    { to: "/dashboard/chat", label: "चैट", icon: MessageCircle },
  ],
  ADMIN: [{ to: "/admin", label: "एडमिन पैनल", icon: LayoutDashboard }],
};

export default function DashboardLayout() {
  const user = useSelector((state) => state.auth.user);
  const links = linkMap[user?.role] || [];
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "उ";

  return (
    <div className="min-h-screen bg-brand-mist">
      <Navbar />
      <div className="container-shell grid gap-6 py-7 lg:grid-cols-[210px_minmax(0,1fr)] lg:py-10">
        <aside className="self-start rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-soft backdrop-blur lg:sticky lg:top-24">
          <div className="rounded-[20px] bg-gradient-to-br from-brand-ink to-brand-maroon p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-gold text-lg font-bold text-brand-ink">{initial}</div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-brand-gold"><Sparkles className="h-3.5 w-3.5" /> आपका स्थान</p>
                <h2 className="mt-1 truncate font-serif text-xl font-semibold">{user?.name || "साधक"}</h2>
              </div>
            </div>
            <p className="mt-3 truncate border-t border-white/10 pt-3 text-xs text-white/70">{user?.email}</p>
          </div>

          <nav className="mt-3 flex gap-1 overflow-x-auto lg:grid lg:gap-1" aria-label="डैशबोर्ड नेविगेशन">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                      isActive ? "bg-brand-blush text-brand-maroon" : "text-brand-ink/65 hover:bg-brand-cream hover:text-brand-ink"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}
