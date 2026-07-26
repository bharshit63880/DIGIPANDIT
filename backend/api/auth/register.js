// Explicit serverless route for browser signup requests. Keeping this route
// concrete ensures Vercel forwards POST and CORS OPTIONS requests reliably.
const app = require("../../src/app");
const connectDb = require("../../src/db/connectDb");

module.exports = async (req, res) => {
  await connectDb();
  return app(req, res);
};
