export function HawanSourceAttribution({ source, status }) {
  return <section className="hg-panel hg-source">
    <p className="hg-eyebrow">स्रोत और सत्यापन</p><h2>इस मार्गदर्शन का आधार</h2>
    {source ? <dl>
      {source.sourceDocument ? <div><dt>स्रोत दस्तावेज़</dt><dd>{source.sourceDocument}</dd></div> : null}
      {source.sourceSection ? <div><dt>संदर्भ खंड</dt><dd>{source.sourceSection}</dd></div> : null}
      {source.sourcePrintedPage || source.sourcePage ? <div><dt>पृष्ठ</dt><dd>{source.sourcePrintedPage || source.sourcePage}</dd></div> : null}
      {source.tradition ? <div><dt>परंपरा</dt><dd>{source.tradition}</dd></div> : null}
      <div><dt>सत्यापन स्थिति</dt><dd>{status === "VERIFIED" ? "सत्यापित" : "समीक्षा जारी"}</dd></div>
      {source.verifiedAt ? <div><dt>सत्यापन तिथि</dt><dd>{new Date(source.verifiedAt).toLocaleDateString("hi-IN")}</dd></div> : null}
    </dl> : <p>स्रोत का विस्तृत संदर्भ उपलब्ध नहीं है। इसलिए कोई अतिरिक्त धार्मिक दावा या अनुमान प्रदर्शित नहीं किया गया है।</p>}
    <small>यह पारंपरिक मार्गदर्शन है; चिकित्सा, कानूनी या पेशेवर अग्नि-सुरक्षा सलाह का विकल्प नहीं।</small>
  </section>;
}
