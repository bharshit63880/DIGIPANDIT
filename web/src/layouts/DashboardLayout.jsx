import { LayoutDashboard, MessageCircle, ShoppingBag, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navbar } from "../components/Navbar";

const linkMap = {
  USER: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/bookings", label: "Bookings", icon: ShoppingBag },
    { to: "/dashboard/chat", label: "Chat", icon: MessageCircle },
    { to: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  PANDIT: [
    { to: "/pandit-dashboard", label: "Pandit Hub", icon: LayoutDashboard },
    { to: "/dashboard/chat", label: "Chat", icon: MessageCircle },
  ],
  ADMIN: [{ to: "/admin", label: "Admin Console", icon: LayoutDashboard }],
};

export default function DashboardLayout() {
  const user = useSelector((state) => state.auth.user);
  const links = linkMap[user?.role] || [];

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="container-shell grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[32px] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-clay">Workspace</p>
          <h2 className="mt-3 text-2xl font-bold text-brand-ink">{user?.name}</h2>
          <p className="mt-1 text-sm text-brand-ink/60">{user?.email}</p>

          <nav className="mt-6 space-y-2">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                      isActive ? "bg-brand-maroon text-white" : "text-brand-ink/70 hover:bg-brand-cream"
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

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
