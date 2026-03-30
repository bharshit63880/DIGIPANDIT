const env = require("../config/env");

const sendMockEmail = async ({ to, subject, html, meta }) => {
  console.log("Mock email dispatched", {
    from: env.emailFrom,
    to,
    subject,
    html,
    meta,
  });

  return { success: true };
};

module.exports = { sendMockEmail };
