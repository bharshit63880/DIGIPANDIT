const { City } = require("country-state-city");

const indianCities = City.getCitiesOfCountry("IN")
  .filter((city) => city.latitude && city.longitude)
  .map((city) => ({
    name: city.name,
    stateCode: city.stateCode,
    latitude: Number(city.latitude),
    longitude: Number(city.longitude),
  }));

function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function searchIndianCities(query) {
  const search = String(query || "").trim().toLowerCase();
  if (search.length < 2) return [];

  return indianCities
    .map((city) => {
      const normalizedName = city.name.toLowerCase();
      const directMatch = `${normalizedName} ${city.stateCode.toLowerCase()}`.includes(search);
      const cityNames = normalizedName
        .split(/[(/-]/)
        .map((name) => name.replace(/[^a-z]/g, ""))
        .filter(Boolean);
      const normalizedSearch = search.replace(/[^a-z]/g, "");
      const distance = directMatch ? 0 : Math.min(...cityNames.map((name) => editDistance(name, normalizedSearch)));
      return { ...city, matchRank: directMatch ? 0 : distance };
    })
    .filter((city) => city.matchRank <= Math.max(2, Math.floor(search.length / 4)))
    .sort((left, right) => {
      const leftStarts = left.name.toLowerCase().startsWith(search);
      const rightStarts = right.name.toLowerCase().startsWith(search);
      return left.matchRank - right.matchRank || Number(rightStarts) - Number(leftStarts) || left.name.localeCompare(right.name);
    })
    .slice(0, 10)
    .map(({ matchRank, ...city }) => city);
}

module.exports = { searchIndianCities };
