// Express fallback for every API path that does not have a concrete Vercel
// function file. This keeps parameterized routes working on serverless deploys.
module.exports = require("./_handler");
