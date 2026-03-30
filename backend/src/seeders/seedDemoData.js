const env = require("../config/env");
const connectDb = require("../db/connectDb");
const User = require("../models/User");
const PanditProfile = require("../models/PanditProfile");
const Product = require("../models/Product");
const Booking = require("../models/Booking");
const StoreOrder = require("../models/StoreOrder");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const { ROLES } = require("../constants/roles");

const DEMO_PASSWORD = "Demo@12345";

const makeAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7a2e1d&color=ffffff&size=256`;

const address = ({ city, state, line1, pincode, landmark }) => ({
  label: "Home",
  line1,
  city,
  state,
  pincode,
  landmark,
  isDefault: true,
});

const demoUsers = [
  {
    name: "Aarav Sharma",
    email: "aarav.user@digipandit.demo",
    phone: "9876501001",
    gender: "Male",
    city: "Delhi",
    state: "Delhi",
    addresses: [address({ city: "Delhi", state: "Delhi", line1: "B-24 Rohini Sector 9", pincode: "110085", landmark: "Near Metro Gate 2" })],
  },
  {
    name: "Priya Verma",
    email: "priya.user@digipandit.demo",
    phone: "9876501002",
    gender: "Female",
    city: "Noida",
    state: "Uttar Pradesh",
    addresses: [address({ city: "Noida", state: "Uttar Pradesh", line1: "Tower 7, Sector 137", pincode: "201305", landmark: "Opposite Expressway" })],
  },
  {
    name: "Rohan Mehta",
    email: "rohan.user@digipandit.demo",
    phone: "9876501003",
    gender: "Male",
    city: "Mumbai",
    state: "Maharashtra",
    addresses: [address({ city: "Mumbai", state: "Maharashtra", line1: "Flat 1204, Powai Heights", pincode: "400076", landmark: "Near Hiranandani Gate" })],
  },
];

const demoPandits = [
  {
    user: {
      name: "Pt. Raghav Shastri",
      email: "raghav.pandit@digipandit.demo",
      phone: "9876502001",
      city: "Delhi",
      state: "Delhi",
    },
    profile: {
      bio: "Vedic karmkand specialist with deep experience in griha pravesh, satyanarayan katha, and online astrology consultations for modern families.",
      experienceInYears: 14,
      specialization: ["Griha Pravesh", "Satyanarayan Katha", "Kundli Guidance"],
      languages: ["Hindi", "English", "Sanskrit"],
      serviceCities: ["Delhi", "Noida", "Gurugram"],
      approvalStatus: "APPROVED",
      approvalNotes: "Verified documents and sample consultations reviewed.",
      ratingAverage: 4.9,
      totalReviews: 128,
      services: [
        {
          name: "Griha Pravesh Puja",
          category: "PUJA",
          description: "Complete vastu-aligned home entry puja with samagri guidance.",
          durationInMinutes: 150,
          price: 5100,
        },
        {
          name: "Personal Astrology Chat",
          category: "ASTROLOGY_CHAT",
          description: "30-minute chat consultation for kundli, career, marriage, and finances.",
          durationInMinutes: 30,
          price: 799,
        },
      ],
      availability: [
        { day: "MON", startTime: "08:00", endTime: "20:00" },
        { day: "WED", startTime: "08:00", endTime: "20:00" },
        { day: "SAT", startTime: "07:00", endTime: "18:00" },
      ],
    },
  },
  {
    user: {
      name: "Acharya Devendra Mishra",
      email: "devendra.pandit@digipandit.demo",
      phone: "9876502002",
      city: "Lucknow",
      state: "Uttar Pradesh",
    },
    profile: {
      bio: "Traditional puja acharya known for marriage rituals, mundan sanskar, and family ceremonies performed with clear step-by-step guidance.",
      experienceInYears: 18,
      specialization: ["Vivah Sanskar", "Mundan", "Naamkaran"],
      languages: ["Hindi", "Awadhi"],
      serviceCities: ["Lucknow", "Kanpur"],
      approvalStatus: "APPROVED",
      approvalNotes: "Strong regional demand and verified local references.",
      ratingAverage: 4.8,
      totalReviews: 96,
      services: [
        {
          name: "Wedding Ceremony Puja",
          category: "PUJA",
          description: "Wedding rituals and sanskar ceremony support for complete events.",
          durationInMinutes: 240,
          price: 11000,
        },
        {
          name: "Naamkaran Puja",
          category: "PUJA",
          description: "Traditional naming ceremony with sankalp and family participation.",
          durationInMinutes: 90,
          price: 3500,
        },
      ],
      availability: [
        { day: "TUE", startTime: "09:00", endTime: "18:00" },
        { day: "THU", startTime: "09:00", endTime: "18:00" },
        { day: "SUN", startTime: "08:00", endTime: "16:00" },
      ],
    },
  },
  {
    user: {
      name: "Astrologer Neha Joshi",
      email: "neha.astrologer@digipandit.demo",
      phone: "9876502003",
      city: "Jaipur",
      state: "Rajasthan",
    },
    profile: {
      bio: "Professional astrologer focused on kundli matching, relationship guidance, and practical remedies with a warm consultative style.",
      experienceInYears: 11,
      specialization: ["Kundli Matching", "Relationship Guidance", "Remedies"],
      languages: ["Hindi", "English"],
      serviceCities: ["Jaipur", "Remote"],
      approvalStatus: "APPROVED",
      approvalNotes: "Excellent consultation quality and online session handling.",
      ratingAverage: 4.9,
      totalReviews: 174,
      services: [
        {
          name: "Astrology Chat Session",
          category: "ASTROLOGY_CHAT",
          description: "Text-based consultation for relationship, family, and marriage compatibility.",
          durationInMinutes: 25,
          price: 699,
        },
        {
          name: "Astrology Call Consultation",
          category: "ASTROLOGY_CALL",
          description: "Voice consultation with actionable guidance and follow-up remedies.",
          durationInMinutes: 40,
          price: 1299,
        },
      ],
      availability: [
        { day: "MON", startTime: "10:00", endTime: "22:00" },
        { day: "FRI", startTime: "10:00", endTime: "22:00" },
        { day: "SAT", startTime: "10:00", endTime: "22:00" },
      ],
    },
  },
  {
    user: {
      name: "Pt. Omkar Tripathi",
      email: "omkar.pandit@digipandit.demo",
      phone: "9876502004",
      city: "Varanasi",
      state: "Uttar Pradesh",
    },
    profile: {
      bio: "Banaras-based scholar pandit for rudrabhishek, mahamrityunjaya jaap, and temple tradition inspired ceremonies.",
      experienceInYears: 22,
      specialization: ["Rudrabhishek", "Mahamrityunjaya Jaap", "Temple Rituals"],
      languages: ["Hindi", "Sanskrit", "Bhojpuri"],
      serviceCities: ["Varanasi", "Prayagraj"],
      approvalStatus: "APPROVED",
      approvalNotes: "Highly trusted ceremonial expert.",
      ratingAverage: 4.7,
      totalReviews: 88,
      services: [
        {
          name: "Rudrabhishek Puja",
          category: "PUJA",
          description: "Detailed Shiva puja for peace, health, and spiritual upliftment.",
          durationInMinutes: 180,
          price: 6500,
        },
      ],
      availability: [
        { day: "SUN", startTime: "06:00", endTime: "14:00" },
        { day: "MON", startTime: "06:00", endTime: "14:00" },
      ],
    },
  },
  {
    user: {
      name: "Dr. Kavya Bhardwaj",
      email: "kavya.astrologer@digipandit.demo",
      phone: "9876502005",
      city: "Mumbai",
      state: "Maharashtra",
    },
    profile: {
      bio: "Modern Vedic astrologer helping professionals with career shifts, business timing, and personal growth through structured consultations.",
      experienceInYears: 9,
      specialization: ["Career Astrology", "Business Timing", "Numerology Insights"],
      languages: ["English", "Hindi", "Marathi"],
      serviceCities: ["Mumbai", "Remote"],
      approvalStatus: "APPROVED",
      approvalNotes: "Strong online consultation demand.",
      ratingAverage: 4.8,
      totalReviews: 142,
      services: [
        {
          name: "Career Astrology Chat",
          category: "ASTROLOGY_CHAT",
          description: "Text consultation for job, business, and timing questions.",
          durationInMinutes: 30,
          price: 899,
        },
        {
          name: "Numerology Call Consultation",
          category: "ASTROLOGY_CALL",
          description: "Call session focused on life path, compatibility, and number-driven guidance.",
          durationInMinutes: 35,
          price: 1499,
        },
      ],
      availability: [
        { day: "TUE", startTime: "11:00", endTime: "20:00" },
        { day: "THU", startTime: "11:00", endTime: "20:00" },
        { day: "SAT", startTime: "11:00", endTime: "18:00" },
      ],
    },
  },
  {
    user: {
      name: "Pt. Suresh Kulkarni",
      email: "suresh.pandit@digipandit.demo",
      phone: "9876502006",
      city: "Pune",
      state: "Maharashtra",
    },
    profile: {
      bio: "Balanced spiritual guide for vastu puja, ganesh sthapana, and astrology follow-up consultations with family-friendly explanations.",
      experienceInYears: 13,
      specialization: ["Ganesh Puja", "Vastu Shanti", "Family Guidance"],
      languages: ["Hindi", "Marathi", "English"],
      serviceCities: ["Pune", "Mumbai"],
      approvalStatus: "APPROVED",
      approvalNotes: "Good hybrid puja plus astrology profile.",
      ratingAverage: 4.8,
      totalReviews: 109,
      services: [
        {
          name: "Ganesh Sthapana Puja",
          category: "PUJA",
          description: "Festival-ready Ganesh sthapana and visarjan ritual guidance.",
          durationInMinutes: 120,
          price: 4200,
        },
        {
          name: "Family Astrology Call",
          category: "ASTROLOGY_CALL",
          description: "Joint family call session for remedies, planning, and guidance.",
          durationInMinutes: 45,
          price: 1599,
        },
      ],
      availability: [
        { day: "WED", startTime: "09:00", endTime: "19:00" },
        { day: "FRI", startTime: "09:00", endTime: "19:00" },
        { day: "SUN", startTime: "09:00", endTime: "15:00" },
      ],
    },
  },
];

const demoProducts = [
  {
    name: "Complete Satyanarayan Puja Kit",
    slug: "complete-satyanarayan-puja-kit",
    category: "PUJA_KIT",
    description: "Curated kit with kalash, roli, chawal, camphor, agarbatti, cotton wicks, and puja essentials.",
    price: 1499,
    compareAtPrice: 1799,
    stock: 34,
    tags: ["satyanarayan", "family", "festival"],
    averageRating: 4.7,
  },
  {
    name: "Brass Ganesha Idol",
    slug: "brass-ganesha-idol",
    category: "IDOL",
    description: "Hand-finished brass idol for home temple placement and festive rituals.",
    price: 1899,
    compareAtPrice: 2299,
    stock: 22,
    tags: ["ganesha", "brass", "home temple"],
    averageRating: 4.8,
  },
  {
    name: "Premium Sandal Incense Sticks",
    slug: "premium-sandal-incense-sticks",
    category: "INCENSE",
    description: "Long-lasting incense sticks with calming sandal fragrance for daily puja.",
    price: 249,
    compareAtPrice: 299,
    stock: 100,
    tags: ["incense", "daily puja", "sandal"],
    averageRating: 4.6,
  },
  {
    name: "Bhagavad Gita Pocket Edition",
    slug: "bhagavad-gita-pocket-edition",
    category: "BOOK",
    description: "Compact Hindi-English edition for daily reading and gifting.",
    price: 399,
    compareAtPrice: 499,
    stock: 50,
    tags: ["gita", "book", "devotional"],
    averageRating: 4.9,
  },
  {
    name: "Navgraha Puja Samagri Box",
    slug: "navgraha-puja-samagri-box",
    category: "PUJA_KIT",
    description: "Ready-to-use box for navgraha shanti rituals and graha dosh remedies.",
    price: 2199,
    compareAtPrice: 2599,
    stock: 18,
    tags: ["navgraha", "remedies", "shanti"],
    averageRating: 4.8,
  },
  {
    name: "Marble Shiva Lingam Idol",
    slug: "marble-shiva-lingam-idol",
    category: "IDOL",
    description: "Temple-finish marble Shiva Lingam for Shivratri and daily abhishek rituals.",
    price: 1299,
    compareAtPrice: 1599,
    stock: 16,
    tags: ["shiva", "marble", "abhishek"],
    averageRating: 4.7,
  },
  {
    name: "Dhoop Cone Devotional Pack",
    slug: "dhoop-cone-devotional-pack",
    category: "INCENSE",
    description: "Mixed fragrance dhoop cones suited for evening prayer and meditation spaces.",
    price: 199,
    compareAtPrice: 249,
    stock: 80,
    tags: ["dhoop", "fragrance", "meditation"],
    averageRating: 4.5,
  },
  {
    name: "Hanuman Chalisa Hardbound",
    slug: "hanuman-chalisa-hardbound",
    category: "BOOK",
    description: "Hardbound devotional edition with aarti and sankat mochan prayers included.",
    price: 299,
    compareAtPrice: 349,
    stock: 60,
    tags: ["hanuman", "chalisa", "prayer"],
    averageRating: 4.8,
  },
];

const buildImage = (label, bg = "f8f1e8", color = "7a2e1d") => ({
  url: `https://via.placeholder.com/1200x900/${bg}/${color}?text=${encodeURIComponent(label)}`,
  publicId: null,
});

