import { useState } from "react";
import { AlertCircle, CheckCircle2, Flame, Leaf, ShieldCheck, Sparkles, SunMedium } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { SectionTitle } from "../components/SectionTitle";

const quickInfo = [
  {
    icon: SunMedium,
    title: "Ideal timing",
    text: "Morning is generally considered ideal, although the final muhurat should be confirmed with your pandit based on the ritual requirements.",
  },
  {
    icon: Leaf,
    title: "Dress guidance",
    text: "Wear clean, simple, and comfortable clothing. Lightweight cotton attire is usually preferred, while overly synthetic or loose fabrics are best avoided.",
  },
  {
    icon: ShieldCheck,
    title: "Safety essentials",
    text: "Keep children at a safe distance from the fire, keep water nearby, and ensure the ritual area is properly ventilated.",
  },
];

const samagri = [
  "Hawan kund",
  "Mango ya peepal ki samidha",
  "Ghee",
  "Hawan samagri mix",
  "Kapoor",
  "Roli, chawal, moli",
  "Panchpatra aur spoon",
  "Kalash aur jal",
  "Phool aur pushp mala",
  "Aasan",
  "Nariyal",
  "Supari aur laung",
];

const steps = [
  "Begin by cleaning the space and arranging the chowki, aasan, and hawan kund properly.",
  "Start with kalash sthapana, sankalp, and Ganesh vandana.",
  "Light the sacred fire and offer ghee and hawan samagri gradually.",
  "Offer each aahuti with mantra chanting, focus, and a calm devotional mindset.",
  "After the primary sankalp is completed, perform the purnahuti.",
  "Conclude with aarti, pranam, and distribution of prasad.",
];

const carePoints = [
  "Pregnant women, senior citizens, and anyone with breathing concerns should maintain a safe distance from the smoke.",
  "Proper ventilation is essential, especially in apartments or enclosed rooms.",
  "Do not place the hawan kund near wooden furniture, curtains, or other flammable materials.",
  "Keep clothing, dupattas, and puja items at a safe distance from the fire.",
  "Do not offer excessive aahutis too quickly, as it can create uncontrolled smoke or flames.",
];

const dressGuide = [
  "Men may wear a simple kurta-pajama or dhoti-kurta.",
  "Women may wear a cotton suit, saree, or other modest traditional attire.",
  "Dark colours, especially black, are often avoided during auspicious home rituals.",
  "It is generally preferable to remove footwear before sitting at the puja area.",
];

const hawanOptions = [
  {
    id: "mahamrityunjay",
    title: "Mahamrityunjay Hawan",
    subtitle: "For prayers focused on health, peace, and protection",
    when: "Often chosen during health concerns, recovery periods, mental stress, or difficult family situations.",
    purpose:
      "This Hawan is performed to invoke Shiv kripa, inner strength, and peace. It is commonly chosen for health and protection-oriented sankalps.",
    idealFor: ["Health recovery support", "Family wellbeing", "Spiritual protection sankalp"],
    keyPoints: [
      "Aahutis are offered with the Mahamrityunjay mantra.",
      "The sankalp is usually taken with remembrance of Mahadev or Shivling pujan.",
      "Belpatra, jal, and ghee are commonly used.",
    ],
  },
  {
    id: "lakshmi",
    title: "Lakshmi Hawan",
    subtitle: "For prosperity, auspicious energy, and household wellbeing",
    when: "Commonly performed during Diwali, business openings, the new financial year, or prosperity-focused household rituals.",
    purpose:
      "Lakshmi Hawan is performed for prosperity, household harmony, and positive energy. It is especially popular for auspicious new beginnings.",
    idealFor: ["Diwali pujan", "Shop or office opening", "Prosperity sankalp"],
    keyPoints: [
      "Lakshmi ji and Ganesh ji are often invoked together.",
      "Cleanliness, auspicious attire, and deep prajwalan are given special importance.",
      "The ritual usually concludes with aarti and prasad distribution.",
    ],
  },
  {
    id: "hanuman",
    title: "Hanuman Hawan",
    subtitle: "For courage, protection, and removal of obstacles",
    when: "Often performed on Tuesdays, Saturdays, during challenging periods, or when seeking inner strength.",
    purpose:
      "Hanuman Hawan is performed for sankat nivaran, courage, and spiritual resilience during difficult phases.",
    idealFor: ["Sankat nivaran", "Courage and confidence", "Spiritual strength"],
    keyPoints: [
      "It may be performed with recitation of the Hanuman Chalisa or Bajrang Baan.",
      "Sindoor, boondi or laddoo bhog, and sincere prayer are often included.",
      "This Hawan is known for its strong devotional energy.",
    ],
  },
];

