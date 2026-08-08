import { Menu, ShoppingBag, X } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { logout } from "../features/auth/authSlice";
import { Button } from "./Button";

const navItems = [
  { to: "/", label: "होम" }, { to: "/astrology", label: "ज्योतिष" },
  { to: "/pandits", label: "पंडित बुकिंग" }, { to: "/hawan-guide", label: "हवन गाइड" },
  { to: "/store", label: "पूजा स्टोर" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeJourneySection, setActiveJourneySection] = useState("home");
  const menuButtonRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const isCinematicHome = location.pathname === "/";
  const visibleItems = isCinematicHome ? [
    { to: "/#home", label: "आरंभ", section: "home" },
    { to: "/#pandit-discovery", label: "पंडित खोज", section: "pandit-discovery" },
    { to: "/#astrology", label: "ज्योतिष", section: "astrology" },
    { to: "/#hawan-guide", label: "हवन", section: "hawan-guide" },
    { to: "/#puja-store", label: "पूजा स्टोर", section: "puja-store" },
  ] : navItems;

  const handleLogout = () => { setIsMenuOpen(false); dispatch(logout()); navigate("/"); };
  const isPathActive = (to) => to === "/" ? location.pathname === "/" : location.pathname === to || location.pathname.startsWith(`${to}/`);
  const isItemActive = (item) => item.section ? activeJourneySection === item.section : isPathActive(item.to);
  const handleJourneyNavigation = (item) => {
    if (!item.section) return;
    queueMicrotask(() => document.getElementById(item.section)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

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
    if (!isCinematicHome) return undefined;
    const nodes = ["home", "pandit-discovery", "astrology", "hawan-guide", "puja-store"].map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveJourneySection(visible.target.id);
    }, { rootMargin: "-20% 0px -55%", threshold: [0, .2, .5] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isCinematicHome]);
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") { setIsMenuOpen(false); queueMicrotask(() => menuButtonRef.current?.focus()); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const navText = isCinematicHome ? "text-white" : "text-brand-ink";
  return (
    <header className={isCinematicHome ? `cinematic-navbar dp-navbar fixed inset-x-0 top-0 z-50 text-white ${isScrolled ? "is-scrolled" : ""}` : "dp-navbar dp-navbar--light sticky top-0 z-30"}>
      <div className="container-shell">
        <div className="grid min-h-[76px] grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link to="/" className="dp-brand flex min-w-0 items-center gap-3" aria-label="डिजीपंडित होम">
            <img src="/digipandit-mark.svg" alt="" width="48" height="48" className="dp-brand__mark h-12 w-12 shrink-0" />
            <div className="min-w-0 leading-none"><p className={`font-serif text-xl font-semibold ${navText}`}>Digi<span className={isCinematicHome ? "text-brand-gold" : "text-brand-clay"}>Pandit</span></p><p className={`mt-1 text-[.58rem] font-bold tracking-[.15em] ${isCinematicHome ? "text-white/55" : "text-brand-forest"}`}>परंपरा, सरल रूप में</p></div>
          </Link>
          <nav className="hidden items-center justify-center lg:flex" aria-label="मुख्य नेविगेशन"><div className="dp-nav-rail flex items-center gap-1">
            {visibleItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => handleJourneyNavigation(item)} className={`dp-nav-link ${isItemActive(item) ? "is-active" : ""}`}>{item.label}</NavLink>)}
          </div></nav>
          <div className="flex items-center justify-self-end gap-3">
            <Link to="/cart" aria-label="कार्ट खोलें" className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl border ${isCinematicHome ? "border-white/15 bg-white/10" : "border-brand-sand bg-white"}`}><ShoppingBag className={`h-5 w-5 ${navText}`} />{cartCount ? <span className="absolute -right-1 -top-1 rounded-md bg-brand-maroon px-1.5 py-.5 text-xs font-bold text-white">{cartCount}</span> : null}</Link>
            {user ? <><Link to={user.role === "ADMIN" ? "/admin" : user.role === "PANDIT" ? "/pandit-dashboard" : "/dashboard"}><Button variant="secondary" className="whitespace-nowrap">{user.role === "USER" ? "प्रोफ़ाइल" : "डैशबोर्ड"}</Button></Link><Button onClick={handleLogout} className="hidden whitespace-nowrap sm:inline-flex">लॉग आउट</Button></> : <><Link to="/login" className="hidden sm:block"><Button variant="secondary">लॉग इन</Button></Link><Link to="/register"><Button>खाता बनाएं</Button></Link></>}
            <button ref={menuButtonRef} type="button" aria-label={isMenuOpen ? "नेविगेशन मेनू बंद करें" : "नेविगेशन मेनू खोलें"} aria-expanded={isMenuOpen} aria-controls="mobile-navigation" onClick={() => setIsMenuOpen((value) => !value)} className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border lg:hidden ${isCinematicHome ? "border-white/15 bg-white/10" : "border-brand-sand bg-white"}`}>{isMenuOpen ? <X className={`h-5 w-5 ${navText}`} /> : <Menu className={`h-5 w-5 ${navText}`} />}</button>
          </div>
        </div>
        {isMenuOpen ? <nav id="mobile-navigation" className={`border-t py-4 lg:hidden ${isCinematicHome ? "border-white/10" : "border-brand-sand"}`} aria-label="मोबाइल नेविगेशन"><div className="grid gap-1">{visibleItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => handleJourneyNavigation(item)} className={`rounded-xl px-4 py-3 text-sm font-bold ${isItemActive(item) ? isCinematicHome ? "bg-white/10 text-brand-gold" : "bg-brand-blush text-brand-maroon" : isCinematicHome ? "text-white/70 hover:bg-white/10" : "text-brand-ink/70 hover:bg-white"}`}>{item.label}</NavLink>)}{user ? <button type="button" onClick={handleLogout} className="mt-2 rounded-xl px-4 py-3 text-left text-sm font-bold">लॉग आउट</button> : <Link to="/login" className="mt-2 rounded-xl px-4 py-3 text-sm font-bold">लॉग इन</Link>}</div></nav> : null}
      </div>
    </header>
  );
}
