import { Link } from "react-router-dom";

const difficultyLabels = { BEGINNER: "आरंभिक", INTERMEDIATE: "मध्यम", ADVANCED: "विशेषज्ञ सहायता उचित" };
const categoryLabels = { POPULAR: "लोकप्रिय", CAREER: "करियर", MARRIAGE: "विवाह", HEALTH: "स्वास्थ्य", WEALTH: "समृद्धि", EDUCATION: "शिक्षा", FAMILY: "परिवार", GRAH_DOSH: "ग्रह दोष", SPIRITUAL: "आध्यात्मिक", PROPERTY: "संपत्ति", BUSINESS: "व्यवसाय" };

export function HawanCard({ hawan }) {
  const participants = hawan.participantRange ? `${hawan.participantRange.min || 1}–${hawan.participantRange.max || 1} व्यक्ति` : "व्यक्ति संख्या देखें";
  const materialCount = hawan.materialCount ?? hawan.materials?.length;
  return <article className="hg-card hg-card--row">
    <div className="hg-card__top"><span>{categoryLabels[hawan.category] || hawan.category}</span>{hawan.panditRecommended ? <em>पंडित की सलाह उचित</em> : null}</div>
    <div className="hg-card__identity"><h3>{hawan.title}</h3><p>{hawan.shortDescription}</p></div>
    {hawan.purposes?.length ? <ul className="hg-card__purposes">{hawan.purposes.slice(0, 3).map((purpose) => <li key={purpose}>{purpose}</li>)}</ul> : null}
    <dl className="hg-card__facts">
      <div><dt>समय</dt><dd>{hawan.durationMinutes} मिनट</dd></div>
      <div><dt>स्तर</dt><dd>{difficultyLabels[hawan.difficulty] || hawan.difficulty}</dd></div>
      <div><dt>सहभागी</dt><dd>{participants}</dd></div>
      {materialCount !== undefined ? <div><dt>सामग्री</dt><dd>{materialCount} वस्तुएँ</dd></div> : null}
    </dl>
    <Link to={`/hawan-guide/${hawan.slug}`}>पूरी मार्गदर्शिका देखें <span aria-hidden="true">→</span></Link>
  </article>;
}
