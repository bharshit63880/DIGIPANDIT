const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const COLORS = ["Saffron", "Ivory", "Emerald", "Coral", "Gold", "Sky Blue", "Rose", "Indigo", "Turquoise", "Burgundy", "Silver", "Violet"];
const DIRECTIONS = ["East", "North-East", "North", "North-West", "West", "South-West", "South", "South-East"];
const PLANET_REMEDIES = {
  Sun: { mantra: "Om Hram Hrim Hraum Sah Suryaya Namah", donation: "Wheat or jaggery", gemstone: "Ruby", day: "Sunday" },
  Moon: { mantra: "Om Som Somaya Namah", donation: "Rice or milk", gemstone: "Pearl", day: "Monday" },
  Mars: { mantra: "Om Kram Krim Kraum Sah Bhaumaya Namah", donation: "Red lentils", gemstone: "Red Coral", day: "Tuesday" },
  Mercury: { mantra: "Om Bram Brim Braum Sah Budhaya Namah", donation: "Green gram", gemstone: "Emerald", day: "Wednesday" },
  Jupiter: { mantra: "Om Gram Grim Graum Sah Gurave Namah", donation: "Turmeric or chana dal", gemstone: "Yellow Sapphire", day: "Thursday" },
  Venus: { mantra: "Om Dram Drim Draum Sah Shukraya Namah", donation: "White sweets", gemstone: "Opal", day: "Friday" },
  Saturn: { mantra: "Om Pram Prim Praum Sah Shanaye Namah", donation: "Black sesame", gemstone: "Blue Sapphire (expert advice)", day: "Saturday" },
  Rahu: { mantra: "Om Bhram Bhrim Bhraum Sah Rahave Namah", donation: "Mustard oil", gemstone: "Hessonite (expert advice)", day: "Saturday" },
  Ketu: { mantra: "Om Sram Srim Sraum Sah Ketave Namah", donation: "Blankets", gemstone: "Cat's Eye (expert advice)", day: "Tuesday" },
};

function hashText(value = "") {
  return [...String(value)].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 2166136261);
}

function score(seed, offset = 0, min = 62, max = 94) {
  return min + ((seed + offset * 7919) % (max - min + 1));
}

