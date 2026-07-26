const env = require("../config/env");

const brandPrimary = "#8c351d";
const brandBg = "#f6efe8";
const logoUrl = `${env.clientUrl.replace(/\/$/, "")}/digipandit-logo.svg`;

const wrapper = (content) => `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${brandBg};padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="background:#ffffff;border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:${brandPrimary};color:#ffffff;">
              <table width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="width:56px;">
                    <img src="${logoUrl}" alt="DigiPandit" width="56" height="56" style="display:block;border-radius:14px;background:#ffffff;padding:6px;" />
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:16px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">DigiPandit</div>
                    <div style="font-size:12px;opacity:0.85;">Modern Spiritual Services</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">${content}</td>
          </tr>
          <tr>
            <td style="padding:16px 28px 26px;color:#6b7280;font-size:12px;">
              You are receiving this email because you initiated a request on DigiPandit. If this wasn’t you, ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

const otpEmail = ({ heading, body, otp, validityMinutes = 10, actionLabel = "Enter this code to continue" }) => {
  const content = `
    <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;">${heading}</h1>
    <p style="margin:14px 0 18px;font-size:14px;line-height:1.6;color:#374151;">${body}</p>
    <div style="margin:14px 0 18px;">
      <div style="display:inline-block;background:${brandPrimary};color:#ffffff;padding:12px 18px;border-radius:12px;font-size:24px;font-weight:700;letter-spacing:0.32em;">
        ${otp}
      </div>
    </div>
    <p style="margin:0 0 12px;font-size:13px;color:#111827;font-weight:600;">${actionLabel}</p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">This code is valid for ${validityMinutes} minutes.</p>
  `;

  return wrapper(content);
};

module.exports = {
  otpEmail,
};
