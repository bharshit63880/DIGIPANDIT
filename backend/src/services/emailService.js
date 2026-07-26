const nodemailer = require("nodemailer");
const { StatusCodes } = require("http-status-codes");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword,
      },
    });
  }

  return transporter;
};

const assertSmtpConfigured = () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPassword) {
    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "Email delivery is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM before requesting an OTP."
    );
  }
};

const sendEmail = async ({ to, subject, html, meta }) => {
  assertSmtpConfigured();

  const info = await getTransporter().sendMail({
    from: env.emailFrom,
    to,
    subject,
    html,
  });

  return { success: true, messageId: info.messageId };
};

module.exports = { sendEmail };
