import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { HawanCard } from "../components/HawanCard";
import { listLocalHawanProgress } from "../features/hawan/hawanProgress";
import "../styles/hawan-journey.css";

const categoryLabels = {
  POPULAR: "लोकप्रिय", CAREER: "करियर", MARRIAGE: "विवाह", HEALTH: "स्वास्थ्य",
  WEALTH: "समृद्धि", EDUCATION: "शिक्षा", FAMILY: "परिवार", GRAH_DOSH: "ग्रह दोष",
  SPIRITUAL: "आध्यात्मिक", PROPERTY: "संपत्ति", BUSINESS: "व्यवसाय",
};

export default function HawanPage() {
  const [hawans, setHawans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const savedProgress = useMemo(() => listLocalHawanProgress().find((item) => !item.completedAt && item.slug), []);

  const loadHawans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/hawans", { params: { page: 1, limit: 50 } });
      setHawans(response.data?.data || []);
    } catch (requestError) {
      setError(requestError.message || "हवन मार्गदर्शिकाएँ लोड नहीं हो सकीं।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHawans(); }, [loadHawans]);

  const categories = useMemo(() => [...new Set(hawans.map((item) => item.category).filter(Boolean))], [hawans]);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("hi");
    return hawans.filter((item) => {
      const categoryMatch = category === "ALL" || item.category === category;
      const haystack = [item.title, item.shortDescription, ...(item.purposes || [])].join(" ").toLocaleLowerCase("hi");
      return categoryMatch && (!term || haystack.includes(term));
    });
  }, [hawans, search, category]);

  return <div className="hg-page">
    <header className="hg-hero">
      <div className="hg-shell hg-hero__inner">
        <p className="hg-eyebrow">स्रोत-संदर्भित हवन मार्गदर्शन</p>
        <h2>अपने संकल्प से<br />सही हवन तक।</h2>
        <p className="hg-hero__copy">प्रकाशित मार्गदर्शिकाओं में उद्देश्य, आवश्यक सामग्री, सुरक्षा निर्देश और क्रमबद्ध चरण एक ही स्थान पर देखें।</p>
        <div className="hg-actions">
          <a className="hg-button hg-button--primary" href="#hawan-library">हवन चुनें</a>
          {savedProgress ? <Link className="hg-button hg-button--outline" to={`/hawan-guide/${savedProgress.slug}`}>अधूरा हवन जारी रखें</Link> : null}
        </div>
        <ul className="hg-trust" aria-label="मार्गदर्शिका की विशेषताएँ">
          <li>प्रकाशित मार्गदर्शिकाएँ</li><li>आवश्यक अग्नि-सुरक्षा</li><li>आपकी प्रगति सुरक्षित</li>
        </ul>
      </div>
    </header>

    <main id="hawan-library" className="hg-shell hg-library">
      <div className="hg-section-heading">
        <div><p className="hg-eyebrow">हवन संग्रह</p><h2>अपना संकल्प चुनें</h2></div>
        <p>यहाँ केवल प्रकाशित और सत्यापित मार्गदर्शिकाएँ दिखाई जाती हैं।</p>
      </div>

      <div className="hg-filters" aria-label="हवन खोज और श्रेणी">
        <label><span>हवन खोजें</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="नाम या उद्देश्य लिखें" /></label>
        <label><span>श्रेणी</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="ALL">सभी श्रेणियाँ</option>{categories.map((item) => <option key={item} value={item}>{categoryLabels[item] || item}</option>)}</select></label>
      </div>

      {loading ? <div className="hg-state" role="status"><strong>हवन मार्गदर्शिकाएँ लोड हो रही हैं…</strong><span>कृपया थोड़ी देर प्रतीक्षा करें।</span></div> : null}
      {!loading && error ? <div className="hg-state hg-state--error" role="alert"><strong>मार्गदर्शिकाएँ नहीं खुल सकीं</strong><span>{error}</span><button type="button" onClick={loadHawans}>फिर प्रयास करें</button></div> : null}
      {!loading && !error && filtered.length === 0 ? <div className="hg-state"><strong>इस चयन के लिए कोई प्रकाशित हवन मार्गदर्शिका उपलब्ध नहीं है।</strong><span>दूसरी श्रेणी या खोज शब्द आज़माएँ।</span></div> : null}
      {!loading && !error && filtered.length > 0 ? <div className="hg-card-grid">{filtered.map((hawan) => <HawanCard key={hawan._id} hawan={hawan} />)}</div> : null}
    </main>
  </div>;
}