const faqItems = [
  {
    question: "Kya hawan ghar par bina pandit ke kar sakte hain?",
    answer:
      "A simple devotional fire ritual may be done at home, but for detailed vidhi, mantras, or specific sankalps, guidance from a pandit is strongly recommended.",
  },
  {
    question: "Hawan kitni der ka hota hai?",
    answer:
      "A simple Hawan may take 30 to 45 minutes, while a more detailed ritual with sankalp, pujan, and purnahuti can take 60 to 120 minutes or longer.",
  },
  {
    question: "Kya flat ya apartment me Hawan safe hai?",
    answer:
      "Yes, provided there is good ventilation, smoke alarms are considered, and a small controlled hawan kund is used. Safety should always come first.",
  },
  {
    question: "Hawan ke baad bachi hui samagri ka kya karein?",
    answer:
      "Unused clean samagri may be stored separately. Once the ash has cooled, it may be respectfully placed near plants or immersed in a clean sacred space.",
  },
];

const pujanOptions = [
  {
    id: "ganesh",
    title: "Ganesh Pujan",
    subtitle: "For beginning any auspicious undertaking",
    when: "Often performed before a housewarming, new venture, marriage, or any major Hawan or puja.",
    purpose:
      "Ganesh Pujan is performed to remove obstacles and seek a smooth beginning for the occasion.",
    includes: [
      "Ganesh sthapana or murti/photo pujan",
      "Roli, chawal, durva, and modak or bhog",
      "Ganesh mantra recitation and pushpanjali",
    ],
    flow: [
      "Place Ganesh ji respectfully on the aasan.",
      "Offer roli, chawal, flowers, and durva.",
      "Begin the Hawan or main puja after prayer and invocation.",
    ],
  },
  {
    id: "mata",
    title: "Mata Pujan",
    subtitle: "For strength, protection, and household peace",
    when: "Frequently performed during Navratri, grih shanti ceremonies, or prayers for family wellbeing.",
    purpose:
      "Mata Pujan is performed to invoke protection, positivity, and emotional steadiness within the home.",
    includes: [
      "Chunri, flowers, roli, and chawal",
      "Deepak aur bhog",
      "Durga stuti or mata mantras",
    ],
    flow: [
      "Prepare and decorate the space respectfully for Mata pujan.",
      "Offer chunri, flowers, and bhog.",
      "After aarti and stuti, aahutis may be offered in Mata's name during the Hawan.",
    ],
  },
  {
    id: "navgraha",
    title: "Navgraha Pujan",
    subtitle: "For grah shanti and planetary balance",
    when: "Often recommended when a kundli suggests grah dosh, repeated delays, or ongoing stress in important areas of life.",
    purpose:
      "Navgraha Pujan is performed to seek balance, peace, and harmony related to the planetary influences in one’s chart.",
    includes: [
      "Navgraha mantra recitation",
      "Specific samagri or colour-linked offerings",
      "Shanti sankalp aur aahuti",
    ],
    flow: [
      "A sankalp is taken under the guidance of a pandit for the relevant grahas.",
      "Aahutis and shanti path are performed with mantra recitation.",
      "After purnahuti, a prayer and daan sankalp may also be included.",
    ],
  },
  {
    id: "griha",
    title: "Griha Shanti Pujan",
    subtitle: "For a new home, renovation, or disturbed household energy",
    when: "Often chosen before moving into a new home, after renovations, or when the home feels unsettled.",
    purpose:
      "Griha Shanti is performed to invite harmony, stability, and auspicious energy into the home.",
    includes: [
      "Kalash sthapana",
      "Vastu aur griha shanti mantra",
      "Hawan aur purnahuti",
    ],
    flow: [
      "Create a clean puja space in the mandir area or central part of the home.",
      "Begin the Hawan after sankalp and remembrance of griha devtas.",
      "After purnahuti, prasad may be distributed and shanti jal may be sprinkled through the house.",
    ],
  },
  {
    id: "kuldevta",
    title: "Kuldevta Pujan",
    subtitle: "For ancestral blessings and family tradition",
    when: "Often performed before weddings, naamkaran, major family rituals, or other important auspicious occasions.",
    purpose:
      "Kuldevta Pujan honours family lineage, traditions, and blessings passed down through generations.",
    includes: [
      "Kuldevta smaran aur sankalp",
      "Phool, roli, chawal, naivedya",
      "Simple mantra recitation and pranam vidhi",
    ],
    flow: [
      "Begin with remembrance of the kuldevta under the guidance of family elders, where possible.",
      "Offer bhog, flowers, and respectful pranam.",
      "If a Hawan is being performed, aahutis may also be offered in the name of the kuldevta.",
    ],
  },
];

