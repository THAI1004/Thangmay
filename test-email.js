const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function main() {
  console.log("Trying to authenticate with", process.env.MAIL_USER, process.env.MAIL_PASS);
  const info = await transporter.sendMail({
    from: `"Thang May Tesla" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER,
    subject: "Test Email",
    text: "This is a test email.",
  });
  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
