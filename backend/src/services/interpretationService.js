const HOUSE_KEYWORDS = {
  1: "self-development, visibility, and personal vitality",
  2: "income stability, speech, and family values",
  3: "initiative, communication, and independent effort",
  4: "home comfort, emotional grounding, and property matters",
  5: "creativity, intelligence, and children",
  6: "competition, service, and problem-solving",
  7: "partnerships, contracts, and public relationships",
  8: "transformation, research, and hidden matters",
  9: "faith, luck, higher learning, and mentors",
  10: "career, authority, and public responsibility",
  11: "networks, gains, and long-term ambitions",
  12: "retreat, foreign links, rest, and spiritual reflection",
};

function findPlanet(kundali, planetName) {
  return kundali.planets.find((planet) => planet.name === planetName);
}

function buildStrengths(kundali) {
  const lagnaLord = findPlanet(kundali, kundali.rulers.ascendantLord);
  const moon = findPlanet(kundali, "Moon");
  const jupiter = findPlanet(kundali, "Jupiter");

  return [
    `${kundali.lagna.sign.name} rising gives a natural pull toward ${HOUSE_KEYWORDS[lagnaLord.house]}.`,
    `${moon.sign.name} Moon supports emotional processing through ${HOUSE_KEYWORDS[moon.house]}.`,
    `Jupiter in house ${jupiter.house} highlights growth through ${HOUSE_KEYWORDS[jupiter.house]}.`,
  ];
}

function buildWeaknesses(kundali) {
  const saturn = findPlanet(kundali, "Saturn");
  const rahu = findPlanet(kundali, "Rahu");
  const ketu = findPlanet(kundali, "Ketu");

  return [
    `Saturn in house ${saturn.house} can delay matters connected with ${HOUSE_KEYWORDS[saturn.house]}.`,
    `Rahu in house ${rahu.house} may create over-focus around ${HOUSE_KEYWORDS[rahu.house]}.`,
    `Ketu in house ${ketu.house} can make you detach quickly from ${HOUSE_KEYWORDS[ketu.house]}.`,
  ];
}

function generateKundaliInterpretation(kundali) {
  const fullName = kundali.input.fullName;
  const sun = findPlanet(kundali, "Sun");
  const moon = findPlanet(kundali, "Moon");
  const venus = findPlanet(kundali, "Venus");
  const jupiter = findPlanet(kundali, "Jupiter");
  const lagnaLord = findPlanet(kundali, kundali.rulers.ascendantLord);
  const seventhLord = findPlanet(kundali, kundali.rulers.seventhHouseLord);
  const tenthLord = findPlanet(kundali, kundali.rulers.tenthHouseLord);
  const currentMahadasha = kundali.dashaTimeline.find((entry) => entry.currentAtBirth) || kundali.dashaTimeline[0];
  const currentAntardasha =
    currentMahadasha.antardashas.find((entry) => entry.currentAtBirth) || currentMahadasha.antardashas[0];

  return {
    summary: `${fullName} has a ${kundali.lagna.sign.name} lagna with a ${moon.sign.name} Moon, creating a chart that blends instinctive action with emotional depth. The chart is currently opening under ${currentMahadasha.lord} Mahadasha and ${currentAntardasha.lord} Antardasha themes.`,
    career: `Your 10th house is led by ${kundali.rulers.tenthHouseLord}, and that lord sits in house ${tenthLord.house}. Career growth improves when you focus on ${HOUSE_KEYWORDS[tenthLord.house]} and work in roles where trust, counsel, coordination, or specialist knowledge matter.`,
    marriage: `The 7th house is ruled by ${kundali.rulers.seventhHouseLord}, placed in house ${seventhLord.house}. Partnerships tend to deepen through ${HOUSE_KEYWORDS[seventhLord.house]}, while Venus in house ${venus.house} shows how affection is expressed and what kind of emotional rhythm supports commitment.`,
    strengths: buildStrengths(kundali),
    weaknesses: buildWeaknesses(kundali),
    dailyHoroscope: `${moon.sign.name} Moon favors practical emotional clarity today. Prioritize one meaningful decision, protect your energy from over-commitment, and let ${sun.sign.name} Sun discipline guide timing over urgency.`,
    keyPlanets: {
      lagnaLord: `${kundali.rulers.ascendantLord} in house ${lagnaLord.house}`,
      sun: `Sun in ${sun.sign.name}, house ${sun.house}`,
      moon: `Moon in ${moon.sign.name}, house ${moon.house}`,
      jupiter: `Jupiter in ${jupiter.sign.name}, house ${jupiter.house}`,
    },
    note: "These interpretations are rule-based and are intended to complement, not replace, a pandit or astrologer consultation.",
  };
}

module.exports = {
  generateKundaliInterpretation,
};
