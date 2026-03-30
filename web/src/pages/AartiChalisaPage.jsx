import { useMemo, useState } from "react";
import { BookOpenText, Music4, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { SectionTitle } from "../components/SectionTitle";

const library = {
  aarti: [
    {
      id: "ganesh-aarti",
      title: "Ganesh Ji Ki Aarti",
      deity: "Ganesh Ji",
      timing: "Traditionally recited before auspicious work and during morning puja.",
      text: `Jai Ganesh, Jai Ganesh, Jai Ganesh Deva
Mata Jaki Parvati, Pita Mahadeva

Ek Dant Dayavant, Char Bhuja Dhari
Mathe Par Tilak Sohe, Muse Ki Sawari

Andhan Ko Aankh Det, Kodhin Ko Kaya
Banjhan Ko Putra Det, Nirdhan Ko Maya

Haar Chadhe, Phool Chadhe, Aur Chadhe Mewa
Ladduan Ka Bhog Lage, Sant Kare Seva`,
    },
    {
      id: "hanuman-aarti",
      title: "Hanuman Ji Ki Aarti",
      deity: "Hanuman Ji",
      timing: "Commonly recited on Tuesdays, Saturdays, and after the Hanuman Chalisa.",
      text: `Aarti Kije Hanuman Lala Ki
Dusht Dalan Raghunath Kala Ki

Jake Bal Se Girivar Kaanpe
Rog Dosh Jake Nikat Na Jhaanke

Anjani Putra Mahabaldayi
Santan Ke Prabhu Sada Sahai

De Beera Raghunath Pathaye
Lanka Jari Siya Sudhi Laye`,
    },
    {
      id: "lakshmi-aarti",
      title: "Lakshmi Mata Ki Aarti",
      deity: "Lakshmi Mata",
      timing: "Often recited on Fridays, during Diwali, and for prayers related to prosperity.",
      text: `Om Jai Lakshmi Mata, Maiya Jai Lakshmi Mata
Tumko Nishdin Sevat, Har Vishnu Vidhata

Uma Rama Brahmani, Tum Hi Jag Mata
Surya Chandrama Dhyavat, Narad Rishi Gata

Durga Roop Niranjani, Sukh Sampatti Data
Jo Koi Tumko Dhyavat, Riddhi Siddhi Dhan Pata`,
    },
    {
      id: "durga-aarti",
      title: "Durga Mata Ki Aarti",
      deity: "Durga Mata",
      timing: "Commonly recited during Navratri, Friday puja, and Mata devotion.",
      text: `Jai Ambe Gauri, Maiya Jai Shyama Gauri
Tumko Nishdin Dhyavat, Hari Brahma Shivri

Maang Sindoor Virajat, Tiko Mrigmad Ko
Ujjwal Se Dou Naina, Chandra Vadan Niko

Kanak Saman Kalevar, Raktambar Raje
Rakt Pushp Gal Mala, Kanthan Par Saje

Kehri Vahan Raje, Khadag Khappar Dhari
Sur Nar Muni Jan Sewat, Tinke Dukhahari

Kanan Kundal Shobhit, Nasagre Moti
Kotik Chandra Divakar, Rajat Sam Jyoti`,
    },
    {
      id: "shiv-aarti",
      title: "Shiv Ji Ki Aarti",
      deity: "Shiv Ji",
      timing: "Frequently recited on Mondays, Shivratri, during Sawan, and in Shiv puja.",
      text: `Om Jai Shiv Omkara, Swami Jai Shiv Omkara
Brahma Vishnu Sadashiv, Ardhangi Dhara

Ekanan Chaturanan Panchanan Raje
Hansasan Garudasan Vrishvahan Saje

Do Bhuj Char Chaturbhuj Dashbhuj Ati Sohe
Trigun Roop Nirakhte Tribhuvan Jan Mohe

Akshamala Vanamala Mundamala Dhari
Tripurari Kansari Kar Mala Dhari`,
    },
    {
      id: "jagdish-aarti",
      title: "Om Jai Jagdish Hare",
      deity: "Vishnu Bhagwan",
      timing: "Suitable for daily evening aarti, family puja, and temple bhajan sessions.",
      text: `Om Jai Jagdish Hare, Swami Jai Jagdish Hare
Bhakt Jano Ke Sankat, Kshan Mein Door Kare

Jo Dhyave Phal Pave, Dukh Vinse Man Ka
Sukh Sampatti Ghar Aave, Kasht Mite Tan Ka

Maat Pita Tum Mere, Sharan Gahun Main Kis Ki
Tum Bin Aur Na Dooja, Aas Karun Main Jis Ki

Tum Puran Parmatma, Tum Antaryami
Parbrahm Parmeshwar, Tum Sabke Swami`,
    },
    {
      id: "krishna-aarti",
      title: "Aarti Kunj Bihari Ki",
      deity: "Shri Krishna",
      timing: "Often recited during Janmashtami, Krishna puja, and bhajan evenings.",
      text: `Aarti Kunj Bihari Ki
Shri Girdhar Krishna Murari Ki

Gale Mein Vaijanti Mala
Bajave Murli Madhur Bala

Shravan Mein Kundal Jhalakala
Nand Ke Anand Nandalala

Gagan Sam Ang Kanti Kali
Radhika Chamak Rahi Aali

Latan Mein Thadhe Banmali
Bhramar Si Alak Kasturi Tilak Chhali`,
    },
  ],
  chalisa: [
    {
      id: "hanuman-chalisa",
      title: "Hanuman Chalisa",
      deity: "Hanuman Ji",
      timing: "Often recited in the morning, evening, on Tuesdays, Saturdays, or during difficult periods.",
      text: `Shri Guru Charan Saroj Raj, Nij Manu Mukuru Sudhari
Baranau Raghubar Bimal Jasu, Jo Dayaku Phal Chari

Buddhiheen Tanu Janike, Sumirau Pavan Kumar
Bal Buddhi Vidya Dehu Mohe, Harahu Kalesh Vikaar

Jai Hanuman Gyan Gun Sagar
Jai Kapis Tihun Lok Ujagar
Ram Doot Atulit Bal Dhama
Anjani Putra Pavan Sut Nama
Mahavir Vikram Bajrangi
Kumati Nivar Sumati Ke Sangi
Kanchan Baran Biraj Suvesa
Kanan Kundal Kunchit Kesa
Haath Bajra Aur Dhvaja Viraje
Kandhe Moonj Janeu Saje`,
    },
    {
      id: "shiv-chalisa",
      title: "Shiv Chalisa",
      deity: "Shiv Ji",
      timing: "Frequently recited on Mondays, Shivratri, during Sawan, and in Mahadev worship.",
      text: `Jai Ganesh Girija Suvan, Mangal Mool Sujan
Kahat Ayodhyadas Tum, Dehu Abhay Vardan

Jai Girijapati Din Dayala
Sada Karat Santan Pratipala
Bhal Chandrama Sohat Neeke
Kanan Kundal Nag Phani Ke
Ang Gaur Shir Gang Bahaye
Mundmaal Tan Chhar Lagaye
Vastra Khal Baghambar Sohe
Chhavi Ko Dekh Naag Muni Mohe`,
    },
  ],
};

export default function AartiChalisaPage() {
  const [mode, setMode] = useState("aarti");
  const [selected, setSelected] = useState({
    aarti: null,
    chalisa: null,
  });

  const items = library[mode];
  const activeId = selected[mode] || items[0]?.id;
  const activeItem = useMemo(() => items.find((item) => item.id === activeId) || null, [items, activeId]);

  return (
    <div>
      <section className="bg-hero-pattern">
        <div className="container-shell py-16 lg:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-brand-maroon shadow-soft">
              <BookOpenText className="h-4 w-4" />
              Aarti and Chalisa Library
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-tight text-brand-ink md:text-6xl">
              Popular aartis and chalisas in one place.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-ink/72">
              This page presents devotional recitations in an easy reading format. Switch between the `Aarti`
              and `Chalisa` tabs to view different prayer texts by deity.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/pandits">
                <Button>Browse Pandits</Button>
              </Link>
              <Link to="/hawan-guide">
                <Button variant="secondary">Open Hawan Guide</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-14">
        <SectionTitle
          eyebrow="Prayer Library"
          title="Read aartis and chalisas in a clean, accessible format"
          description="Choose any devotional text below and switch between prayer categories with ease."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { id: "aarti", label: "Aarti", icon: Music4 },
            { id: "chalisa", label: "Chalisa", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${
                  mode === tab.id ? "bg-brand-maroon text-white" : "bg-white text-brand-ink shadow-soft hover:bg-brand-sand"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected((current) => ({ ...current, [mode]: item.id }))}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                activeId === item.id ? "bg-brand-maroon text-white" : "bg-white text-brand-ink shadow-soft hover:bg-brand-sand"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] bg-white p-8 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-clay">{activeItem?.deity}</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-ink">{activeItem?.title}</h2>
            <p className="mt-5 text-sm leading-8 text-brand-ink/74">
              {activeItem?.timing}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/pandits">
                <Button>Book a pandit</Button>
              </Link>
              <Link to="/store">
                <Button variant="secondary">Visit the puja store</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="rounded-[24px] bg-brand-sand/25 p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-8 text-brand-ink/80">
                {activeItem?.text}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
