const app = require("../src/app");
const connectDb = require("../src/db/connectDb");

module.exports = async (req, res) => {
  await connectDb();
  return app(req, res);
};
