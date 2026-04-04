// Vercel Serverless entry point for the backend API
const app = require("../src/app");
const connectDb = require("../src/db/connectDb");

module.exports = async (req, res) => {
  await connectDb(); // ensure DB is ready per invocation
  return app(req, res);
};
