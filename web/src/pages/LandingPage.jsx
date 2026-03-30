import { useEffect, useState } from "react";
import { Calendar, MessageCircleMore, ShieldCheck, ShoppingBasket, Sparkles, PhoneCall, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { SectionTitle } from "../components/SectionTitle";
import { api } from "../lib/api";
import { getExpertImage, getProductFallbackImage, getProductImage } from "../lib/media";
import { allowedStoreCategories, getProductContent, productCategoryLabels } from "../lib/productContent";

const highlights = [
  { icon: Calendar, title: "Book verified pandits", text: "Schedule pujas and rituals with trusted experts available in your city." },
  { icon: MessageCircleMore, title: "Astrology consultations", text: "Start guided astrology consultations with structured chat-based support." },
  { icon: ShoppingBasket, title: "Shop puja essentials", text: "Order curated kits, idols, incense, and other ritual essentials in one place." },
  { icon: ShieldCheck, title: "Built for trust", text: "Admin oversight keeps experts, orders, and customer journeys accountable and reliable." },
];

export default function LandingPage() {
  const [featuredPandits, setFeaturedPandits] = useState([]);
  const [featuredAstrologers, setFeaturedAstrologers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const loadFeaturedData = async () => {
      try {
        const [panditRes, astrologerRes, productRes] = await Promise.all([
          api.get("/pandits", { params: { category: "PUJA", limit: 3 } }),
          api.get("/pandits", { params: { category: "ASTROLOGY_CHAT", limit: 3 } }),
          api.get("/products", { params: { limit: 4 } }),
        ]);

        setFeaturedPandits(panditRes.data.data);
        setFeaturedAstrologers(astrologerRes.data.data);
        setFeaturedProducts(productRes.data.data.filter((product) => allowedStoreCategories.includes(product.category)).slice(0, 4));
      } catch (error) {
        setFeaturedPandits([]);
        setFeaturedAstrologers([]);
        setFeaturedProducts([]);
      }
    };

    loadFeaturedData();
  }, []);

  return (
    <div>
      <section className="bg-hero-pattern">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-brand-maroon shadow-soft">
              Spiritual services, astrology, and commerce on one modern platform
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-bold leading-tight text-brand-ink md:text-6xl">
                Sacred bookings with a polished digital experience.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-brand-ink/70">
                DigiPandit helps users discover pandits, book astrology consultations, purchase puja essentials,
                and manage their complete spiritual journey across web and mobile.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/pandits">
                <Button>Find a Pandit</Button>
              </Link>
              <Link to="/pandits?category=ASTROLOGY_CHAT">
                <Button variant="secondary">Book Astrology</Button>
              </Link>
              <Link to="/hawan-guide">
                <Button variant="secondary">Open Hawan Guide</Button>
              </Link>
              <Link to="/store">
                <Button variant="ghost">Explore Store</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[32px] bg-white/85 p-6 shadow-soft backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-brand-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brand-ink/70">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="mb-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[34px] bg-brand-maroon p-8 text-white shadow-soft">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em]">
              <Sparkles className="h-4 w-4" />
              Astrology
            </div>
            <h2 className="mt-5 text-4xl font-bold">Astrology consultations now have clear visibility on the home page.</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">
              Astrology services now have a dedicated entry point so users can browse experts directly,
              book online sessions, and continue conversations from their dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/pandits?category=ASTROLOGY_CHAT">
                <Button variant="secondary">Start Astrology Chat</Button>
              </Link>
              <Link to="/pandits?category=ASTROLOGY_CALL">
                <Button className="bg-brand-gold text-brand-ink hover:bg-white">Book Astrology Call</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[30px] bg-white p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-forest text-white">
                <MessageCircleMore className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-brand-ink">Instant chat guidance</h3>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                Browse astrologers, start chat-based consultations, and continue conversations from the dashboard.
              </p>
            </div>
            <div className="rounded-[30px] bg-white p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-clay text-white">
                <PhoneCall className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-brand-ink">Call consultation slots</h3>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                Users can discover online consultation services separately from puja bookings and schedule them by time.
              </p>
            </div>
          </div>
        </div>

        <SectionTitle
          eyebrow="Platform modules"
          title="Everything DigiPandit needs to operate like a complete digital platform"
          description="User journeys, expert workflows, store operations, and admin oversight all run on the same unified backend."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            "User dashboard for bookings, chat, orders, and profile management",
            "Pandit dashboard for services, schedule visibility, and earnings tracking",
            "Admin workspace for approvals, analytics, orders, and operational control",
          ].map((copy) => (
            <div key={copy} className="rounded-[28px] bg-white p-6 shadow-soft">
              <p className="text-base leading-7 text-brand-ink/70">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell py-6">
        <SectionTitle
          eyebrow="Featured Pandits"
          title="Featured pandits appear directly on the home page"
          description="These profiles are pulled from seeded backend data so the experience feels realistic during testing."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredPandits.map((pandit) => (
            <article key={pandit._id} className="overflow-hidden rounded-[30px] bg-white shadow-soft">
              <img
                src={getExpertImage(pandit)}
                alt={pandit.user?.name}
                className="h-52 w-full object-cover object-[center_18%]"
              />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-brand-ink">{pandit.user?.name}</h3>
                    <p className="mt-1 text-sm text-brand-ink/65">{pandit.serviceCities?.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-brand-cream px-3 py-1 text-sm font-semibold text-brand-ink">
                    <Star className="h-4 w-4 text-brand-gold" />
                    {pandit.ratingAverage?.toFixed(1)}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-brand-ink/70">{pandit.bio}</p>
                <Link to={`/pandits/${pandit._id}`} className="mt-6 inline-flex">
                  <Button>View profile</Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionTitle
          eyebrow="Featured Astrologers"
          title="Featured astrologers are showcased with photos and live seeded profiles"
          description="Chat and call consultation experts are highlighted on the home page so astrology feels like a first-class feature."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredAstrologers.map((pandit) => (
            <article key={pandit._id} className="overflow-hidden rounded-[30px] bg-white shadow-soft">
              <img
                src={getExpertImage(pandit)}
                alt={pandit.user?.name}
                className="h-52 w-full object-cover object-[center_18%]"
              />
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-clay">Astrology</p>
                <h3 className="mt-3 text-2xl font-bold text-brand-ink">{pandit.user?.name}</h3>
                <p className="mt-2 text-sm text-brand-ink/65">{pandit.languages?.join(", ")}</p>
                <p className="mt-4 text-sm leading-7 text-brand-ink/70">{pandit.bio}</p>
                <Link to={`/pandits/${pandit._id}`} className="mt-6 inline-flex">
                  <Button variant="secondary">Book consultation</Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell pb-20">
        <SectionTitle
          eyebrow="Store Picks"
          title="Curated puja essentials are also featured on the home page"
          description="The products below are loaded from seeded database records, not static placeholders."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <article key={product._id} className="overflow-hidden rounded-[30px] bg-white shadow-soft">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="h-52 w-full object-cover"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = getProductFallbackImage(product);
                }}
              />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-clay">
                  {productCategoryLabels[product.category] || product.category.replaceAll("_", " ")}
                </p>
                <h3 className="mt-3 text-xl font-bold text-brand-ink">{product.name}</h3>
                <p className="mt-2 text-sm leading-7 text-brand-ink/70">{getProductContent(product).shortDescription}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-brand-maroon">Rs. {product.price}</p>
                  <Link to={`/store/${product.slug}`} className="text-sm font-semibold text-brand-maroon">
                    Open description
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
