export function KundaliPlanetTable({ planets }) {
  return (
    <div className="overflow-hidden rounded-[34px] border border-brand-sand/70 bg-white shadow-soft">
      <div className="border-b border-brand-sand/70 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">Planetary Snapshot</p>
        <h3 className="mt-2 text-2xl font-bold text-brand-ink">Sidereal positions</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-brand-cream/70 text-xs font-bold uppercase tracking-[0.18em] text-brand-ink/70">
            <tr>
              <th className="px-6 py-4">Planet</th>
              <th className="px-6 py-4">Sign</th>
              <th className="px-6 py-4">House</th>
              <th className="px-6 py-4">Longitude</th>
              <th className="px-6 py-4">Nakshatra</th>
              <th className="px-6 py-4">Latitude</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => (
              <tr key={planet.key} className="border-t border-brand-sand/60 text-sm text-brand-ink">
                <td className="px-6 py-4 font-semibold">{planet.name}</td>
                <td className="px-6 py-4">
                  {planet.sign.name}
                  <div className="text-xs text-brand-ink/60">{planet.sign.degreeInSignDms}</div>
                </td>
                <td className="px-6 py-4">House {planet.house}</td>
                <td className="px-6 py-4">
                  {planet.longitudeDms}
                  <div className="text-xs text-brand-ink/60">{planet.siderealLongitude.toFixed(4)} deg</div>
                </td>
                <td className="px-6 py-4">
                  {planet.nakshatra.name}
                  <div className="text-xs text-brand-ink/60">Pada {planet.nakshatra.pada}</div>
                </td>
                <td className="px-6 py-4">{planet.latitude.toFixed(4)} deg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