export default function HawanPage() {
  const [activeHawan, setActiveHawan] = useState(hawanOptions[0]);
  const [activePujan, setActivePujan] = useState(pujanOptions[0]);

  return (
    <div>
      <section className="bg-hero-pattern">
        <div className="container-shell py-16 lg:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-brand-maroon shadow-soft">
              <Flame className="h-4 w-4" />
              Hawan Knowledge Guide
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-tight text-brand-ink md:text-6xl">
              A practical guide to when to perform a Hawan, how to prepare, and what to keep in mind.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-ink/72">
              This guide offers a practical introduction to Hawan preparation, samagri checklists, dress guidance,
              safety essentials, and companion rituals such as Ganesh Pujan, Mata Pujan, and Navgraha Pujan.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/pandits?category=PUJA">
                <Button>Find a pandit for Hawan</Button>
              </Link>
              <Link to="/store">
                <Button variant="secondary">Open the puja store</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {quickInfo.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[30px] bg-white p-6 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-brand-ink">{item.title}</h2>
                <p className="mt-3 text-sm leading-8 text-brand-ink/72">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container-shell py-4">
        <SectionTitle
          eyebrow="Basic Guide"
          title="What to prepare before a Hawan"
          description="Even if you are participating for the first time, the points below provide a clear and practical starting point."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[32px] bg-white p-7 shadow-soft">
            <h3 className="text-2xl font-bold text-brand-ink">Essential Hawan samagri</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {samagri.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[22px] bg-brand-sand/30 p-4">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand-maroon" />
                  <p className="text-sm leading-7 text-brand-ink/75">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-7 shadow-soft">
            <h3 className="text-2xl font-bold text-brand-ink">Step-by-step process</h3>
            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-[22px] bg-brand-sand/30 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-maroon text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-brand-ink/75">{step}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="container-shell py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[32px] bg-white p-7 shadow-soft">
            <h3 className="text-2xl font-bold text-brand-ink">What to wear and how to sit</h3>
            <div className="mt-5 space-y-3">
              {dressGuide.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[20px] bg-brand-sand/25 p-4">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-brand-maroon" />
                  <p className="text-sm leading-7 text-brand-ink/74">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-7 shadow-soft">
            <h3 className="text-2xl font-bold text-brand-ink">Important safety guidance</h3>
            <div className="mt-5 space-y-3">
              {carePoints.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[20px] bg-amber-50 p-4">
                  <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-brand-maroon" />
                  <p className="text-sm leading-7 text-brand-ink/74">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="container-shell py-4">
        <SectionTitle
          eyebrow="Popular Hawan"
          title="Which Hawan is suitable for different intentions"
          description="If you are planning a Hawan for a specific sankalp, the options below explain where each one is commonly used."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          {hawanOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveHawan(option)}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                activeHawan.id === option.id
                  ? "bg-brand-maroon text-white"
                  : "bg-white text-brand-ink shadow-soft hover:bg-brand-sand"
              }`}
            >
              {option.title}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[32px] bg-white p-8 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-clay">{activeHawan.subtitle}</p>
            <h3 className="mt-3 text-3xl font-bold text-brand-ink">{activeHawan.title}</h3>
            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-base font-bold text-brand-ink">Kab karna useful rehta hai</h4>
                <h4 className="text-base font-bold text-brand-ink">When it is commonly performed</h4>
                <p className="mt-2 text-sm leading-8 text-brand-ink/74">{activeHawan.when}</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-brand-ink">Purpose</h4>
                <p className="mt-2 text-sm leading-8 text-brand-ink/74">{activeHawan.purpose}</p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/pandits?category=PUJA">
                <Button>Book this hawan now</Button>
              </Link>
              <Link to="/store">
                <Button variant="secondary">View samagri</Button>
              </Link>
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-8 shadow-soft">
            <h4 className="text-xl font-bold text-brand-ink">Best suited for</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeHawan.idealFor.map((item) => (
                <span key={item} className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-maroon">
                  {item}
                </span>
              ))}
            </div>

            <h4 className="mt-8 text-xl font-bold text-brand-ink">Key points</h4>
            <div className="mt-4 space-y-3">
              {activeHawan.keyPoints.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[20px] bg-brand-sand/25 p-4">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand-maroon" />
                  <p className="text-sm leading-7 text-brand-ink/74">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="container-shell pb-20">
        <SectionTitle
          eyebrow="Associated Pujan"
          title="Common pujan options performed alongside a Hawan"
          description="Each option below explains the purpose, ideal timing, and basic flow of the associated ritual."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          {pujanOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActivePujan(option)}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                activePujan.id === option.id
                  ? "bg-brand-maroon text-white"
                  : "bg-white text-brand-ink shadow-soft hover:bg-brand-sand"
              }`}
            >
              {option.title}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[32px] bg-white p-8 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-clay">{activePujan.subtitle}</p>
            <h3 className="mt-3 text-3xl font-bold text-brand-ink">{activePujan.title}</h3>
            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-base font-bold text-brand-ink">Kab karein</h4>
                <p className="mt-2 text-sm leading-8 text-brand-ink/74">{activePujan.when}</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-brand-ink">Purpose</h4>
                <p className="mt-2 text-sm leading-8 text-brand-ink/74">{activePujan.purpose}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-8 shadow-soft">
            <h4 className="text-xl font-bold text-brand-ink">What it typically includes</h4>
            <div className="mt-4 space-y-3">
              {activePujan.includes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[20px] bg-brand-sand/25 p-4">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand-maroon" />
                  <p className="text-sm leading-7 text-brand-ink/74">{item}</p>
                </div>
              ))}
            </div>

            <h4 className="mt-8 text-xl font-bold text-brand-ink">Basic flow</h4>
            <div className="mt-4 space-y-3">
              {activePujan.flow.map((item, index) => (
                <div key={item} className="flex gap-4 rounded-[20px] bg-brand-sand/25 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-maroon text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-brand-ink/74">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/pandits?category=PUJA">
            <Button>Book this pujan</Button>
          </Link>
          <Link to="/store">
            <Button variant="secondary">View puja samagri</Button>
          </Link>
        </div>
      </section>

      <section className="container-shell pb-20">
        <SectionTitle
          eyebrow="FAQ"
          title="Clear answers to common Hawan questions"
          description="This section addresses some of the most common practical questions people have before performing a Hawan."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-[28px] bg-white p-6 shadow-soft">
              <h3 className="text-xl font-bold text-brand-ink">{item.question}</h3>
              <p className="mt-3 text-sm leading-8 text-brand-ink/74">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
