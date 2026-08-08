import { Link, Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export default function AppShell() {
  const { pathname } = useLocation();
  const isCinematicHome = pathname === "/";
  const isImmersivePage = ["/login", "/register", "/astrology", "/hawan-guide", "/store", "/cart", "/pandits"].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  return (
    <div className={`min-h-screen ${isCinematicHome ? "bg-[#130b25]" : "bg-brand-cream"} ${isImmersivePage ? "dp-shell--immersive" : ""}`}>
      <Navbar />
      <Outlet />
      <footer className={`${isCinematicHome ? "mt-0 border-white/10 bg-[#0d0818]" : "mt-16 border-brand-sand bg-brand-maroon"} border-t py-12 text-white`}>
        <div className="container-shell grid gap-10 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/digipandit-mark.svg" alt="" className="h-10 w-10" />
              <p className="font-serif text-2xl">Digi<span className="text-brand-gold">Pandit</span></p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">
              मार्गदर्शन, अनुष्ठान और पूजा सामग्री—आपकी आध्यात्मिक यात्रा के लिए एक सरल डिजिटल स्थान।
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">खोजें</p>
            <div className="mt-4 grid gap-3 text-sm text-white/80">
              <Link to="/astrology">ज्योतिष</Link>
              <Link to="/pandits">पूजा व अनुष्ठान</Link>
              <Link to="/store">पूजा स्टोर</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">विश्वास के साथ</p>
            <p className="mt-4 text-sm leading-7 text-white/75">
              सत्यापित विशेषज्ञ, पारदर्शी भुगतान और जरूरत पड़ने पर सहायता।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
