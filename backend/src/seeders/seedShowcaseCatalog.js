const crypto = require("crypto");
const mongoose = require("mongoose");
const connectDb = require("../db/connectDb");
const User = require("../models/User");
const PanditProfile = require("../models/PanditProfile");
const Product = require("../models/Product");
const { ROLES } = require("../constants/roles");

// This seeder deliberately creates only public-facing catalogue records. It never
// creates customer accounts, bookings, orders, chats, wallets, or admin credentials.
const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=542047&color=ffffff&size=256&bold=true`;

const showcasePandits = [
  {
    user: { name: "Pt. Raghav Shastri", email: "raghav.shastri@showcase.digipandit.demo", phone: "9876502001", city: "Delhi", state: "Delhi" },
    profile: {
      bio: "Vedic karmkand specialist for griha pravesh, Satyanarayan katha, and family ceremonies.",
      experienceInYears: 14,
      specialization: ["Griha Pravesh", "Satyanarayan Katha", "Kundli Guidance"],
      languages: ["Hindi", "English", "Sanskrit"],
      serviceCities: ["Delhi", "Noida", "Gurugram"],
      ratingAverage: 4.9,
      totalReviews: 128,
      services: [
        { name: "Griha Pravesh Puja", category: "PUJA", serviceType: "PUJA", description: "Home-entry puja with samagri guidance.", durationInMinutes: 150, price: 5100 },
        { name: "Personal Astrology Chat", category: "ASTROLOGY_CHAT", serviceType: "CONSULTATION", description: "Kundli, career, marriage and finance consultation.", durationInMinutes: 30, price: 799 },
      ],
    },
  },
  {
    user: { name: "Acharya Devendra Mishra", email: "devendra.mishra@showcase.digipandit.demo", phone: "9876502002", city: "Lucknow", state: "Uttar Pradesh" },
    profile: {
      bio: "Traditional puja acharya for vivah sanskar, mundan, naamkaran, and family ceremonies.",
      experienceInYears: 18,
      specialization: ["Vivah Sanskar", "Mundan", "Naamkaran"],
      languages: ["Hindi", "Awadhi"],
      serviceCities: ["Lucknow", "Kanpur"],
      ratingAverage: 4.8,
      totalReviews: 96,
      services: [
        { name: "Wedding Ceremony Puja", category: "PUJA", serviceType: "PUJA", description: "Wedding ritual support for complete family events.", durationInMinutes: 240, price: 11000 },
        { name: "Naamkaran Puja", category: "PUJA", serviceType: "PUJA", description: "Traditional naming ceremony with family participation.", durationInMinutes: 90, price: 3500 },
      ],
    },
  },
  {
    user: { name: "Astrologer Neha Joshi", email: "neha.joshi@showcase.digipandit.demo", phone: "9876502003", city: "Jaipur", state: "Rajasthan" },
    profile: {
      bio: "Vedic astrology consultant for kundli matching, relationship guidance, and practical remedies.",
      experienceInYears: 11,
      specialization: ["Kundli Matching", "Relationship Guidance", "Remedies"],
      languages: ["Hindi", "English"],
      serviceCities: ["Jaipur", "Remote"],
      ratingAverage: 4.9,
      totalReviews: 174,
      services: [
        { name: "Astrology Chat Session", category: "ASTROLOGY_CHAT", serviceType: "CONSULTATION", description: "Text consultation for family and marriage compatibility.", durationInMinutes: 25, price: 699 },
        { name: "Astrology Call Consultation", category: "ASTROLOGY_CALL", serviceType: "CONSULTATION", description: "Voice consultation with actionable guidance.", durationInMinutes: 40, price: 1299 },
      ],
    },
  },
  {
    user: { name: "Pt. Omkar Tripathi", email: "omkar.tripathi@showcase.digipandit.demo", phone: "9876502004", city: "Varanasi", state: "Uttar Pradesh" },
    profile: {
      bio: "Varanasi-based pandit for Rudrabhishek, Maha Mrityunjaya Jaap, and temple-tradition ceremonies.",
      experienceInYears: 22,
      specialization: ["Rudrabhishek", "Maha Mrityunjaya Jaap", "Temple Rituals"],
      languages: ["Hindi", "Sanskrit", "Bhojpuri"],
      serviceCities: ["Varanasi", "Prayagraj"],
      ratingAverage: 4.7,
      totalReviews: 88,
      services: [{ name: "Rudrabhishek Puja", category: "PUJA", serviceType: "PUJA", description: "Detailed Shiva puja for spiritual observance.", durationInMinutes: 180, price: 6500 }],
    },
  },
  {
    user: { name: "Dr. Kavya Bhardwaj", email: "kavya.bhardwaj@showcase.digipandit.demo", phone: "9876502005", city: "Mumbai", state: "Maharashtra" },
    profile: {
      bio: "Vedic astrologer focused on career planning, business timing, and structured consultations.",
      experienceInYears: 9,
      specialization: ["Career Astrology", "Business Timing", "Numerology Insights"],
      languages: ["Hindi", "English", "Marathi"],
      serviceCities: ["Mumbai", "Remote"],
      ratingAverage: 4.8,
      totalReviews: 142,
      services: [
        { name: "Career Astrology Chat", category: "ASTROLOGY_CHAT", serviceType: "CONSULTATION", description: "Consultation for job, business, and timing questions.", durationInMinutes: 30, price: 899 },
        { name: "Numerology Call Consultation", category: "ASTROLOGY_CALL", serviceType: "CONSULTATION", description: "Call session for life-path and compatibility guidance.", durationInMinutes: 35, price: 1499 },
      ],
    },
  },
  {
    user: { name: "Pt. Suresh Kulkarni", email: "suresh.kulkarni@showcase.digipandit.demo", phone: "9876502006", city: "Pune", state: "Maharashtra" },
    profile: {
      bio: "Spiritual guide for vastu puja, Ganesh sthapana, and family-friendly consultation support.",
      experienceInYears: 13,
      specialization: ["Ganesh Puja", "Vastu Shanti", "Family Guidance"],
      languages: ["Hindi", "Marathi", "English"],
      serviceCities: ["Pune", "Mumbai"],
      ratingAverage: 4.8,
      totalReviews: 109,
      services: [
        { name: "Ganesh Sthapana Puja", category: "PUJA", serviceType: "PUJA", description: "Festival-ready Ganesh sthapana guidance.", durationInMinutes: 120, price: 4200 },
        { name: "Family Astrology Call", category: "ASTROLOGY_CALL", serviceType: "CONSULTATION", description: "Joint family call for planning and guidance.", durationInMinutes: 45, price: 1599 },
      ],
    },
  },
];

const products = [
  ["Complete Satyanarayan Puja Kit", "complete-satyanarayan-puja-kit", "PUJA_KIT", "Curated essentials for a family Satyanarayan puja.", 1499, 1799, 34, ["satyanarayan", "family", "festival"], 4.7],
  ["Navgraha Puja Samagri Box", "navgraha-puja-samagri-box", "PUJA_KIT", "Ready-to-use samagri box for Navgraha observance.", 2199, 2599, 18, ["navgraha", "shanti", "samagri"], 4.8],
  ["Rudrabhishek Samagri Kit", "rudrabhishek-samagri-kit", "PUJA_KIT", "Selected puja essentials for Shiva observance.", 1699, 1999, 26, ["shiva", "rudrabhishek", "puja"], 4.8],
  ["Brass Ganesha Idol", "brass-ganesha-idol", "IDOL", "Hand-finished brass idol for a home mandir.", 1899, 2299, 22, ["ganesha", "brass", "home temple"], 4.8],
  ["Marble Shiva Lingam Idol", "marble-shiva-lingam-idol", "IDOL", "Temple-finish marble lingam for home worship.", 1299, 1599, 16, ["shiva", "marble", "abhishek"], 4.7],
  ["Brass Diya Set of 2", "brass-diya-set-of-2", "IDOL", "Compact brass diyas for daily aarti and festive décor.", 549, 649, 40, ["diya", "brass", "aarti"], 4.6],
  ["Premium Sandal Incense Sticks", "premium-sandal-incense-sticks", "INCENSE", "Long-lasting sandal fragrance for daily puja.", 249, 299, 100, ["incense", "daily puja", "sandal"], 4.6],
  ["Dhoop Cone Devotional Pack", "dhoop-cone-devotional-pack", "INCENSE", "Mixed fragrance dhoop cones for evening prayer.", 199, 249, 80, ["dhoop", "fragrance", "meditation"], 4.5],
  ["Bhagavad Gita Pocket Edition", "bhagavad-gita-pocket-edition", "BOOK", "Compact Hindi-English edition for daily reading.", 399, 499, 50, ["gita", "book", "devotional"], 4.9],
  ["Hanuman Chalisa Hardbound", "hanuman-chalisa-hardbound", "BOOK", "Hardbound devotional edition with aarti sections.", 299, 349, 60, ["hanuman", "chalisa", "prayer"], 4.8],
].map(([name, slug, category, description, price, compareAtPrice, stock, tags, averageRating]) => ({
  name, slug, category, description, price, compareAtPrice, stock, tags, averageRating,
  images: [{ url: `https://placehold.co/720x720/f8f1e8/542047?text=${encodeURIComponent(name)}`, publicId: null }],
  isActive: true,
}));

