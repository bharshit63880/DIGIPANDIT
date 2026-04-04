// Catch-all serverless entry for Express app on Vercel
const app = require("../src/app");
const connectDb = require("../src/db/connectDb");

module.exports = async (req, res) => {
  await connectDb();
  return app(req, res);
};
