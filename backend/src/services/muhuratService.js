const Astronomy = require("astronomy-engine");
const { DateTime } = require("luxon");
const tzLookup = require("tz-lookup");
const { NAKSHATRAS } = require("./astrologyService");

const TITHIS = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima","Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Amavasya"];
const RAHU_SEGMENT = [7, 1, 6, 4, 5, 3, 2]; // Sunday through Saturday, 1-indexed daylight eighth
const normalize = (value) => ((value % 360) + 360) % 360;

function solarLongitude(date) {
  return Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, date, true)).elon;
}

function panchangAt(date) {
  const moonLongitude = Astronomy.EclipticGeoMoon(date).lon;
  const sunLongitude = solarLongitude(date);
  const elongation = normalize(moonLongitude - sunLongitude);
  const tithiIndex = Math.floor(elongation / 12);
  const nakshatraIndex = Math.floor(normalize(moonLongitude - 24) / (360 / 27)); // Lahiri approximation at current epoch
  return {
    tithi: `${tithiIndex < 15 ? "Shukla" : "Krishna"} ${TITHIS[tithiIndex]}`,
    tithiNumber: tithiIndex + 1,
    nakshatra: NAKSHATRAS[(nakshatraIndex + 27) % 27],
  };
}

function buildMuhurat({ latitude, longitude, date }) {
  const timezone = tzLookup(latitude, longitude);
  const localDay = DateTime.fromISO(date || DateTime.now().setZone(timezone).toISODate(), { zone: timezone }).startOf("day");
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const searchStart = localDay.toUTC().toJSDate();
  const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, searchStart, 1)?.date;
  const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, searchStart, 1)?.date;
  if (!sunrise || !sunset) throw new Error("Sunrise or sunset is unavailable for this location and date");
  const rise = DateTime.fromJSDate(sunrise, { zone: "utc" }).setZone(timezone);
  const set = DateTime.fromJSDate(sunset, { zone: "utc" }).setZone(timezone);
  const daylightMinutes = set.diff(rise, "minutes").minutes;
  const segmentMinutes = daylightMinutes / 8;
  const weekdayIndex = rise.weekday % 7;
  const rahuStart = rise.plus({ minutes: (RAHU_SEGMENT[weekdayIndex] - 1) * segmentMinutes });
  const rahuEnd = rahuStart.plus({ minutes: segmentMinutes });
  const candidateWindows = [
    { label: "Morning window", start: rise.plus({ minutes: 48 }), end: rise.plus({ minutes: 138 }) },
    { label: "Abhijit-centered window", start: rise.plus({ minutes: daylightMinutes / 2 - 24 }), end: rise.plus({ minutes: daylightMinutes / 2 + 24 }) },
    { label: "Evening window", start: set.minus({ minutes: 120 }), end: set.minus({ minutes: 45 }) },
  ].filter((slot) => slot.end <= rahuStart || slot.start >= rahuEnd);
  const panchang = panchangAt(rise.plus({ minutes: daylightMinutes / 2 }).toUTC().toJSDate());
  const format = (value) => value.toFormat("hh:mm a");
  return {
    date: localDay.toISODate(), timezone,
    sunrise: format(rise), sunset: format(set),
    tithi: panchang.tithi, nakshatra: panchang.nakshatra,
    rahuKaal: { start: format(rahuStart), end: format(rahuEnd) },
    timings: candidateWindows.map((slot) => ({ label: slot.label, start: format(slot.start), end: format(slot.end) })),
    calculation: "Astronomical sunrise, sunset, lunar phase and weekday Rahu Kaal; Lahiri-approximate sidereal Nakshatra.",
    disclaimer: "Calculated Panchang guidance can vary by regional tradition and drik settings. Confirm high-stakes or elaborate rituals with a qualified Pandit.",
  };
}

module.exports = { buildMuhurat };
