const nodemailer = require('nodemailer');

async function sendEmail(recipientEmail, summaryText) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'; // Default to Gmail/Google Workspace
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass || user.includes('your_email@gmail.com')) {
    console.log(`\n--- MOCK EMAIL TO: ${recipientEmail} ---\n${summaryText}\n----------------------`);
    return false; // Indicating mock sending
  }

  // Gmail ke liye special simplified config
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
    connectionTimeout: 20000 
  });

  try {
    const info = await transporter.sendMail({
      from: `"Sales Insight Automator" <${user}>`,
      to: recipientEmail,
      subject: "Automated Executive Sales Summary",
      text: summaryText,
    });
    console.log("Message sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email sending failed:", err);
    throw new Error('Failed to send email.');
  }
}

module.exports = { sendEmail };