const ensureAdmin = async () => {
  const existing = await User.findOne({ email: env.adminEmail });
  if (existing) {
    existing.name = env.adminName;
    existing.password = env.adminPassword;
    existing.role = ROLES.ADMIN;
    existing.emailVerified = true;
    existing.isActive = true;
    existing.avatar = { url: makeAvatar(env.adminName), publicId: null };
    await existing.save();
    return existing;
  }

  return User.create({
    name: env.adminName,
    email: env.adminEmail,
    password: env.adminPassword,
    role: ROLES.ADMIN,
    emailVerified: true,
    isActive: true,
    avatar: { url: makeAvatar(env.adminName), publicId: null },
  });
};

const cleanupExistingDemoData = async () => {
  const demoEmails = [...demoUsers.map((item) => item.email), ...demoPandits.map((item) => item.user.email)];
  const users = await User.find({ email: { $in: demoEmails } }).select("_id");
  const userIds = users.map((item) => item._id);

  const profiles = await PanditProfile.find({ user: { $in: userIds } }).select("_id");
  const profileIds = profiles.map((item) => item._id);

  const bookings = await Booking.find({
    $or: [{ user: { $in: userIds } }, { pandit: { $in: userIds } }, { panditProfile: { $in: profileIds } }],
  }).select("_id");
  const bookingIds = bookings.map((item) => item._id);

  const chatRooms = await ChatRoom.find({
    $or: [{ participants: { $in: userIds } }, { booking: { $in: bookingIds } }],
  }).select("_id");
  const roomIds = chatRooms.map((item) => item._id);

  await Message.deleteMany({ room: { $in: roomIds } });
  await ChatRoom.deleteMany({ _id: { $in: roomIds } });
  await Booking.deleteMany({ _id: { $in: bookingIds } });
  await StoreOrder.deleteMany({ user: { $in: userIds } });
  await WithdrawalRequest.deleteMany({ pandit: { $in: userIds } });
  await PanditProfile.deleteMany({ _id: { $in: profileIds } });
};

