const Astronomy = require("astronomy-engine");
const { DateTime } = require("luxon");
const tzLookup = require("tz-lookup");

const SIDEREAL_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

const DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

const DASHA_YEARS = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const SIGN_RULERS = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

const PLANETS = [
  { key: "sun", name: "Sun", type: "graha" },
  { key: "moon", name: "Moon", type: "graha" },
  { key: "mars", name: "Mars", type: "graha" },
  { key: "mercury", name: "Mercury", type: "graha" },
  { key: "jupiter", name: "Jupiter", type: "graha" },
  { key: "venus", name: "Venus", type: "graha" },
  { key: "saturn", name: "Saturn", type: "graha" },
  { key: "rahu", name: "Rahu", type: "node" },
  { key: "ketu", name: "Ketu", type: "node" },
];

const PLANET_DRISHTI = {
  Sun: [7],
  Moon: [7],
  Mars: [4, 7, 8],
  Mercury: [7],
  Jupiter: [5, 7, 9],
  Venus: [7],
  Saturn: [3, 7, 10],
  Rahu: [5, 7, 9],
  Ketu: [5, 7, 9],
};

const NORTH_INDIAN_GRID = {
  1: { row: 2, column: 1 },
  2: { row: 1, column: 1 },
  3: { row: 1, column: 2 },
  4: { row: 1, column: 3 },
  5: { row: 1, column: 4 },
  6: { row: 2, column: 4 },
  7: { row: 3, column: 4 },
  8: { row: 4, column: 4 },
  9: { row: 4, column: 3 },
  10: { row: 4, column: 2 },
  11: { row: 4, column: 1 },
  12: { row: 3, column: 1 },
};

const KUNDALI_CACHE = new Map();
const CACHE_TTL_MS = 1000 * 60 * 15;
const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;
const J2000 = DateTime.fromISO("2000-01-01T12:00:00Z");

function normalizeDegrees(value) {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function roundTo(value, precision = 4) {
  return Number(value.toFixed(precision));
}

function toDms(angle) {
  const normalized = normalizeDegrees(angle);
  const degrees = Math.floor(normalized);
  const minutesFloat = (normalized - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);
  return `${degrees}° ${String(minutes).padStart(2, "0")}' ${String(seconds).padStart(2, "0")}"`;
}

function getSignDetails(longitude) {
  const normalized = normalizeDegrees(longitude);
  const index = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  return {
    index,
    name: SIDEREAL_SIGNS[index],
    degreeInSign: roundTo(degreeInSign),
    degreeInSignDms: toDms(degreeInSign),
  };
}

function getNakshatraDetails(longitude) {
  const normalized = normalizeDegrees(longitude);
  const index = Math.floor(normalized / NAKSHATRA_SPAN);
  const degreesIntoNakshatra = normalized - index * NAKSHATRA_SPAN;
  const pada = Math.floor(degreesIntoNakshatra / PADA_SPAN) + 1;
  const progress = degreesIntoNakshatra / NAKSHATRA_SPAN;
  const lord = DASHA_SEQUENCE[index % DASHA_SEQUENCE.length];

  return {
    index,
    name: NAKSHATRAS[index],
    pada,
    lord,
    progress: roundTo(progress, 6),
    degreesIntoNakshatra: roundTo(degreesIntoNakshatra),
  };
}

function formatTimelineDate(dateTime) {
  return {
    iso: dateTime.toISO(),
    display: dateTime.toFormat("dd LLL yyyy, hh:mm a"),
  };
}

function shiftByFractionalYears(dateTime, years) {
  return dateTime.plus({ days: years * 365.2425 });
}

function calculateLahiriAyanamsha(utcDateTime) {
  const tropicalYears = utcDateTime.diff(J2000, "days").days / 365.2425;
  const lahiriAtJ2000 = 23.8530555556;
  const annualPrecession = 50.290966 / 3600;
  return normalizeDegrees(lahiriAtJ2000 + tropicalYears * annualPrecession);
}

function calculateNodeLongitude(utcDateTime) {
  const julianCenturies = utcDateTime.diff(J2000, "days").days / 36525;
  const meanNodeLongitude =
    125.04452 -
    1934.136261 * julianCenturies +
    0.0020708 * julianCenturies * julianCenturies +
    (julianCenturies * julianCenturies * julianCenturies) / 450000;

  return normalizeDegrees(meanNodeLongitude);
}

function resolveBirthContext(payload) {
  const timezone = tzLookup(payload.latitude, payload.longitude);
  const localDateTime = DateTime.fromISO(`${payload.birthDate}T${payload.birthTime}`, { zone: timezone });

  if (!localDateTime.isValid) {
    throw new Error("Invalid birth date or time.");
  }

  return {
    timezone,
    localDateTime,
    utcDateTime: localDateTime.toUTC(),
    utcDate: localDateTime.toUTC().toJSDate(),
    observer: new Astronomy.Observer(payload.latitude, payload.longitude, 0),
  };
}

function getBodyCoordinates(bodyName, utcDate) {
  if (bodyName === "Sun") {
    const sun = Astronomy.SunPosition(utcDate);
    return { longitude: sun.elon, latitude: sun.elat };
  }

  if (bodyName === "Moon") {
    const moon = Astronomy.EclipticGeoMoon(utcDate);
    return { longitude: moon.lon, latitude: moon.lat };
  }

  const vector = Astronomy.GeoVector(Astronomy.Body[bodyName], utcDate, true);
  const ecliptic = Astronomy.Ecliptic(vector);
  return { longitude: ecliptic.elon, latitude: ecliptic.elat };
}

function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z) || 1;
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
    z: vector.z / magnitude,
    t: vector.t,
  };
}

