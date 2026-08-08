import { Menu, ShoppingBag, X } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { logout } from "../features/auth/authSlice";
import { Button } from "./Button";
import "../features/cinematic/cinematic.css";

const navItems = [
  { to: "/", label: "होम" }, { to: "/astrology", label: "ज्योतिष" },
  { to: "/pandits", label: "पंडित बुकिंग" }, { to: "/hawan-guide", label: "हवन गाइड" },
  { to: "/store", label: "पूजा स्टोर" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const isCinematicHome = location.pathname === "/";
  const visibleItems = navItems;

  const handleLogout = () => { setIsMenuOpen(false); dispatch(logout()); navigate("/"); };
  const isPathActive = (to) => to === "/" ? location.pathname === "/" : location.pathname === to || location.pathname.startsWith(`${to}/`);
  const isItemActive = (item) => isPathActive(item.to);

  useEffect(() => setIsMenuOpen(false), [location.pathname, location.hash]);
  useEffect(() => {
    if (!isCinematicHome) return undefined;
    let frame = 0;
    const update = () => { frame = 0; setIsScrolled(window.scrollY > 72); };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, [isCinematicHome]);
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") { setIsMenuOpen(false); queueMicrotask(() => menuButtonRef.current?.focus()); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const navText = "text-white";
  return (
    <header className={`cinematic-navbar dp-navbar inset-x-0 top-0 z-50 text-white ${isCinematicHome ? `fixed ${isScrolled ? "is-scrolled" : ""}` : "sticky"}`}>
      <div className="container-shell">
        <div className="grid min-h-[76px] grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link to="/" className="dp-brand flex min-w-0 items-center gap-3" aria-label="डिजीपंडित होम">
            <img src="/digipandit-mark.svg" alt="" width="48" height="48" className="dp-brand__mark h-12 w-12 shrink-0" />
            <div className="min-w-0 leading-none"><p data-no-translate className={`font-serif text-xl font-semibold ${navText}`}>Digi<span className="text-brand-gold">Pandit</span></p><p className="mt-1 text-[.58rem] font-bold tracking-[.15em] text-white/55">परंपरा, सरल रूप में</p></div>
          </Link>
          <nav className="hidden items-center justify-center lg:flex" aria-label="मुख्य नेविगेशन"><div className="dp-nav-rail flex items-center gap-1">
            {visibleItems.map((item) => <NavLink key={item.to} to={item.to} className={`dp-nav-link ${isItemActive(item) ? "is-active" : ""}`}>{item.label}</NavLink>)}
          </div></nav>
          <div className="flex items-center justify-self-end gap-3">
            <Link to="/cart" aria-label="कार्ट खोलें" className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10"><ShoppingBag className={`h-5 w-5 ${navText}`} />{cartCount ? <span className="absolute -right-1 -top-1 rounded-md bg-brand-gold px-1.5 py-.5 text-xs font-bold text-brand-ink">{cartCount}</span> : null}</Link>
            {user ? <><Link to={user.role === "ADMIN" ? "/admin" : user.role === "PANDIT" ? "/pandit-dashboard" : "/dashboard"}><Button variant="secondary" className="whitespace-nowrap">{user.role === "USER" ? "प्रोफ़ाइल" : "डैशबोर्ड"}</Button></Link><Button onClick={handleLogout} className="hidden whitespace-nowrap sm:inline-flex">लॉग आउट</Button></> : <><Link to="/login" className="hidden sm:block"><Button variant="secondary">लॉग इन</Button></Link><Link to="/register"><Button>खाता बनाएं</Button></Link></>}
            <button ref={menuButtonRef} type="button" aria-label={isMenuOpen ? "नेविगेशन मेनू बंद करें" : "नेविगेशन मेनू खोलें"} aria-expanded={isMenuOpen} aria-controls="mobile-navigation" onClick={() => setIsMenuOpen((value) => !value)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 lg:hidden">{isMenuOpen ? <X className={`h-5 w-5 ${navText}`} /> : <Menu className={`h-5 w-5 ${navText}`} />}</button>
          </div>
        </div>
        {isMenuOpen ? <nav id="mobile-navigation" className="border-t border-white/10 py-4 lg:hidden" aria-label="मोबाइल नेविगेशन"><div className="grid gap-1">{visibleItems.map((item) => <NavLink key={item.to} to={item.to} className={`rounded-xl px-4 py-3 text-sm font-bold ${isItemActive(item) ? "bg-white/10 text-brand-gold" : "text-white/70 hover:bg-white/10"}`}>{item.label}</NavLink>)}{user ? <button type="button" onClick={handleLogout} className="mt-2 rounded-xl px-4 py-3 text-left text-sm font-bold text-brand-gold">लॉग आउट</button> : <Link to="/login" className="mt-2 rounded-xl px-4 py-3 text-sm font-bold text-brand-gold">लॉग इन</Link>}</div></nav> : null}
      </div>
    </header>
  );
}