const upsertUser = async (payload) => {
  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = new User(payload);
  } else {
    user.name = payload.name;
    user.email = payload.email;
    user.phone = payload.phone;
    user.password = payload.password;
    user.role = payload.role;
    user.avatar = payload.avatar;
    user.gender = payload.gender;
    user.city = payload.city;
    user.state = payload.state;
    user.addresses = payload.addresses;
    user.emailVerified = payload.emailVerified;
    user.isActive = payload.isActive;
    user.dateOfBirth = payload.dateOfBirth || user.dateOfBirth;
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpiresAt = null;
    user.forgotPasswordOtp = null;
    user.forgotPasswordOtpExpiresAt = null;
  }

  await user.save();
  return user;
};

const createUsers = async () => {
  const createdUsers = [];
  for (const item of demoUsers) {
    createdUsers.push(
      await upsertUser({
        ...item,
        password: DEMO_PASSWORD,
        role: ROLES.USER,
        emailVerified: true,
        isActive: true,
        avatar: { url: makeAvatar(item.name), publicId: null },
      })
    );
  }

  const createdPanditUsers = [];
  for (const item of demoPandits) {
    createdPanditUsers.push(
      await upsertUser({
        ...item.user,
        password: DEMO_PASSWORD,
        role: ROLES.PANDIT,
        emailVerified: true,
        isActive: true,
        avatar: { url: makeAvatar(item.user.name), publicId: null },
        addresses: [
          address({
            city: item.user.city,
            state: item.user.state,
            line1: `${item.user.city} Spiritual Center`,
            pincode: "110001",
            landmark: "Near Main Temple Road",
          }),
        ],
      })
    );
  }

  return { users: createdUsers, panditUsers: createdPanditUsers };
};

