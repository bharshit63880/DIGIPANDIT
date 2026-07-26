import { translatePlanet, translateSign } from "../lib/kundaliI18n";

function formatOccupants(occupants, language) {
  if (!Array.isArray(occupants) || !occupants.length) return language === "hi" ? "कोई ग्रह नहीं" : "No planets";
  return occupants.map((planet) => translatePlanet(planet, language)).join(", ");
}

export function KundaliChart({ chart, lagna, language = "en" }) {
  const houses = Array.isArray(chart?.houses) ? chart.houses : [];
  const lagnaName = lagna?.sign?.name || "Unknown";

  if (!houses.length) {
    return (
      <div className="rounded-[34px] border border-brand-sand/70 bg-white p-6 text-center shadow-soft">
        <p className="text-sm font-semibold text-brand-ink/70">
          Chart placement data is temporarily unavailable. Your remaining Kundali report is shown below.
        </p>
      </div>
    );
  }

  return (
    <div id="kundali-chart" className="scroll-mt-28 rounded-[34px] border border-brand-sand/70 bg-white p-4 shadow-soft sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">{language === "hi" ? "उत्तर भारतीय कुंडली" : "North Indian Chart"}</p>
          <h3 className="mt-2 text-2xl font-bold text-brand-ink">{language === "hi" ? "राशि और भाव स्थिति" : "Rashi placement grid"}</h3>
        </div>
        <div className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-ink">
          {language === "hi" ? "लग्न" : "Lagna"}: {translateSign(lagnaName, language)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-[24px] bg-brand-cream/60 p-3 sm:hidden">
        {houses.map((house) => (
          <article key={house.house} className="min-w-0 rounded-[18px] border border-brand-sand/70 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">{language === "hi" ? "भाव" : "House"} {house.house}</span>
              <span className="rounded-full bg-brand-cream px-2 py-1 text-[10px] font-semibold">{translateSign(house.sign, language)}</span>
            </div>
            <p className="mt-3 break-words text-sm font-medium">{formatOccupants(house.occupants, language)}</p>
          </article>
        ))}
      </div>

      <div className="hidden min-h-[560px] grid-cols-4 grid-rows-4 gap-3 rounded-[28px] bg-brand-cream/60 p-4 sm:grid">
          {houses.map((house) => (
            <article
              key={house.house}
              style={{ gridColumn: house.grid.column, gridRow: house.grid.row }}
              className="flex min-h-[88px] flex-col justify-between rounded-[22px] border border-brand-sand/70 bg-white p-3 shadow-[0_12px_28px_rgba(32,33,38,0.06)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-clay">{language === "hi" ? "भाव" : "House"} {house.house}</span>
                <span className="rounded-full bg-brand-cream px-2 py-1 text-[11px] font-semibold text-brand-ink">{translateSign(house.sign, language)}</span>
              </div>
              <p className="mt-2 break-words text-sm font-medium leading-5 text-brand-ink">{formatOccupants(house.occupants, language)}</p>
            </article>
          ))}

          <div className="col-[2/4] row-[2/4] flex flex-col justify-center rounded-[28px] border border-dashed border-brand-sand bg-white/80 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">{language === "hi" ? "कुंडली केंद्र" : "Chart Core"}</p>
            <p className="mt-2 text-2xl font-bold text-brand-ink">{translateSign(lagnaName, language)} {language === "hi" ? "लग्न" : "Lagna"}</p>
            <p className="mt-2 text-sm leading-6 text-brand-ink/70">
              {lagna.longitudeDms} • {lagna.nakshatra.name} Pada {lagna.nakshatra.pada}
            </p>
          </div>
      </div>
      <div className="mt-4 rounded-[24px] bg-brand-maroon p-5 text-white sm:flex sm:items-start sm:gap-8">
        <div className="shrink-0">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/65">{language === "hi" ? "पढ़ने का तरीका" : "Reading Notes"}</p>
          <p className="mt-2 text-lg font-semibold">{language === "hi" ? "हर भाव को अलग-अलग समझें।" : "Use the grid as a house-by-house quick scan."}</p>
        </div>
        <p className="mt-3 text-sm leading-7 text-white/70 sm:mt-0">
          {language === "hi"
            ? "हर कार्ड में भाव संख्या, उस भाव की राशि और उसमें स्थित ग्रह दिखाए गए हैं। खाली भाव का अर्थ यह नहीं है कि वह जीवन क्षेत्र महत्वहीन है।"
            : "Each card shows the house number, its sign from the lagna, and the planets placed there. An empty house does not mean that life area is unimportant."}
        </p>
      </div>
    </div>
  );
}
