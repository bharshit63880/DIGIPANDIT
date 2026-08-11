const assert = require("node:assert/strict");
const Hawan = require("../models/Hawan");
const { guides } = require("../seeders/seedHawans");

assert.equal(guides.length, 2, "दो हवन मार्गदर्शिकाएँ अपेक्षित हैं");
assert.equal(new Set(guides.map((guide) => guide.slug)).size, guides.length, "सभी स्लग अलग होने चाहिए");

for (const guide of guides) {
  assert.equal(guide.isPublished, true, `${guide.slug} प्रकाशित होना चाहिए`);
  assert.equal(guide.verificationStatus, "VERIFIED", `${guide.slug} सत्यापित होना चाहिए`);
  assert.equal(guide.guideMode, "FULL", `${guide.slug} पूर्ण मार्गदर्शिका होनी चाहिए`);
  assert.ok(guide.materials.length >= 6, `${guide.slug} में पर्याप्त सामग्री होनी चाहिए`);
  assert.ok(guide.steps.length >= 6, `${guide.slug} में पर्याप्त चरण होने चाहिए`);
  assert.deepEqual(guide.mantras, [], "अनुमानित मंत्र-पाठ seed नहीं होना चाहिए");

  const records = [guide, ...guide.materials, ...guide.steps, ...(guide.purposeOfferings || [])];
  for (const record of records) {
    assert.equal(record.verificationStatus, "VERIFIED", `${guide.slug} में असत्यापित रिकॉर्ड मिला`);
    assert.ok(record.source?.sourceDocument, `${guide.slug} में स्रोत दस्तावेज़ गायब है`);
    assert.ok(record.source?.sourceSection, `${guide.slug} में स्रोत अनुभाग गायब है`);
    assert.ok(record.source.sourcePage >= 1 && record.source.sourcePage <= 68, `${guide.slug} में अमान्य PDF पृष्ठ है`);
  }

  const validationError = new Hawan(guide).validateSync();
  assert.equal(validationError, undefined, validationError?.message);
}

console.log("दोनों हवन seed मार्गदर्शिकाओं की संरचना और स्रोत-सत्यापन सफल रहा।");
