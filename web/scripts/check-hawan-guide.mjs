import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const files = [
  "src/pages/HawanPage.jsx",
  "src/pages/HawanDetailPage.jsx",
  "src/components/HawanCard.jsx",
  "src/components/HawanSourceAttribution.jsx",
  "src/features/hawan/hawanProgress.js",
  "src/styles/hawan-journey.css",
];
const source = files.map((file) => readFileSync(resolve(file), "utf8")).join("\n");
const forbidden = ["HawanFire3D", "AdaptiveCanvas", "requestAnimationFrame", "useFrame", "framer-motion", "gsap", "@keyframes", "animation:"];
const required = ["/hawans", "सामग्री सूची", "अनिवार्य सुरक्षा सीमा", "निर्देशित हवन", "localStorage", "HawanSourceAttribution"];

for (const token of forbidden) {
  if (source.includes(token)) throw new Error(`हवन यूआई में निषिद्ध प्रभाव मिला: ${token}`);
}
for (const token of required) {
  if (!source.includes(token)) throw new Error(`हवन यूआई का आवश्यक भाग नहीं मिला: ${token}`);
}
console.log("हवन गाइड की स्थिर जाँच सफल रही।");