function getDailyGuidance(dateValue = new Date()) {
  const date = new Date(dateValue);
  const dayKey = Number(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`);
  const tithiNumber = (dayKey % 30) + 1;
  const nakshatras = ["Ashwini", "Rohini", "Mrigashira", "Pushya", "Magha", "Hasta", "Swati", "Anuradha", "Mula", "Shravana", "Dhanishta", "Revati"];
  const moonPhases = ["Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent", "New Moon"];

  return {
    date: date.toISOString().slice(0, 10),
    lucky: {
      number: (dayKey % 9) + 1,
      color: COLORS[dayKey % COLORS.length],
      direction: DIRECTIONS[dayKey % DIRECTIONS.length],
      time: `${String(7 + (dayKey % 4)).padStart(2, "0")}:${dayKey % 2 ? "15" : "45"} AM`,
    },
    panchang: {
      sunrise: "06:08 AM",
      sunset: "06:47 PM",
      moonrise: "08:12 PM",
      moonset: "07:04 AM",
      tithi: `Tithi ${tithiNumber}`,
      nakshatra: nakshatras[dayKey % nakshatras.length],
      yoga: ["Siddhi", "Shubha", "Dhriti", "Harshana"][dayKey % 4],
      karana: ["Bava", "Balava", "Kaulava", "Taitila"][dayKey % 4],
      rahuKaal: "01:30 PM – 03:00 PM",
      abhijitMuhurat: "11:56 AM – 12:48 PM",
      choghadiya: "Shubh • 09:12 AM – 10:44 AM",
    },
    moonPhase: moonPhases[dayKey % moonPhases.length],
    transit: `${["Jupiter", "Venus", "Mercury", "Saturn"][dayKey % 4]} highlights patient progress and thoughtful communication today.`,
    horoscope: SIGNS.map((sign, index) => ({
      sign,
      score: score(dayKey, index, 68, 96),
      summary: `${sign} energy supports ${["career planning", "honest conversations", "financial discipline", "rest and renewal"][index % 4]}. Keep one clear priority.`,
    })),
  };
}

function getPlanet(kundali, name) {
  return kundali.planets.find((planet) => planet.name === name);
}

function buildAdvancedReport(kundali, interpretation) {
  const seed = hashText(`${kundali.input.fullName}${kundali.input.birthDate}${kundali.lagna.sign.name}`);
  const scores = {
    life: score(seed, 1),
    career: score(seed, 2),
    finance: score(seed, 3),
    marriage: score(seed, 4),
    health: score(seed, 5),
    spiritual: score(seed, 6),
  };
  const currentDasha = kundali.dashaTimeline?.[0];
  const moon = getPlanet(kundali, "Moon");
  const jupiter = getPlanet(kundali, "Jupiter");

  return {
    scores,
    overview: interpretation.summary,
    sections: {
      personality: `${kundali.lagna.sign.name} rising gives a distinctive outer style, while ${moon.sign.name} Moon shapes an intuitive and emotionally perceptive inner world.`,
      career: interpretation.career,
      marriage: interpretation.marriage,
      love: `Venus themes become stronger through honest affection, consistent effort, and relationships that respect independence as well as belonging.`,
      health: "Your chart favors sustainable routines over extremes. Sleep, hydration, movement, and timely professional care remain the strongest foundations.",
      business: `Jupiter in house ${jupiter.house} supports growth through patient planning, ethical partnerships, and expertise-led decisions.`,
      education: "Focused learning cycles and practical application produce better outcomes than scattered study.",
      foreignTravel: "Foreign connections are best approached through skill, documentation, and long-term professional networks.",
      finance: "Disciplined allocation, a safety reserve, and low-emotion decisions support steady financial progress.",
      property: "Property decisions benefit from verification, family alignment, and conservative timelines.",
      children: "Patience, encouragement, and creative learning environments are especially supportive.",
      spiritualLife: "Quiet reflection, mantra practice, and service can create emotional clarity during demanding periods.",
      future: `${currentDasha?.lord || "Current"} dasha themes reward consistency. Use predictions as planning guidance, not certainty.`,
    },
    strengths: interpretation.strengths,
    weaknesses: interpretation.weaknesses,
    hiddenTalents: ["Pattern recognition", "Calm guidance under pressure", "Connecting practical and intuitive insight"],
    timeline: kundali.dashaTimeline?.slice(0, 6).map((period, index) => ({
      title: `${period.lord} Mahadasha`,
      start: period.start?.display || period.actualStart?.display,
      end: period.end?.display,
      tone: index < 2 ? "Growth and recalibration" : "Long-term development",
    })) || [],
    disclaimer: "Astrological insights are interpretive guidance and should not replace medical, legal, financial, or mental-health professionals.",
  };
}

function analyzeDoshas(kundali) {
  const mars = getPlanet(kundali, "Mars");
  const saturn = getPlanet(kundali, "Saturn");
  const rahu = getPlanet(kundali, "Rahu");
  const ketu = getPlanet(kundali, "Ketu");
  const moon = getPlanet(kundali, "Moon");
  const candidates = [
    { name: "Manglik Dosh", active: [1, 2, 4, 7, 8, 12].includes(mars.house), planet: "Mars", cause: `Mars is placed in house ${mars.house}.` },
    { name: "Shani Influence", active: [1, 4, 7, 8, 10, 12].includes(saturn.house), planet: "Saturn", cause: `Saturn influences the chart from house ${saturn.house}.` },
    { name: "Guru Chandal Pattern", active: getPlanet(kundali, "Jupiter").house === rahu.house, planet: "Jupiter", cause: "Jupiter and Rahu share a house." },
    { name: "Grahan Pattern", active: [rahu.house, ketu.house].includes(getPlanet(kundali, "Sun").house) || [rahu.house, ketu.house].includes(moon.house), planet: "Moon", cause: "A luminary shares a house axis with Rahu or Ketu." },
    { name: "Kemadruma Pattern", active: Math.abs(moon.house - getPlanet(kundali, "Venus").house) > 3, planet: "Moon", cause: "Moon has limited benefic support in adjacent chart sectors." },
  ];

  return candidates.map((item, index) => ({
    ...item,
    severity: item.active ? ["Mild", "Moderate", "Noticeable"][index % 3] : "Not detected",
    effects: item.active ? "May bring delays, intensity, or lessons around the related life area." : "No prominent classical pattern detected in this simplified screening.",
    duration: item.active ? "Most relevant during connected planetary periods and transits." : "Not applicable",
    remedies: {
      mantra: PLANET_REMEDIES[item.planet].mantra,
      donation: PLANET_REMEDIES[item.planet].donation,
      gemstone: PLANET_REMEDIES[item.planet].gemstone,
      fast: PLANET_REMEDIES[item.planet].day,
      puja: `${item.planet} Shanti Puja after personal consultation`,
    },
  }));
}

function numerology({ fullName, birthDate }) {
  const digits = String(birthDate).replace(/\D/g, "").split("").map(Number);
  const reduce = (value) => {
    let result = value;
    while (result > 9 && ![11, 22, 33].includes(result)) result = String(result).split("").reduce((sum, digit) => sum + Number(digit), 0);
    return result;
  };
  const cleanName = String(fullName).toUpperCase().replace(/[^A-Z]/g, "");
  const nameTotal = [...cleanName].reduce((sum, letter) => sum + ((letter.charCodeAt(0) - 65) % 9) + 1, 0);
  const vowels = [...cleanName].filter((letter) => "AEIOU".includes(letter));
  const soulTotal = vowels.reduce((sum, letter) => sum + ((letter.charCodeAt(0) - 65) % 9) + 1, 0);
  const lifePath = reduce(digits.reduce((sum, digit) => sum + digit, 0));
  const destiny = reduce(nameTotal);
  const soul = reduce(soulTotal);

  return {
    lifePath,
    destiny,
    soul,
    personality: reduce(nameTotal - soulTotal),
    luckyNumber: ((lifePath + destiny) % 9) + 1,
    luckyColor: COLORS[(lifePath + destiny) % COLORS.length],
    luckyDay: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][(lifePath + destiny) % 7],
    prediction: `Life Path ${lifePath} and Destiny ${destiny} favor progress through self-awareness, consistency, and purposeful communication.`,
  };
}

function matchKundalis(bride, groom) {
  const seed = hashText(`${bride.fullName}${bride.birthDate}${groom.fullName}${groom.birthDate}`);
  const factors = ["Varna", "Vashya", "Tara", "Yoni", "Graha Maitri", "Gana", "Bhakoot", "Nadi"].map((name, index) => ({
    name,
    score: score(seed, index, 2, index > 5 ? 8 : 5),
    maxScore: index > 5 ? 8 : 5,
  }));
  const total = Math.min(36, factors.reduce((sum, factor) => sum + factor.score, 0));
  const compatibility = Math.round((total / 36) * 100);

  return {
    total,
    maxScore: 36,
    compatibility,
    factors,
    dimensions: {
      love: score(seed, 10),
      marriage: score(seed, 11),
      finance: score(seed, 12),
      communication: score(seed, 13),
      trust: score(seed, 14),
      family: score(seed, 15),
      health: score(seed, 16),
    },
    manglik: { bride: seed % 3 === 0 ? "Mild" : "Clear", groom: seed % 4 === 0 ? "Mild" : "Clear" },
    recommendation: compatibility >= 75 ? "Strong compatibility with constructive long-term potential." : compatibility >= 55 ? "Balanced match; discuss expectations and seek personal guidance." : "Important differences need thoughtful discussion before a decision.",
    advice: "Gun Milan is one input, not a complete marriage decision. Values, consent, communication, health, and family expectations matter equally.",
  };
}

module.exports = { getDailyGuidance, buildAdvancedReport, analyzeDoshas, numerology, matchKundalis, PLANET_REMEDIES };
