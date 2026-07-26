import { Menu, ShoppingBag, X } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { logout } from "../features/auth/authSlice";
import { Button } from "./Button";

const navItems = [
  { to: "/", label: "होम" },
  { to: "/astrology", label: "ज्योतिष" },
  { to: "/pandits", label: "पंडित बुकिंग" },
  { to: "/hawan-guide", label: "हवन गाइड" },
  { to: "/store", label: "पूजा स्टोर" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  const handleLogout = () => {
    setIsMenuOpen(false);
    dispatch(logout());
    navigate("/");
  };

  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  const isNavItemActive = (to) => {
    if (to === "/") {
      return location.pathname === "/";
    }

    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-brand-sand/70 bg-brand-cream/90 backdrop-blur-xl">
      <div className="container-shell">
        <div className="grid min-h-[76px] grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="डिजीपंडित होम">
            <img src="/digipandit-mark.svg" alt="" className="h-11 w-11 shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)]" />
            <div className="min-w-0 leading-none">
              <p className="font-serif text-xl font-semibold text-brand-ink">Digi<span className="text-brand-clay">Pandit</span></p>
              <p className="mt-1 text-[0.58rem] font-bold tracking-[0.15em] text-brand-forest">परंपरा, सरल रूप में</p>
            </div>
          </Link>

          <nav className="hidden items-center justify-center lg:flex" aria-label="मुख्य नेविगेशन">
            <div className="flex items-center gap-5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() =>
                    `inline-flex items-center justify-center border-b-2 py-2 text-sm font-bold leading-none transition-all duration-200 ${
                      isNavItemActive(item.to)
                        ? "border-brand-forest text-brand-ink"
                        : "border-transparent text-brand-ink/60 hover:border-brand-sand hover:text-brand-ink"
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
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-sand bg-white transition hover:border-brand-clay"
            >
              <ShoppingBag className="h-5 w-5 text-brand-ink" />
              {cartCount ? (
                <span className="absolute -right-1 -top-1 rounded-md bg-brand-maroon px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {user ? (
              <>
                <Link to={user.role === "ADMIN" ? "/admin" : user.role === "PANDIT" ? "/pandit-dashboard" : "/dashboard"}>
                  <Button variant="secondary" className="whitespace-nowrap">
                    {user.role === "USER" ? "प्रोफ़ाइल" : "डैशबोर्ड"}
                  </Button>
                </Link>
                <Button onClick={handleLogout} className="hidden whitespace-nowrap sm:inline-flex">
                  लॉग आउट
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="secondary" className="whitespace-nowrap">
                    लॉग इन
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="whitespace-nowrap">खाता बनाएँ</Button>
                </Link>
              </>
            )}

            <button
              type="button"
              aria-label={isMenuOpen ? "नेविगेशन मेनू बंद करें" : "नेविगेशन मेनू खोलें"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-sand bg-white lg:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5 text-brand-ink" /> : <Menu className="h-5 w-5 text-brand-ink" />}
            </button>
          </div>
        </div>
        {isMenuOpen ? (
          <nav id="mobile-navigation" className="border-t border-brand-sand py-4 lg:hidden" aria-label="मोबाइल नेविगेशन">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={() => `rounded-xl px-4 py-3 text-sm font-bold ${isNavItemActive(item.to) ? "bg-brand-blush text-brand-maroon" : "text-brand-ink/70 hover:bg-white"}`}>
                  {item.label}
                </NavLink>
              ))}
              {user ? <button type="button" onClick={handleLogout} className="mt-2 rounded-xl px-4 py-3 text-left text-sm font-bold text-brand-maroon hover:bg-brand-blush">लॉग आउट</button> : <Link to="/login" className="mt-2 rounded-xl px-4 py-3 text-sm font-bold text-brand-maroon hover:bg-brand-blush">लॉग इन</Link>}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