const createPanditProfiles = async (panditUsers) => {
  const userByEmail = Object.fromEntries(panditUsers.map((item) => [item.email, item]));

  const profiles = await Promise.all(
    demoPandits.map((item) =>
      PanditProfile.create({
        ...item.profile,
        profileCompleted: true,
        user: userByEmail[item.user.email]._id,
        image: {
          url: makeAvatar(item.user.name),
          publicId: null,
        },
      })
    )
  );

  return profiles;
};

const createProducts = async () => {
  const products = [];

  for (const item of demoProducts) {
    let product = await Product.findOne({ slug: item.slug });

    if (!product) {
      product = new Product({
        ...item,
        images: [buildImage(item.name)],
        isActive: true,
      });
    } else {
      product.name = item.name;
      product.category = item.category;
      product.description = item.description;
      product.price = item.price;
      product.compareAtPrice = item.compareAtPrice;
      product.stock = item.stock;
      product.tags = item.tags;
      product.averageRating = item.averageRating;
      product.images = [buildImage(item.name)];
      product.isActive = true;
    }

    await product.save();
    products.push(product);
  }

  return products;
};

const findService = (profile, serviceName) => profile.services.find((item) => item.name === serviceName);

const createBookings = async ({ users, panditUsers, profiles }) => {
  const userMap = Object.fromEntries(users.map((item) => [item.email, item]));
  const panditMap = Object.fromEntries(panditUsers.map((item) => [item.email, item]));
  const profileMap = Object.fromEntries(profiles.map((item) => [item.user.toString(), item]));

  const raghavProfile = profiles.find((item) => panditMap["raghav.pandit@digipandit.demo"]._id.equals(item.user));
  const nehaProfile = profiles.find((item) => panditMap["neha.astrologer@digipandit.demo"]._id.equals(item.user));
  const devendraProfile = profiles.find((item) => panditMap["devendra.pandit@digipandit.demo"]._id.equals(item.user));
  const kavyaProfile = profiles.find((item) => panditMap["kavya.astrologer@digipandit.demo"]._id.equals(item.user));
  const sureshProfile = profiles.find((item) => panditMap["suresh.pandit@digipandit.demo"]._id.equals(item.user));

  const bookingPayloads = [
    {
      bookingType: "PUJA",
      status: "COMPLETED",
      user: userMap["aarav.user@digipandit.demo"]._id,
      pandit: panditMap["raghav.pandit@digipandit.demo"]._id,
      panditProfile: raghavProfile._id,
      service: findService(raghavProfile, "Griha Pravesh Puja"),
      scheduleAt: new Date("2026-03-15T10:00:00.000Z"),
      durationInMinutes: 150,
      notes: "New apartment griha pravesh with family members.",
      meetingMode: "OFFLINE",
      address: userMap["aarav.user@digipandit.demo"].addresses[0],
      payment: {
        status: "PAID",
        gatewayOrderId: "demo_booking_order_1",
        gatewayPaymentId: "demo_payment_1",
        amount: 5100,
        paidAt: new Date("2026-03-13T12:30:00.000Z"),
      },
    },
    {
      bookingType: "ASTROLOGY_CHAT",
      status: "ACCEPTED",
      user: userMap["priya.user@digipandit.demo"]._id,
      pandit: panditMap["neha.astrologer@digipandit.demo"]._id,
      panditProfile: nehaProfile._id,
      service: findService(nehaProfile, "Astrology Chat Session"),
      scheduleAt: new Date("2026-04-02T15:30:00.000Z"),
      durationInMinutes: 25,
      notes: "Marriage compatibility and timing guidance.",
      meetingMode: "ONLINE",
      address: userMap["priya.user@digipandit.demo"].addresses[0],
      payment: {
        status: "PAID",
        gatewayOrderId: "demo_booking_order_2",
        gatewayPaymentId: "demo_payment_2",
        amount: 699,
        paidAt: new Date("2026-03-29T10:00:00.000Z"),
      },
    },
    {
      bookingType: "PUJA",
      status: "PENDING",
      user: userMap["rohan.user@digipandit.demo"]._id,
      pandit: panditMap["devendra.pandit@digipandit.demo"]._id,
      panditProfile: devendraProfile._id,
      service: findService(devendraProfile, "Naamkaran Puja"),
      scheduleAt: new Date("2026-04-06T07:00:00.000Z"),
      durationInMinutes: 90,
      notes: "Baby naming ceremony at home.",
      meetingMode: "OFFLINE",
      address: userMap["rohan.user@digipandit.demo"].addresses[0],
      payment: {
        status: "CREATED",
        gatewayOrderId: "demo_booking_order_3",
        amount: 3500,
      },
    },
    {
      bookingType: "ASTROLOGY_CALL",
      status: "COMPLETED",
      user: userMap["aarav.user@digipandit.demo"]._id,
      pandit: panditMap["kavya.astrologer@digipandit.demo"]._id,
      panditProfile: kavyaProfile._id,
      service: findService(kavyaProfile, "Numerology Call Consultation"),
      scheduleAt: new Date("2026-03-20T17:00:00.000Z"),
      durationInMinutes: 35,
      notes: "Career and business timing consultation.",
      meetingMode: "ONLINE",
      address: userMap["aarav.user@digipandit.demo"].addresses[0],
      payment: {
        status: "PAID",
        gatewayOrderId: "demo_booking_order_4",
        gatewayPaymentId: "demo_payment_4",
        amount: 1499,
        paidAt: new Date("2026-03-18T11:10:00.000Z"),
      },
    },
    {
      bookingType: "ASTROLOGY_CALL",
      status: "ACCEPTED",
      user: userMap["priya.user@digipandit.demo"]._id,
      pandit: panditMap["suresh.pandit@digipandit.demo"]._id,
      panditProfile: sureshProfile._id,
      service: findService(sureshProfile, "Family Astrology Call"),
      scheduleAt: new Date("2026-04-05T14:00:00.000Z"),
      durationInMinutes: 45,
      notes: "Family planning and health remedies consultation.",
      meetingMode: "ONLINE",
      address: userMap["priya.user@digipandit.demo"].addresses[0],
      payment: {
        status: "PAID",
        gatewayOrderId: "demo_booking_order_5",
        gatewayPaymentId: "demo_payment_5",
        amount: 1599,
        paidAt: new Date("2026-03-28T09:00:00.000Z"),
      },
    },
  ];

  const bookings = await Promise.all(
    bookingPayloads.map((item) =>
      Booking.create({
        bookingType: item.bookingType,
        status: item.status,
        user: item.user,
        pandit: item.pandit,
        panditProfile: item.panditProfile,
        serviceId: item.service._id,
        serviceName: item.service.name,
        servicePrice: item.service.price,
        scheduleAt: item.scheduleAt,
        durationInMinutes: item.durationInMinutes,
        address: item.address,
        notes: item.notes,
        meetingMode: item.meetingMode,
        payment: item.payment,
      })
    )
  );

  for (const profile of profiles) {
    const relatedCompletedBookings = bookings.filter(
      (item) => item.panditProfile.toString() === profile._id.toString() && item.status === "COMPLETED" && item.payment.status === "PAID"
    );

    profile.totalBookings = relatedCompletedBookings.length;
    profile.totalEarnings = relatedCompletedBookings.reduce((sum, item) => sum + item.payment.amount, 0);
    await profile.save();
  }

  return { bookings, userMap, panditMap, profileMap };
};

