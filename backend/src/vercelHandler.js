const app = require("./app");
const connectDb = require("./db/connectDb");

// Shared serverless entry. Vercel rewrites every /api request here so Express
// retains control over nested and parameterized routes.
module.exports = async (req, res) => {
  await connectDb();
  return app(req, res);
};
