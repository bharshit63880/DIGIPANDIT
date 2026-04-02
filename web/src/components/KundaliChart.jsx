function formatOccupants(occupants) {
  return occupants.length ? occupants.join(", ") : "No planets";
}

export function KundaliChart({ chart, lagna }) {
  return (
    <div className="rounded-[34px] border border-brand-sand/70 bg-white p-4 shadow-soft sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">North Indian Chart</p>
          <h3 className="mt-2 text-2xl font-bold text-brand-ink">Rashi placement grid</h3>
        </div>
        <div className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-ink">
          Lagna: {lagna.sign.name}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="grid aspect-square grid-cols-4 grid-rows-4 gap-3 rounded-[28px] bg-brand-cream/60 p-3">
          {chart.houses.map((house) => (
            <article
              key={house.house}
              style={{ gridColumn: house.grid.column, gridRow: house.grid.row }}
              className="flex min-h-[88px] flex-col justify-between rounded-[22px] border border-brand-sand/70 bg-white p-3 shadow-[0_12px_28px_rgba(32,33,38,0.06)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-clay">House {house.house}</span>
                <span className="rounded-full bg-brand-cream px-2 py-1 text-[11px] font-semibold text-brand-ink">{house.sign}</span>
              </div>
              <p className="mt-2 text-sm font-medium leading-5 text-brand-ink">{formatOccupants(house.occupants)}</p>
            </article>
          ))}

          <div className="col-[2/4] row-[2/4] flex flex-col justify-center rounded-[28px] border border-dashed border-brand-sand bg-white/80 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Chart Core</p>
            <p className="mt-2 text-2xl font-bold text-brand-ink">{lagna.sign.name} Lagna</p>
            <p className="mt-2 text-sm leading-6 text-brand-ink/70">
              {lagna.longitudeDms} • {lagna.nakshatra.name} Pada {lagna.nakshatra.pada}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] bg-brand-maroon p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/75">Reading Notes</p>
          <p className="mt-4 text-lg font-semibold">Use the grid as a house-by-house quick scan.</p>
          <p className="mt-3 text-sm leading-7 text-white/75">
            Each card shows the house number, sign occupying that house from lagna, and the planets currently placed there.
          </p>
          <p className="mt-5 text-sm leading-7 text-white/75">
            This view is optimized for fast frontend rendering while keeping the backend data structured enough for PDFs and expert dashboards later.
          </p>
        </div>
      </div>
    </div>
  );
}
