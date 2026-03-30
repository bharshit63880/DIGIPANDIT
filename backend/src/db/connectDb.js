const mongoose = require("mongoose");
const env = require("../config/env");

const connectDb = async () => {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};

module.exports = connectDb;
