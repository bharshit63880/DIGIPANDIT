const connectDb = require("../db/connectDb");
const Hawan = require("../models/Hawan");

const sourceIsValid = (record) => record?.verificationStatus === "VERIFIED" && record.source?.sourceDocument && record.source?.sourceSection && Number.isInteger(record.source?.sourcePage);

async function verify() {
  await connectDb();
  const guides = await Hawan.find({ isPublished: true }).lean();
  const errors = [];
  guides.forEach((guide) => {
    const records = [guide, ...(guide.materials || []), ...(guide.steps || []), ...(guide.mantras || []), ...(guide.purposeOfferings || [])];
    records.forEach((record, index) => { if (!sourceIsValid(record)) errors.push(`${guide.slug}: record ${index} lacks verified source metadata`); });
    (guide.materials || []).forEach((material) => { if (material.product && material.productMappingStatus !== "VERIFIED") errors.push(`${guide.slug}: ${material.name} has an unverified product mapping`); });
  });
  if (errors.length) throw new Error(`Hawan source integrity failed:\n${errors.join("\n")}`);
  console.log(`Hawan source integrity passed for ${guides.length} published guide(s).`);
}

verify().then(() => process.exit(0)).catch((error) => { console.error(error.message); process.exit(1); });
