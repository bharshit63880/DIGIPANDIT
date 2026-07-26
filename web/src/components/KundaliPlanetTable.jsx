import { translatePlanet, translateSign } from "../lib/kundaliI18n";

export function KundaliPlanetTable({ planets, language = "en" }) {
  return (
    <div id="kundali-planet-table" className="scroll-mt-28 overflow-hidden rounded-[34px] border border-brand-sand/70 bg-white shadow-soft">
      <div className="border-b border-brand-sand/70 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">{language === "hi" ? "ग्रह स्थिति" : "Planetary Snapshot"}</p>
        <h3 className="mt-2 text-2xl font-bold text-brand-ink">{language === "hi" ? "निरयण ग्रह स्थिति" : "Sidereal positions"}</h3>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {planets.map((planet) => (
          <article key={planet.key} className="rounded-2xl border border-brand-sand/70 bg-brand-cream/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <strong>{translatePlanet(planet.name, language)}</strong>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold">{language === "hi" ? "भाव" : "House"} {planet.house}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-brand-ink/55">{language === "hi" ? "राशि" : "Sign"}</span><p className="font-semibold">{translateSign(planet.sign.name, language)}</p></div>
              <div><span className="text-xs text-brand-ink/55">{language === "hi" ? "नक्षत्र" : "Nakshatra"}</span><p className="font-semibold">{planet.nakshatra.name}</p></div>
              <div><span className="text-xs text-brand-ink/55">{language === "hi" ? "अंश" : "Longitude"}</span><p>{planet.longitudeDms}</p></div>
              <div><span className="text-xs text-brand-ink/55">{language === "hi" ? "पाद" : "Pada"}</span><p>{planet.nakshatra.pada}</p></div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full table-fixed text-left">
          <thead className="bg-brand-cream/70 text-xs font-bold uppercase tracking-[0.18em] text-brand-ink/70">
            <tr>
              {[language === "hi" ? "ग्रह" : "Planet", language === "hi" ? "राशि" : "Sign", language === "hi" ? "भाव" : "House", language === "hi" ? "अंश" : "Longitude", language === "hi" ? "नक्षत्र" : "Nakshatra", language === "hi" ? "अक्षांश" : "Latitude"].map((heading) => <th key={heading} className="px-4 py-4">{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => (
              <tr key={planet.key} className="border-t border-brand-sand/60 text-sm text-brand-ink">
                <td className="break-words px-4 py-4 font-semibold">{translatePlanet(planet.name, language)}</td>
                <td className="break-words px-4 py-4">
                  {translateSign(planet.sign.name, language)}
                  <div className="text-xs text-brand-ink/60">{planet.sign.degreeInSignDms}</div>
                </td>
                <td className="px-4 py-4">{language === "hi" ? "भाव" : "House"} {planet.house}</td>
                <td className="break-words px-4 py-4">
                  {planet.longitudeDms}
                  <div className="text-xs text-brand-ink/60">{planet.siderealLongitude.toFixed(4)} deg</div>
                </td>
                <td className="break-words px-4 py-4">
                  {planet.nakshatra.name}
                  <div className="text-xs text-brand-ink/60">{language === "hi" ? "पाद" : "Pada"} {planet.nakshatra.pada}</div>
                </td>
                <td className="break-words px-4 py-4">{planet.latitude.toFixed(4)}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
