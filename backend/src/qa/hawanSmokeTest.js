const connectDb = require("../db/connectDb");
const env = require("../config/env");
const User = require("../models/User");
const Hawan = require("../models/Hawan");
const HawanProgress = require("../models/HawanProgress");

const API_URL = process.env.QA_API_URL || "http://localhost:5000/api";
const suffix = Date.now();
const email = `hawan-qa-${suffix}@example.com`;
const results = [];
let userId;
let duplicateId;

async function request(name, path, { method = "GET", token, body, expected = 200 } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { ...(body ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  results.push({ name, passed: response.status === expected, status: response.status, expected });
  if (response.status !== expected) throw new Error(`${name}: expected ${expected}, got ${response.status} (${payload.message || "no message"})`);
  return payload;
}

async function cleanup() {
  if (userId) await HawanProgress.deleteMany({ user: userId });
  if (duplicateId) await Hawan.deleteOne({ _id: duplicateId });
  await User.deleteOne({ email });
}

async function run() {
  await connectDb();
  try {
    const list = await request("List published Hawans", "/hawans?limit=20");
    if (list.data.length < 1) throw new Error("Seed Hawans before QA");
    const target = list.data[0];
    await request("Filter Hawans", `/hawans?category=${target.category}&difficulty=${target.difficulty}`);
    const detail = await request("Fetch Hawan detail", `/hawans/${target.slug}`);
    await request("Fetch materials", `/hawans/${target._id}/materials`);
    await request("Fetch Pandits", `/hawans/${target._id}/pandits`);
    const muhurat = await request("Calculate location Muhurat", `/hawans/${target._id}/muhurat?latitude=25.4358&longitude=81.8463&location=Prayagraj`);
    if (!muhurat.data.tithi || !muhurat.data.nakshatra || !muhurat.data.rahuKaal?.start || !muhurat.data.timings?.length) throw new Error("Muhurat calculation is incomplete");
    await request("Reject missing Muhurat coordinates", `/hawans/${target._id}/muhurat`, { expected: 400 });
    await request("Recommendation flow", "/hawans/recommend", { method: "POST", body: { purpose: target.purposes[0], timeMinutes: 180, budget: 10000, needsPandit: true } });
    await request("Reject invalid recommendation", "/hawans/recommend", { method: "POST", body: { purpose: "" }, expected: 400 });
    await request("Progress requires authentication", `/hawans/${target._id}/progress`, { expected: 401 });

    const user = await User.create({ name: "Hawan QA User", email, password: "Hawan-QA@2026", role: "USER", emailVerified: true });
    userId = user._id;
    const userLogin = await request("QA user login", "/auth/login", { method: "POST", body: { email, password: "Hawan-QA@2026" } });
    const userToken = userLogin.data.token;
    const stepId = detail.data.steps[0]._id;
    const materialId = detail.data.materials[0]._id;
    await request("Save safe progress", `/hawans/${target._id}/progress`, {
      method: "POST", token: userToken,
      body: { completedStepIds: [stepId], readyMaterialIds: [materialId], currentStepIndex: 1, safetyConfirmed: true, saved: true, mantraCounts: { [stepId]: 11 } },
    });
    await request("Restore progress", `/hawans/${target._id}/progress`, { token: userToken });
    await request("Reject invalid step progress", `/hawans/${target._id}/progress`, {
      method: "POST", token: userToken, expected: 400,
      body: { completedStepIds: ["64b000000000000000000000"] },
    });
    await request("Complete Hawan", `/hawans/${target._id}/complete`, { method: "POST", token: userToken });
    await request("Dashboard Hawan history", "/hawans/me/progress", { token: userToken });

    const adminLogin = await request("Admin login", "/auth/login", { method: "POST", body: { email: env.adminEmail, password: env.adminPassword } });
    const adminToken = adminLogin.data.token;
    await request("Admin list Hawans", "/admin/hawans", { token: adminToken });
    const duplicate = await request("Admin duplicate Hawan", `/admin/hawans/${target._id}/duplicate`, { method: "POST", token: adminToken, expected: 201 });
    duplicateId = duplicate.data._id;
    await request("Admin structured update", `/admin/hawans/${duplicateId}`, {
      method: "PATCH", token: adminToken,
      body: { shortDescription: "Updated by the isolated Hawan QA workflow with structured validation." },
    });
    await request("Admin publish duplicate", `/admin/hawans/${duplicateId}/publish`, { method: "PATCH", token: adminToken });
    await request("Admin archive duplicate", `/admin/hawans/${duplicateId}`, { method: "DELETE", token: adminToken });
    await request("User denied admin Hawans", "/admin/hawans", { token: userToken, expected: 403 });
  } finally {
    await cleanup();
  }
}

run().then(() => {
  console.table(results);
  console.log(`Hawan QA passed (${results.length}/${results.length}); isolated records cleaned up.`);
  process.exit(0);
}).catch((error) => {
  console.table(results);
  console.error(error.message);
  process.exit(1);
});