const createStoreOrders = async ({ users, products }) => {
  const userMap = Object.fromEntries(users.map((item) => [item.email, item]));
  const productMap = Object.fromEntries(products.map((item) => [item.slug, item]));

  const orders = [
    {
      user: userMap["aarav.user@digipandit.demo"]._id,
      items: [
        { product: productMap["complete-satyanarayan-puja-kit"], quantity: 1 },
        { product: productMap["premium-sandal-incense-sticks"], quantity: 2 },
      ],
      shippingAddress: userMap["aarav.user@digipandit.demo"].addresses[0],
      orderStatus: "DELIVERED",
      paymentStatus: "PAID",
    },
    {
      user: userMap["priya.user@digipandit.demo"]._id,
      items: [
        { product: productMap["bhagavad-gita-pocket-edition"], quantity: 1 },
        { product: productMap["brass-ganesha-idol"], quantity: 1 },
      ],
      shippingAddress: userMap["priya.user@digipandit.demo"].addresses[0],
      orderStatus: "PROCESSING",
      paymentStatus: "PAID",
    },
  ];

  return Promise.all(
    orders.map((order, index) => {
      const items = order.items.map(({ product, quantity }) => ({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0]?.url || "",
      }));

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingFee = subtotal > 999 ? 0 : 79;
      const total = subtotal + shippingFee;

      return StoreOrder.create({
        user: order.user,
        items,
        shippingAddress: order.shippingAddress,
        pricing: {
          subtotal,
          shippingFee,
          total,
        },
        orderStatus: order.orderStatus,
        payment: {
          status: order.paymentStatus,
          gatewayOrderId: `demo_store_order_${index + 1}`,
          gatewayPaymentId: `demo_store_payment_${index + 1}`,
          amount: total,
          paidAt: new Date(),
        },
      });
    })
  );
};

