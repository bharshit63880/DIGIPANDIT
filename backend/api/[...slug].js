// Catch-all serverless entry for the DigiPandit Express API on Vercel.
const app = require("../src/app");
const connectDb = require("../src/db/connectDb");

module.exports = async (req, res) => {
  await connectDb();
  return app(req, res);
};
