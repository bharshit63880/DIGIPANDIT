import { startTransition, useState } from "react";
import { Compass, MapPin, Orbit, Sparkles, TimerReset } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { SectionTitle } from "../components/SectionTitle";
import { KundaliChart } from "../components/KundaliChart";
import { KundaliPlanetTable } from "../components/KundaliPlanetTable";
import { api } from "../lib/api";

const DEFAULT_FORM = {
  fullName: " Harshit Bhardwaj",
  placeName: "jhansi",
  birthDate: "1994-04-15",
  birthTime: "10:00",
  latitude: "28.6139",
  longitude: "77.2090",
};

const signalCards = [
  {
    icon: Compass,
    title: "Precise lagna math",
    text: "Ascendant is derived from the real ecliptic-horizon intersection for the supplied birthplace and time.",
  },
  {
    icon: Orbit,
    title: "Planetary positions",
    text: "The engine returns sign, house, nakshatra, and degree-level data for the major grahas and lunar nodes.",
  },
  {
    icon: Sparkles,
    title: "Readable guidance",
    text: "Alongside chart JSON, the UI surfaces practical interpretation blocks for career, marriage, and timing.",
  },
];

export default function KundaliPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/astrology/kundali", {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });

      startTransition(() => {
        setResult(response.data.data);
      });
    } catch (requestError) {
      setResult(null);
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const kundali = result?.kundali;
  const interpretation = result?.interpretation;
  const currentMahadasha = kundali?.dashaTimeline?.find((entry) => entry.currentAtBirth) || kundali?.dashaTimeline?.[0];

  return (
    <div className="pb-20">
      <section className="bg-hero-pattern">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="space-y-7">

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-bold leading-tight text-brand-ink md:text-6xl">
                Generate a structured birth chart with real astronomical inputs.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-brand-ink/70">
                Enter date, time, and birthplace coordinates to generate lagna, graha positions, nakshatra data,
                house placements, and Vimshottari dasha in one response.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {signalCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-[28px] bg-white/85 p-5 shadow-soft backdrop-blur">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-brand-ink">{card.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-brand-ink/70">{card.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[36px] bg-white/92 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Birth Details</p>
                <h2 className="mt-2 text-3xl font-bold text-brand-ink">Kundali input</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm(DEFAULT_FORM);
                  setError("");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-brand-sand px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-cream"
              >
                <TimerReset className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Full name" name="fullName" value={form.fullName} onChange={handleChange} />
              <Input label="Place name" name="placeName" value={form.placeName} onChange={handleChange} />
              <Input label="Birth date" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
              <Input label="Birth time" name="birthTime" type="time" value={form.birthTime} onChange={handleChange} />
              <Input label="Latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} />
              <Input label="Longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} />
            </div>

            <div className="mt-6 rounded-[24px] bg-brand-cream/70 p-4 text-sm leading-7 text-brand-ink/75">
              Use exact coordinates for best lagna and house accuracy. Timezone is resolved automatically from the supplied latitude and longitude.
            </div>

            {error ? (
              <div className="mt-5 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-4">
              <Button type="submit" disabled={isLoading} className="min-w-[180px]">
                {isLoading ? "Generating..." : "Generate Kundali"}
              </Button>
              <p className="max-w-sm text-sm leading-7 text-brand-ink/65">
                The response is ready for API use, frontend rendering, and later PDF generation flows.
              </p>
            </div>
          </form>
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionTitle
          eyebrow="Chart Result"
          title={kundali ? "Live kundali output" : "Submit the form to render the chart"}
          description={
            kundali
              ? "The dashboard below is fully driven by the astrology API response."
              : "A generated chart will show lagna details, house occupancy, planetary positions, and the active dasha sequence."
          }
        />

        {!kundali ? (
          <div className="mt-10 rounded-[36px] border border-dashed border-brand-sand bg-white/80 p-10 text-center shadow-soft">
            <p className="text-lg font-semibold text-brand-ink">No kundali generated yet.</p>
            <p className="mt-3 text-sm leading-7 text-brand-ink/70">
              Start with your birth details above. The page will render a structured chart layout, detailed planet table, and interpretation blocks immediately after the API call succeeds.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <KundaliChart chart={kundali.northIndianChart} lagna={kundali.lagna} />

              <div className="space-y-6">
                <div className="rounded-[34px] bg-white p-6 shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Birth Context</p>
                      <h3 className="mt-2 text-2xl font-bold text-brand-ink">{kundali.input.fullName}</h3>
                      <p className="mt-1 text-sm text-brand-ink/65">{kundali.input.placeName}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Timezone</p>
                      <p className="mt-2 text-lg font-semibold text-brand-ink">{kundali.meta.timezone}</p>
                    </div>
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Ayanamsha</p>
                      <p className="mt-2 text-lg font-semibold text-brand-ink">{kundali.meta.ayanamsha.formatted}</p>
                    </div>
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Lagna</p>
                      <p className="mt-2 text-lg font-semibold text-brand-ink">{kundali.lagna.sign.name}</p>
                      <p className="text-sm text-brand-ink/65">{kundali.lagna.longitudeDms}</p>
                    </div>
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Moon Nakshatra</p>
                      <p className="mt-2 text-lg font-semibold text-brand-ink">
                        {kundali.planets.find((planet) => planet.name === "Moon")?.nakshatra.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[34px] bg-brand-maroon p-6 text-white shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/75">Current Timing</p>
                  <h3 className="mt-2 text-2xl font-bold">{currentMahadasha?.lord} Mahadasha</h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    Running from {currentMahadasha?.start.display} to {currentMahadasha?.end.display}
                  </p>
                  <p className="mt-5 text-sm leading-7 text-white/75">
                    Balance at birth: {currentMahadasha?.balanceAtBirthYears} years
                  </p>
                </div>
              </div>
            </div>

            <KundaliPlanetTable planets={kundali.planets} />

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[34px] bg-white p-6 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">House Placements</p>
                <div className="mt-5 space-y-3">
                  {kundali.housePlacements.map((house) => (
                    <div key={house.house} className="rounded-[22px] border border-brand-sand/70 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-ink">House {house.house}</p>
                        <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-ink">
                          {house.sign}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-brand-ink/70">
                        Occupants: {house.occupants.length ? house.occupants.map((occupant) => occupant.name).join(", ") : "Empty"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[34px] bg-white p-6 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Interpretation</p>
                  <h3 className="mt-2 text-2xl font-bold text-brand-ink">Readable chart notes</h3>
                  <p className="mt-4 text-sm leading-7 text-brand-ink/75">{interpretation.summary}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-sm font-bold text-brand-ink">Career</p>
                      <p className="mt-2 text-sm leading-7 text-brand-ink/70">{interpretation.career}</p>
                    </div>
                    <div className="rounded-[24px] bg-brand-cream/70 p-4">
                      <p className="text-sm font-bold text-brand-ink">Marriage</p>
                      <p className="mt-2 text-sm leading-7 text-brand-ink/70">{interpretation.marriage}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-[34px] bg-white p-6 shadow-soft">
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Strengths</p>
                    <div className="mt-4 space-y-3">
                      {interpretation.strengths.map((item) => (
                        <p key={item} className="rounded-[22px] bg-brand-cream/70 px-4 py-3 text-sm leading-7 text-brand-ink/75">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[34px] bg-white p-6 shadow-soft">
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Watchouts</p>
                    <div className="mt-4 space-y-3">
                      {interpretation.weaknesses.map((item) => (
                        <p key={item} className="rounded-[22px] bg-brand-cream/70 px-4 py-3 text-sm leading-7 text-brand-ink/75">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[34px] bg-brand-forest p-6 text-white shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/70">Daily Horoscope</p>
                  <p className="mt-3 text-base leading-8 text-white/85">{interpretation.dailyHoroscope}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] bg-white p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Vimshottari Dasha</p>
              <h3 className="mt-2 text-2xl font-bold text-brand-ink">Mahadasha and antardasha timeline</h3>

              <div className="mt-6 space-y-4">
                {kundali.dashaTimeline.slice(0, 5).map((entry) => (
                  <article key={`${entry.lord}-${entry.actualStart.iso}`} className="rounded-[24px] border border-brand-sand/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-brand-ink">{entry.lord} Mahadasha</p>
                        <p className="text-sm text-brand-ink/65">
                          {entry.start.display} to {entry.end.display}
                        </p>
                      </div>
                      <div className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-ink">
                        {entry.balanceAtBirthYears} years
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {entry.antardashas.slice(0, 6).map((antardasha) => (
                        <div key={`${entry.lord}-${antardasha.lord}-${antardasha.start.iso}`} className="rounded-[20px] bg-brand-cream/70 p-4">
                          <p className="text-sm font-bold text-brand-ink">{antardasha.lord} Antardasha</p>
                          <p className="mt-2 text-sm leading-6 text-brand-ink/70">
                            {antardasha.start.display} to {antardasha.end.display}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