const createChats = async ({ bookings, userMap, panditMap }) => {
  const astrologyBooking = bookings.find((item) => item.serviceName === "Astrology Chat Session");
  const familyCallBooking = bookings.find((item) => item.serviceName === "Family Astrology Call");

  const roomOne = await ChatRoom.create({
    booking: astrologyBooking._id,
    participants: [userMap["priya.user@digipandit.demo"]._id, panditMap["neha.astrologer@digipandit.demo"]._id],
    lastMessage: "Kal ke session ke pehle birth details bhej dijiye.",
    lastMessageAt: new Date("2026-03-29T10:15:00.000Z"),
  });

  const roomTwo = await ChatRoom.create({
    booking: familyCallBooking._id,
    participants: [userMap["priya.user@digipandit.demo"]._id, panditMap["suresh.pandit@digipandit.demo"]._id],
    lastMessage: "Family consultation Sunday ko 2 baje confirm hai.",
    lastMessageAt: new Date("2026-03-29T11:20:00.000Z"),
  });

  await Message.insertMany([
    {
      room: roomOne._id,
      sender: userMap["priya.user@digipandit.demo"]._id,
      content: "Namaste ji, mujhe marriage compatibility aur shubh mahurat par guidance chahiye.",
      readBy: [userMap["priya.user@digipandit.demo"]._id, panditMap["neha.astrologer@digipandit.demo"]._id],
      createdAt: new Date("2026-03-29T10:02:00.000Z"),
      updatedAt: new Date("2026-03-29T10:02:00.000Z"),
    },
    {
      room: roomOne._id,
      sender: panditMap["neha.astrologer@digipandit.demo"]._id,
      content: "Bilkul. Aap birth date, time, aur place share kijiye. Main compatibility aur timing dono check kar dungi.",
      readBy: [userMap["priya.user@digipandit.demo"]._id, panditMap["neha.astrologer@digipandit.demo"]._id],
      createdAt: new Date("2026-03-29T10:05:00.000Z"),
      updatedAt: new Date("2026-03-29T10:05:00.000Z"),
    },
    {
      room: roomOne._id,
      sender: panditMap["neha.astrologer@digipandit.demo"]._id,
      content: "Kal ke session ke pehle birth details bhej dijiye.",
      readBy: [panditMap["neha.astrologer@digipandit.demo"]._id],
      createdAt: new Date("2026-03-29T10:15:00.000Z"),
      updatedAt: new Date("2026-03-29T10:15:00.000Z"),
    },
    {
      room: roomTwo._id,
      sender: panditMap["suresh.pandit@digipandit.demo"]._id,
      content: "Family consultation Sunday ko 2 baje confirm hai.",
      readBy: [panditMap["suresh.pandit@digipandit.demo"]._id],
      createdAt: new Date("2026-03-29T11:20:00.000Z"),
      updatedAt: new Date("2026-03-29T11:20:00.000Z"),
    },
  ]);
};

