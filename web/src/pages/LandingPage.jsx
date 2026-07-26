import { useEffect, useState } from "react";
import { Calendar, MessageCircleMore, ShieldCheck, ShoppingBasket, Sparkles, PhoneCall, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { SectionTitle } from "../components/SectionTitle";
import { api } from "../lib/api";
import { getExpertImage, getProductFallbackImage, getProductImage } from "../lib/media";
import { allowedStoreCategories, getProductContent, productCategoryLabels } from "../lib/productContent";

const highlights = [
  { icon: Calendar, title: "सत्यापित पंडित बुक करें", text: "हवन, पूजा और कथा सेवाएँ भरोसेमंद विशेषज्ञों के साथ बुक करें।" },
  { icon: MessageCircleMore, title: "ज्योतिष परामर्श", text: "चैट, ऑडियो या वीडियो परामर्श शुरू करें और मिनट के हिसाब से भुगतान करें।" },
  { icon: ShoppingBasket, title: "पूजा सामग्री खरीदें", text: "चुने हुए किट, मूर्तियाँ, धूप और आवश्यक पूजा सामग्री एक ही स्थान पर पाएँ।" },
  { icon: ShieldCheck, title: "भरोसे के लिए बना", text: "विशेषज्ञों, ऑर्डर और आपकी यात्रा पर विश्वसनीय निगरानी।" },
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
          api.get("/astrologers", { params: { mode: "CHAT", onlineOnly: "true" } }),
          api.get("/products", { params: { limit: 4 } }),
        ]);

        setFeaturedPandits(panditRes.data.data);
        setFeaturedAstrologers((astrologerRes.data.data || []).slice(0, 3));
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
      <section className="relative overflow-hidden bg-brand-maroon text-white">
        <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_80%_20%,rgba(255,255,255,.13),transparent_23%),radial-gradient(circle_at_13%_87%,rgba(255,255,255,.07),transparent_25%)]" />
        <div className="container-shell relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              परंपराओं को अपने करीब रखने का सरल तरीका
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] md:text-7xl">
                अपनी आस्था के लिए समय निकालें।
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/70">
                डिजीपंडित आपके लिए विश्वसनीय मार्गदर्शन, पवित्र अनुष्ठान और पूजा की आवश्यक सामग्री एक जगह लाता है।
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/astrology">
                <Button className="bg-brand-gold text-brand-ink hover:bg-white">अपना मार्गदर्शक खोजें</Button>
              </Link>
              <Link to="/pandits">
                <Button variant="secondary">पंडित बुकिंग</Button>
              </Link>
              <p className="basis-full text-sm text-white/55">Verified experts · Transparent booking · Designed with care</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/[0.07] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-sm first:md:col-span-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-brand-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">{item.text}</p>
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
              ज्योतिष
            </div>
            <h2 className="mt-5 text-4xl font-bold">ज्योतिष परामर्श अब आपकी आध्यात्मिक यात्रा का सहज हिस्सा है।</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">
              कुंडली बनाएँ, भविष्यवाणियाँ समझें, वॉलेट जोड़ें और ज्योतिषियों से मिनट के हिसाब से लाइव परामर्श लें।
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/astrology">
                <Button variant="secondary">ज्योतिष पेज खोलें</Button>
              </Link>
              <Link to="/astrology">
                <Button className="bg-brand-gold text-brand-ink hover:bg-white">कुंडली बनाएँ</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[30px] bg-white p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-forest text-white">
                <MessageCircleMore className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-brand-ink">तुरंत चैट मार्गदर्शन</h3>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                ज्योतिषी चुनें, चैट शुरू करें और डैशबोर्ड से बातचीत जारी रखें।
              </p>
            </div>
            <div className="rounded-[30px] bg-white p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-clay text-white">
                <PhoneCall className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-brand-ink">कॉल परामर्श स्लॉट</h3>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                ऑडियो और वीडियो परामर्श प्रति मिनट के हिसाब से हैं और पंडित बुकिंग से अलग हैं।
              </p>
            </div>
          </div>
        </div>

        <SectionTitle
          eyebrow="हमारी सेवाएँ"
          title="हर आध्यात्मिक आवश्यकता के लिए एक सरल जगह"
          description="छोटे परामर्श से लेकर महत्वपूर्ण अनुष्ठान तक, सही अगला कदम चुनें।"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            "बुकिंग, चैट, ऑर्डर और प्रोफ़ाइल के लिए आपका डैशबोर्ड",
            "सेवाओं, समय-सारणी और आय के लिए पंडित डैशबोर्ड",
            "अनुमोदन, रिपोर्ट और संचालन के लिए एडमिन कार्यक्षेत्र",
          ].map((copy) => (
            <div key={copy} className="rounded-[28px] bg-white p-6 shadow-soft">
              <p className="text-base leading-7 text-brand-ink/70">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell py-6">
        <SectionTitle
          eyebrow="चुनिंदा पंडित"
          title="हर शुभ अवसर के लिए विश्वसनीय मार्गदर्शक"
          description="सेवा, स्थान और उपलब्धता के आधार पर सत्यापित पंडित चुनें।"
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
                  <Button>प्रोफ़ाइल देखें</Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionTitle
          eyebrow="चुनिंदा ज्योतिषी"
          title="अपने प्रश्नों के लिए विश्वसनीय सलाह लें"
          description="आज के अपने प्रश्न के लिए सही ज्योतिषी खोजें।"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredAstrologers.map((pandit) => (
            <article key={pandit._id} className="overflow-hidden rounded-[30px] bg-white shadow-soft">
              <img
                src={getExpertImage({
                  user: {
                    name: pandit.name,
                    avatar: pandit.avatar && typeof pandit.avatar === "object" ? pandit.avatar : { url: pandit.avatar || "" },
                  },
                })}
                alt={pandit.name}
                className="h-52 w-full object-cover object-[center_18%]"
              />
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-clay">ज्योतिष</p>
                <h3 className="mt-3 text-2xl font-bold text-brand-ink">{pandit.name}</h3>
                <p className="mt-2 text-sm text-brand-ink/65">{pandit.languages?.join(", ")}</p>
                <p className="mt-4 text-sm leading-7 text-brand-ink/70">{pandit.bio}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-maroon">
                    ₹{pandit.minPricePerMinute || 0}/मिनट से
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pandit.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-brand-sand text-brand-ink"}`}>
                    {pandit.isOnline ? "ऑनलाइन" : "ऑफ़लाइन"}
                  </span>
                </div>
                <Link to="/astrology" className="mt-6 inline-flex">
                  <Button variant="secondary">ज्योतिष खोलें</Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell pb-20">
        <SectionTitle
          eyebrow="पूजा स्टोर"
          title="पूजा की आवश्यक सामग्री, सोच-समझकर चुनी हुई"
          description="अपने घर तक उपयोगी और चुनी हुई पूजा सामग्री पहुँचाएँ।"
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
                  <p className="text-sm font-bold text-brand-maroon">₹{product.price}</p>
                  <Link to={`/store/${product.slug}`} className="text-sm font-semibold text-brand-maroon">
                    विवरण देखें
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