function calculateAscendant(utcDate, observer, ayanamsha) {
  const horToEqd = Astronomy.Rotation_HOR_EQD(utcDate, observer);
  const eqdToEct = Astronomy.Rotation_EQD_ECT(utcDate);
  const horToEct = Astronomy.CombineRotation(horToEqd, eqdToEct);
  const ectNorthPole = { x: 0, y: 0, z: 1, t: Astronomy.MakeTime(utcDate) };
  const eclipticNorthInHor = Astronomy.RotateVector(Astronomy.InverseRotation(horToEct), ectNorthPole);

  let ascendingIntersection = normalizeVector({
    x: -eclipticNorthInHor.y,
    y: eclipticNorthInHor.x,
    z: 0,
    t: Astronomy.MakeTime(utcDate),
  });

  if (ascendingIntersection.y > 0) {
    ascendingIntersection = {
      ...ascendingIntersection,
      x: -ascendingIntersection.x,
      y: -ascendingIntersection.y,
    };
  }

  const ascendantVector = Astronomy.RotateVector(horToEct, ascendingIntersection);
  const ascendantSphere = Astronomy.SphereFromVector(ascendantVector);
  const tropicalLongitude = normalizeDegrees(ascendantSphere.lon);
  const siderealLongitude = normalizeDegrees(tropicalLongitude - ayanamsha);
  const sign = getSignDetails(siderealLongitude);
  const nakshatra = getNakshatraDetails(siderealLongitude);

  return {
    tropicalLongitude: roundTo(tropicalLongitude),
    siderealLongitude: roundTo(siderealLongitude),
    longitudeDms: toDms(siderealLongitude),
    sign,
    nakshatra,
  };
}

function buildPlanetRecord(planet, coordinates, ayanamsha, lagnaLongitude, lagnaSignIndex) {
  const tropicalLongitude = normalizeDegrees(coordinates.longitude);
  const siderealLongitude = normalizeDegrees(tropicalLongitude - ayanamsha);
  const sign = getSignDetails(siderealLongitude);
  const nakshatra = getNakshatraDetails(siderealLongitude);
  const house = ((sign.index - lagnaSignIndex + 12) % 12) + 1;

  return {
    key: planet.key,
    name: planet.name,
    type: planet.type,
    tropicalLongitude: roundTo(tropicalLongitude),
    siderealLongitude: roundTo(siderealLongitude),
    longitudeDms: toDms(siderealLongitude),
    latitude: roundTo(coordinates.latitude),
    sign,
    nakshatra,
    house,
    degreeInHouse: roundTo(normalizeDegrees(siderealLongitude - lagnaLongitude)),
  };
}