async function upsertPandit(item) {
  let user = await User.findOne({ email: item.user.email });
  if (!user) {
    user = new User({ ...item.user, password: crypto.randomBytes(32).toString("base64url"), role: ROLES.PANDIT, emailVerified: true });
  } else {
    Object.assign(user, { ...item.user, role: ROLES.PANDIT, emailVerified: true });
  }
  user.avatar = { url: avatar(item.user.name), publicId: null };
  await user.save();

  await PanditProfile.findOneAndUpdate(
    { user: user._id },
    { $set: { ...item.profile, user: user._id, profileCompleted: true, approvalStatus: "APPROVED", approvalNotes: "Showcase catalogue record", image: { url: avatar(item.user.name), publicId: null } } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function run() {
  await connectDb();
  await Promise.all(showcasePandits.map(upsertPandit));
  await Promise.all(products.map((product) => Product.findOneAndUpdate({ slug: product.slug }, { $set: product }, { new: true, upsert: true, setDefaultsOnInsert: true })));
  console.log(`Showcase catalogue ready: ${showcasePandits.length} pandits, ${products.length} products.`);
}

run()
  .catch((error) => { console.error("Showcase catalogue seed failed:", error); process.exitCode = 1; })
  .finally(async () => { await mongoose.connection.close(); });
