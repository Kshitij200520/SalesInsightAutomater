const nodemailer = require('nodemailer');

async function sendEmail(recipientEmail, summaryText) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    console.log('Sending email via Resend API...');
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sales Insight Automator <onboarding@resend.dev>',
          to: recipientEmail,
          subject: 'Automated Executive Sales Summary',
          text: summaryText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Resend API returned an error');
      }
      console.log('Message sent via Resend:', data.id);
      return true;
    } catch (err) {
      console.error('Resend sending failed:', err.message);
      throw new Error('Failed to send email via Resend.');
    }
  }

  // Fallback to Nodemailer SMTP
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'; // Default to Gmail/Google Workspace
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  let pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (pass) {
    pass = pass.replace(/\s+/g, '');
  }

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
