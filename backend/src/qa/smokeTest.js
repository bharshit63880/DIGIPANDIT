const connectDb = require("../db/connectDb");
const User = require("../models/User");
const Booking = require("../models/Booking");
const ChatRoom = require("../models/ChatRoom");
const ConsultationSession = require("../models/ConsultationSession");
const Message = require("../models/Message");
const StoreOrder = require("../models/StoreOrder");
const WalletTopup = require("../models/WalletTopup");
const WalletTransaction = require("../models/WalletTransaction");

const API_URL = process.env.QA_API_URL || "http://localhost:5000/api";
const email = `qa-${Date.now()}@example.com`;
const password = "QA-Test@2026";
const results = [];
let userId;

async function request(name, path, { method = "GET", token, body, expected = 200 } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  const passed = response.status === expected;
  results.push({ name, passed, status: response.status, expected, message: payload.message || "" });
  if (!passed) throw new Error(`${name}: expected ${expected}, received ${response.status} (${payload.message || "no message"})`);
  return payload;
}

async function cleanup() {
  if (!userId) return;
  const bookings = await Booking.find({ user: userId }).select("_id");
  const bookingIds = bookings.map((entry) => entry._id);
  const rooms = await ChatRoom.find({ $or: [{ participants: userId }, { booking: { $in: bookingIds } }] }).select("_id");
  const roomIds = rooms.map((entry) => entry._id);

  await Promise.all([
    Message.deleteMany({ room: { $in: roomIds } }),
    ChatRoom.deleteMany({ _id: { $in: roomIds } }),
    ConsultationSession.deleteMany({ user: userId }),
    Booking.deleteMany({ user: userId }),
    StoreOrder.deleteMany({ user: userId }),
    WalletTopup.deleteMany({ user: userId }),
    WalletTransaction.deleteMany({ user: userId }),
  ]);
  await User.deleteOne({ _id: userId, email });
}

async function run() {
  await connectDb();
  try {
    await request("Health", "/health");
    const registration = await request("Register user", "/auth/register", {
      method: "POST",
      expected: 201,
      body: { name: "QA Test User", email, password, phone: "9999999999", role: "USER", city: "Jhansi", state: "UP" },
    });
    userId = registration.data.user._id;
    const token = registration.data.token;

    await request("Duplicate registration rejected", "/auth/register", {
      method: "POST",
      expected: 409,
      body: { name: "QA Duplicate", email, password },
    });
    await request("Wrong password rejected", "/auth/login", {
      method: "POST",
      expected: 401,
      body: { email, password: "WrongPassword1" },
    });
    await request("Login", "/auth/login", { method: "POST", body: { email, password } });
    await request("Current user", "/users/me", { token });
    await request("Profile update", "/users/me", {
      method: "PATCH",
      token,
      body: { name: "QA Updated User", gender: "Prefer not to say", city: "Gwalior", state: "MP" },
    });
    const products = await request("Product catalog", "/products?limit=1");
    await request("Product details", `/products/${products.data[0].slug}`);
    const pandits = await request("Pandit catalog", "/pandits?limit=1");
    const pandit = pandits.data[0];
    const service = pandit.services.find((entry) => entry.isActive);
    await request("Pandit details", `/pandits/${pandit._id}`);
    const booking = await request("Create booking", "/bookings", {
      method: "POST",
      token,
      expected: 201,
      body: {
        panditProfileId: pandit._id,
        serviceId: service._id,
        scheduleAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        meetingMode: service.category === "PUJA" ? "OFFLINE" : "ONLINE",
        address: {
          line1: "QA Test Address",
          city: "Jhansi",
          state: "Uttar Pradesh",
          pincode: "284001",
        },
      },
    });
    await request("Booking details", `/bookings/${booking.data._id}`, { token });
    await request("Cancel booking", `/bookings/${booking.data._id}/status`, {
      method: "PATCH",
      token,
      body: { status: "CANCELLED" },
    });
    const order = await request("Create store order", "/store/orders", {
      method: "POST",
      token,
      expected: 201,
      body: {
        items: [{ productId: products.data[0]._id, quantity: 1 }],
        shippingAddress: {
          line1: "QA Test Address",
          city: "Gwalior",
          state: "Madhya Pradesh",
          pincode: "474001",
        },
      },
    });
    await request("Store order details", `/store/orders/${order.data._id}`, { token });
    await request("Wallet read", "/wallet", { token });
    await request("Wallet amount validation", "/add-money", { method: "POST", token, expected: 400, body: { amount: 10 } });
    await request("Wallet topup request", "/add-money", { method: "POST", token, body: { amount: 500 } });
    await request("My bookings", "/bookings/me", { token });
    await request("My store orders", "/store/orders/me", { token });
    const rooms = await request("My chat rooms", "/chat/rooms", { token });
    const bookingRoom = rooms.data.find((room) => String(room.booking?._id || room.booking) === String(booking.data._id));
    if (!bookingRoom) throw new Error("Booking chat room was not created");
    await request("Send chat message", `/chat/rooms/${bookingRoom._id}/messages`, {
      method: "POST",
      token,
      expected: 201,
      body: { content: "Automated QA message" },
    });
    await request("Read chat messages", `/chat/rooms/${bookingRoom._id}/messages`, { token });
    await request("Admin route forbidden for user", "/admin/dashboard", { token, expected: 403 });
    await request("Pandit route forbidden for user", "/pandits/dashboard/me/profile", { token, expected: 403 });
    await request("Missing auth rejected", "/wallet", { expected: 401 });
    await request("Invalid Kundali rejected", "/astrology/kundali", {
      method: "POST",
      expected: 400,
      body: { fullName: "Q", birthDate: "bad-date" },
    });
    await request("Generate Kundali", "/astrology/kundali", {
      method: "POST",
      body: {
        fullName: "QA Test User",
        birthDate: "1998-05-15",
        birthTime: "10:30",
        latitude: 25.42012,
        longitude: 81.88385,
        placeName: "Prayagraj (Allahabad)",
      },
    });
    await request("Kundali matching", "/astrology/matching", {
      method: "POST",
      body: {
        bride: { fullName: "QA Bride", birthDate: "1999-04-10", birthTime: "09:15", placeName: "Jhansi" },
        groom: { fullName: "QA Groom", birthDate: "1997-08-21", birthTime: "14:20", placeName: "Gwalior" },
      },
    });
    await request("Numerology", "/astrology/numerology", {
      method: "POST",
      body: { fullName: "QA Test User", birthDate: "1998-05-15" },
    });
    await request("PanditJi assistant", "/ai/panditji-chat", {
      method: "POST",
      body: { message: "Kundali kaise generate karun?" },
    });
  } finally {
    await cleanup();
  }
}

run()
  .then(() => {
    console.table(results);
    console.log(`QA smoke test passed (${results.length}/${results.length}); isolated user cleaned up.`);
    process.exit(0);
  })
  .catch((error) => {
    console.table(results);
    console.error(error.message);
    process.exit(1);
  });