function buildHousePlacements(lagna, planets) {
  const placements = Array.from({ length: 12 }, (_, offset) => {
    const house = offset + 1;
    const signIndex = (lagna.sign.index + offset) % 12;
    return {
      house,
      sign: SIDEREAL_SIGNS[signIndex],
      signIndex,
      cuspLongitude: roundTo(normalizeDegrees(lagna.siderealLongitude + offset * 30)),
      cuspLongitudeDms: toDms(normalizeDegrees(lagna.siderealLongitude + offset * 30)),
      occupants: [],
    };
  });

  planets.forEach((planet) => {
    placements[planet.house - 1].occupants.push({
      key: planet.key,
      name: planet.name,
      longitude: planet.siderealLongitude,
    });
  });

  placements.forEach((house) => {
    house.occupants.sort((left, right) => left.longitude - right.longitude);
  });

  return placements;
}

function buildPlanetaryAspects(planets) {
  return planets.flatMap((source) =>
    planets
      .filter((target) => target.name !== source.name)
      .flatMap((target) => {
        const houseDistance = ((target.house - source.house + 12) % 12) + 1;
        const supportedDistances = PLANET_DRISHTI[source.name] || [7];

        if (!supportedDistances.includes(houseDistance)) {
          return [];
        }

        return {
          from: source.name,
          to: target.name,
          fromHouse: source.house,
          toHouse: target.house,
          distance: houseDistance,
          aspectType: `${houseDistance}th house aspect`,
        };
      })
  );
}

function buildNorthIndianChart(housePlacements) {
  return {
    system: "north-indian-grid",
    houses: housePlacements.map((house) => ({
      ...house,
      grid: NORTH_INDIAN_GRID[house.house],
      occupants: house.occupants.map((occupant) => occupant.name),
    })),
  };
}

function buildCircularChart(planets) {
  return {
    system: "circular-rashi",
    sectors: SIDEREAL_SIGNS.map((sign, index) => ({
      sign,
      signIndex: index,
      occupants: planets.filter((planet) => planet.sign.index === index).map((planet) => planet.name),
    })),
  };
}

function generateAntardashas(startDateTime, mahadashaLord) {
  const mahadashaYears = DASHA_YEARS[mahadashaLord];
  const startIndex = DASHA_SEQUENCE.indexOf(mahadashaLord);
  let cursor = startDateTime;

  return Array.from({ length: DASHA_SEQUENCE.length }, (_, offset) => {
    const lord = DASHA_SEQUENCE[(startIndex + offset) % DASHA_SEQUENCE.length];
    const durationYears = (mahadashaYears * DASHA_YEARS[lord]) / 120;
    const end = shiftByFractionalYears(cursor, durationYears);
    const record = {
      lord,
      durationYears: roundTo(durationYears, 6),
      start: formatTimelineDate(cursor),
      end: formatTimelineDate(end),
    };

    cursor = end;
    return record;
  });
}

function generateVimshottariDasha(localDateTime, moonNakshatra) {
  const birthLord = moonNakshatra.lord;
  const birthLordIndex = DASHA_SEQUENCE.indexOf(birthLord);
  const elapsedFraction = moonNakshatra.progress;
  const currentMahadashaYears = DASHA_YEARS[birthLord];
  const elapsedYears = currentMahadashaYears * elapsedFraction;
  let mahadashaStart = shiftByFractionalYears(localDateTime, -elapsedYears);

  return Array.from({ length: DASHA_SEQUENCE.length }, (_, offset) => {
    const lord = DASHA_SEQUENCE[(birthLordIndex + offset) % DASHA_SEQUENCE.length];
    const totalYears = DASHA_YEARS[lord];
    const end = shiftByFractionalYears(mahadashaStart, totalYears);
    const antardashas = generateAntardashas(mahadashaStart, lord)
      .filter((dasha) => DateTime.fromISO(dasha.end.iso) > localDateTime)
      .map((dasha) => ({
        ...dasha,
        currentAtBirth:
          DateTime.fromISO(dasha.start.iso) <= localDateTime && localDateTime < DateTime.fromISO(dasha.end.iso),
      }));

    const effectiveStart = offset === 0 ? localDateTime : mahadashaStart;
    const entry = {
      lord,
      durationYears: roundTo(totalYears, 6),
      balanceAtBirthYears:
        offset === 0 ? roundTo(totalYears * (1 - elapsedFraction), 6) : roundTo(totalYears, 6),
      startedBeforeBirth: offset === 0 && mahadashaStart < localDateTime,
      start: formatTimelineDate(effectiveStart),
      actualStart: formatTimelineDate(mahadashaStart),
      end: formatTimelineDate(end),
      currentAtBirth: offset === 0,
      antardashas,
    };

    mahadashaStart = end;
    return entry;
  });
}

