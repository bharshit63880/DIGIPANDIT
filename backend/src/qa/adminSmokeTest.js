const connectDb = require("../db/connectDb");
const env = require("../config/env");
const User = require("../models/User");
const Product = require("../models/Product");
const PanditProfile = require("../models/PanditProfile");
const Booking = require("../models/Booking");
const StoreOrder = require("../models/StoreOrder");
const WithdrawalRequest = require("../models/WithdrawalRequest");

const API_URL = process.env.QA_API_URL || "http://localhost:5000/api";
const suffix = Date.now();
const email = `admin-qa-${suffix}@example.com`;
const panditEmail = `admin-pandit-qa-${suffix}@example.com`;
const slug = `admin-qa-product-${suffix}`;
const results = [];
const created = {};

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
  results.push({ name, passed: response.status === expected, status: response.status, expected });
  if (response.status !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${response.status} (${payload.message || "no message"})`);
  }
  return payload;
}

async function cleanup() {
  await Promise.all([
    created.bookingId ? Booking.deleteOne({ _id: created.bookingId }) : null,
    created.orderId ? StoreOrder.deleteOne({ _id: created.orderId }) : null,
    created.withdrawalId ? WithdrawalRequest.deleteOne({ _id: created.withdrawalId }) : null,
    created.profileId ? PanditProfile.deleteOne({ _id: created.profileId }) : null,
    Product.deleteOne({ slug }),
    User.deleteMany({ email: { $in: [email, panditEmail] } }),
  ].filter(Boolean));
}

async function run() {
  await connectDb();
  try {
    const login = await request("Admin login", "/auth/login", {
      method: "POST",
      body: { email: env.adminEmail, password: env.adminPassword },
    });
    const token = login.data.token;
    if (login.data.user.role !== "ADMIN") throw new Error("Configured account is not an admin");
    await request("Prevent admin self-lockout", `/admin/users/${login.data.user._id}`, {
      method: "PATCH", token, expected: 400, body: { role: "USER" },
    });

    await request("Admin dashboard", "/admin/dashboard", { token });
    await request("List users", "/admin/users?limit=10", { token });
    const user = await request("Create user", "/admin/users", {
      method: "POST", token, expected: 201,
      body: { name: "Admin QA User", email, password: "Admin-QA@2026", role: "USER", city: "Jhansi", state: "UP" },
    });
    created.userId = user.data._id;
    await request("Update user", `/admin/users/${created.userId}`, {
      method: "PATCH", token, body: { name: "Admin QA Updated", isActive: true },
    });
    await request("Deactivate user", `/admin/users/${created.userId}`, { method: "DELETE", token });
    await request("Reactivate user", `/admin/users/${created.userId}`, {
      method: "PATCH", token, body: { isActive: true },
    });

    const product = await request("Create product", "/admin/products", {
      method: "POST", token, expected: 201,
      body: { name: "Admin QA Product", slug, category: "BOOK", description: "Temporary QA product", price: 199, stock: 5 },
    });
    created.productId = product.data._id;
    await request("Update product", `/admin/products/${created.productId}`, {
      method: "PATCH", token, body: { price: 249, stock: 8 },
    });
    await request("Archive product", `/admin/products/${created.productId}`, { method: "DELETE", token });
    await request("List products", "/admin/products", { token });

    const panditUser = await User.create({
      name: "Admin QA Pandit", email: panditEmail, password: "Admin-QA@2026", role: "PANDIT", emailVerified: true,
    });
    created.panditUserId = panditUser._id;
    const profile = await PanditProfile.create({ user: panditUser._id, approvalStatus: "PENDING" });
    created.profileId = profile._id;
    await request("List expert approvals", "/admin/pandits/approvals", { token });
    await request("Approve expert", `/admin/pandits/${profile._id}/approval`, {
      method: "PATCH", token, body: { status: "APPROVED", approvalNotes: "Automated QA" },
    });

    const booking = await Booking.create({
      bookingType: "PUJA", user: created.userId, pandit: panditUser._id, panditProfile: profile._id,
      serviceId: profile._id, serviceName: "QA Puja", servicePrice: 501,
      scheduleAt: new Date(Date.now() + 86400000), durationInMinutes: 60, meetingMode: "OFFLINE",
      payment: { amount: 501, status: "CREATED" },
    });
    created.bookingId = booking._id;
    await request("Update booking", `/admin/bookings/${booking._id}`, {
      method: "PATCH", token, body: { status: "ACCEPTED" },
    });

    const order = await StoreOrder.create({
      user: created.userId,
      items: [{ product: created.productId, name: "Admin QA Product", price: 249, quantity: 1 }],
      shippingAddress: { line1: "QA", city: "Jhansi", state: "UP", pincode: "284001" },
      pricing: { subtotal: 249, shippingFee: 79, total: 328 },
      payment: { amount: 328, status: "CREATED" },
    });
    created.orderId = order._id;
    await request("Update order", `/admin/store-orders/${order._id}/status`, {
      method: "PATCH", token, body: { orderStatus: "PROCESSING" },
    });
    await request("Reject invalid order status", `/admin/store-orders/${order._id}/status`, {
      method: "PATCH", token, expected: 400, body: { orderStatus: "INVALID" },
    });

    const withdrawal = await WithdrawalRequest.create({ pandit: panditUser._id, amount: 500 });
    created.withdrawalId = withdrawal._id;
    await request("Approve withdrawal", `/admin/withdrawals/${withdrawal._id}/status`, {
      method: "PATCH", token, body: { status: "APPROVED", notes: "Automated QA" },
    });
    await request("Reject invalid withdrawal status", `/admin/withdrawals/${withdrawal._id}/status`, {
      method: "PATCH", token, expected: 400, body: { status: "INVALID" },
    });
    await request("User denied admin access", "/admin/dashboard", {
      token: (await request("QA user login", "/auth/login", {
        method: "POST", body: { email, password: "Admin-QA@2026" },
      })).data.token,
      expected: 403,
    });
  } finally {
    await cleanup();
  }
}

run()
  .then(() => {
    console.table(results);
    console.log(`Admin QA passed (${results.length}/${results.length}); isolated records cleaned up.`);
    process.exit(0);
  })
  .catch((error) => {
    console.table(results);
    console.error(error.message);
    process.exit(1);
  });
