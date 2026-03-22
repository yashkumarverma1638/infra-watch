const nodemailer = require("nodemailer");

// 🔥 transporter (use Gmail for now)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password
  },
});

// 🚨 DOWN EMAIL
async function sendDownEmail(to, url) {
  await transporter.sendMail({
    from: `"InfraWatch 🚨" <ykverma321@gmail.com>`, // ✅ verified sender
    to,
    subject: `🚨 ALERT: Website Down`,
    html: `
      <h2 style="color:red;">Website Down 🚨</h2>
      <p>Your website <b>${url}</b> is currently DOWN.</p>
      <p>Please check immediately.</p>
    `,
  });
}

// ✅ RECOVERY EMAIL
async function sendRecoveryEmail(to, url) {
  await transporter.sendMail({
    from: `"InfraWatch ✅" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Website Recovered`,
    html: `
      <h2 style="color:green;">Website Back Online ✅</h2>
      <p>Your website <b>${url}</b> is now UP.</p>
    `,
  });
}

module.exports = {
  sendDownEmail,
  sendRecoveryEmail,
};
