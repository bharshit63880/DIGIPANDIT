import { Menu, ShoppingBag } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { Button } from "./Button";

const navItems = [
  { to: "/pandits", label: "Browse Pandits" },
  { to: "/pandits?category=ASTROLOGY_CHAT", label: "Astrology" },
  { to: "/hawan-guide", label: "Hawan Guide" },
  { to: "/aarti-chalisa", label: "Aarti" },
  { to: "/store", label: "Puja Store" },
];

export function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const currentCategory = new URLSearchParams(location.search).get("category");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const isNavItemActive = (to) => {
    if (to === "/pandits") {
      return location.pathname === "/pandits" && currentCategory !== "ASTROLOGY_CHAT";
    }

    if (to === "/pandits?category=ASTROLOGY_CHAT") {
      return location.pathname === "/pandits" && currentCategory === "ASTROLOGY_CHAT";
    }

    const [pathname, search = ""] = to.split("?");
    return location.pathname === pathname && location.search === (search ? `?${search}` : "");
  };

  return (
    <header className="sticky top-4 z-30">
      <div className="container-shell">
        <div className="grid min-h-[84px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[28px] border border-white/70 bg-brand-cream/88 px-4 py-3 shadow-[0_18px_45px_rgba(95,33,32,0.14)] backdrop-blur-xl sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/digipandit-mark.svg"
              alt="DigiPandit logo"
              className="h-12 w-12 shrink-0 rounded-2xl object-contain shadow-[0_10px_24px_rgba(4,93,131,0.24)]"
            />
            <div className="min-w-0 leading-none">
              <p className="text-lg font-bold text-brand-ink">DigiPandit</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-clay">Modern spiritual services</p>
            </div>
          </Link>

          <nav className="hidden items-center justify-center md:flex">
            <div className="flex items-center gap-1 rounded-full border border-white/80 bg-white/72 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_30px_rgba(32,33,38,0.08)]">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() =>
                    `inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold leading-none transition-all duration-200 ${
                      isNavItemActive(item.to)
                        ? "bg-brand-maroon text-white shadow-[0_10px_24px_rgba(95,33,32,0.22)]"
                        : "text-brand-ink/75 hover:bg-white hover:text-brand-ink"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="flex items-center justify-self-end gap-3">
            <Link
              to="/cart"
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/78 shadow-[0_12px_24px_rgba(32,33,38,0.1)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-5 w-5 text-brand-ink" />
              {cartCount ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-brand-maroon px-2 py-0.5 text-xs font-bold leading-none text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {user ? (
              <>
                <Link to={user.role === "ADMIN" ? "/admin" : user.role === "PANDIT" ? "/pandit-dashboard" : "/dashboard"}>
                  <Button variant="secondary" className="whitespace-nowrap">
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} className="hidden whitespace-nowrap sm:inline-flex">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="secondary" className="whitespace-nowrap">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="whitespace-nowrap">Create Account</Button>
                </Link>
              </>
            )}

            <button
              type="button"
              aria-label="Open navigation menu"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/78 shadow-[0_12px_24px_rgba(32,33,38,0.1)] md:hidden"
            >
              <Menu className="h-5 w-5 text-brand-ink" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