function buildCacheKey(payload) {
  return JSON.stringify({
    fullName: payload.fullName,
    birthDate: payload.birthDate,
    birthTime: payload.birthTime,
    latitude: roundTo(payload.latitude, 6),
    longitude: roundTo(payload.longitude, 6),
    placeName: payload.placeName || "",
  });
}

function getCachedKundali(cacheKey) {
  const record = KUNDALI_CACHE.get(cacheKey);
  if (!record) {
    return null;
  }

  if (Date.now() - record.createdAt > CACHE_TTL_MS) {
    KUNDALI_CACHE.delete(cacheKey);
    return null;
  }

  return record.value;
}

function setCachedKundali(cacheKey, value) {
  KUNDALI_CACHE.set(cacheKey, {
    value,
    createdAt: Date.now(),
  });
}

function generateKundali(payload) {
  const cacheKey = buildCacheKey(payload);
  const cached = getCachedKundali(cacheKey);

  if (cached) {
    return {
      ...cached,
      meta: {
        ...cached.meta,
        cached: true,
      },
    };
  }

  const context = resolveBirthContext(payload);
  const ayanamsha = calculateLahiriAyanamsha(context.utcDateTime);
  const lagna = calculateAscendant(context.utcDate, context.observer, ayanamsha);
  const rahuLongitude = calculateNodeLongitude(context.utcDateTime);
  const ketuLongitude = normalizeDegrees(rahuLongitude + 180);

  const planets = PLANETS.map((planet) => {
    if (planet.name === "Rahu") {
      return buildPlanetRecord(
        planet,
        { longitude: rahuLongitude, latitude: 0 },
        ayanamsha,
        lagna.siderealLongitude,
        lagna.sign.index
      );
    }

    if (planet.name === "Ketu") {
      return buildPlanetRecord(
        planet,
        { longitude: ketuLongitude, latitude: 0 },
        ayanamsha,
        lagna.siderealLongitude,
        lagna.sign.index
      );
    }

    return buildPlanetRecord(
      planet,
      getBodyCoordinates(planet.name, context.utcDate),
      ayanamsha,
      lagna.siderealLongitude,
      lagna.sign.index
    );
  });

  const housePlacements = buildHousePlacements(lagna, planets);
  const dashaTimeline = generateVimshottariDasha(
    context.localDateTime,
    planets.find((planet) => planet.name === "Moon").nakshatra
  );

  const kundali = {
    input: {
      fullName: payload.fullName,
      birthDate: payload.birthDate,
      birthTime: payload.birthTime,
      latitude: payload.latitude,
      longitude: payload.longitude,
      placeName: payload.placeName || "Unknown location",
    },
    meta: {
      timezone: context.timezone,
      birthDateTimeLocal: context.localDateTime.toISO(),
      birthDateTimeUtc: context.utcDateTime.toISO(),
      ayanamsha: {
        system: "Lahiri (computed)",
        degrees: roundTo(ayanamsha),
        formatted: toDms(ayanamsha),
      },
      houseSystem: "Whole sign houses with equal house cusps",
      cached: false,
    },
    lagna,
    planets,
    housePlacements,
    aspects: buildPlanetaryAspects(planets),
    dashaTimeline,
    northIndianChart: buildNorthIndianChart(housePlacements),
    circularChart: buildCircularChart(planets),
    rulers: {
      ascendantLord: SIGN_RULERS[lagna.sign.name],
      seventhHouseLord: SIGN_RULERS[housePlacements[6].sign],
      tenthHouseLord: SIGN_RULERS[housePlacements[9].sign],
    },
  };

  setCachedKundali(cacheKey, kundali);
  return kundali;
}

module.exports = {
  DASHA_SEQUENCE,
  DASHA_YEARS,
  NAKSHATRAS,
  SIDEREAL_SIGNS,
  SIGN_RULERS,
  generateKundali,
};