const createWithdrawals = async ({ panditMap }) => {
  await WithdrawalRequest.create({
    pandit: panditMap["raghav.pandit@digipandit.demo"]._id,
    amount: 2500,
    status: "PENDING",
    notes: "Weekly payout request for completed griha pravesh puja.",
    accountDetails: {
      accountName: "Raghav Shastri",
      accountNumber: "XXXXXX1045",
      ifscCode: "HDFC0001045",
      upiId: "raghavshastri@upi",
    },
  });
};

const run = async () => {
  await connectDb();
  await ensureAdmin();
  await cleanupExistingDemoData();

  const { users, panditUsers } = await createUsers();
  const profiles = await createPanditProfiles(panditUsers);
  const products = await createProducts();
  const bookingData = await createBookings({ users, panditUsers, profiles });

  await createStoreOrders({ users, products });
  await createChats(bookingData);
  await createWithdrawals(bookingData);

  console.log("Demo data seeded successfully.");
  console.log("User login credentials:");
  demoUsers.forEach((item) => {
    console.log(`- ${item.email} / ${DEMO_PASSWORD}`);
  });
  console.log("Pandit login credentials:");
  demoPandits.forEach((item) => {
    console.log(`- ${item.user.email} / ${DEMO_PASSWORD}`);
  });
  console.log(`Admin login: ${env.adminEmail} / ${env.adminPassword}`);

  process.exit(0);
};

run().catch((error) => {
  console.error("Demo seeding failed", error);
  process.exit(1);
});
