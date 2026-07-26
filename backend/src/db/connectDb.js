const mongoose = require("mongoose");
const env = require("../config/env");

// Reuse connection across serverless invocations to avoid exhausting connections.
let cached = global._digipanditMongoose;
if (!cached) {
  cached = global._digipanditMongoose = { conn: null, promise: null };
}

const connectDb = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(env.mongoUri, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDb;
