const env = require("../config/env");
const connectDb = require("../db/connectDb");
const User = require("../models/User");
const { ROLES } = require("../constants/roles");

const run = async () => {
  await connectDb();
  const existing = await User.findOne({ email: env.adminEmail });

  if (existing) {
    existing.name = env.adminName;
    existing.password = env.adminPassword;
    existing.role = ROLES.ADMIN;
    existing.emailVerified = true;
    existing.isActive = true;
    await existing.save();
    console.log("Admin updated successfully");
    process.exit(0);
  }

  await User.create({
    name: env.adminName,
    email: env.adminEmail,
    password: env.adminPassword,
    role: ROLES.ADMIN,
    emailVerified: true,
  });

  console.log("Admin created successfully");
  process.exit(0);
};

run().catch((error) => {
  console.error("Admin seeding failed", error);
  process.exit(1);
});
