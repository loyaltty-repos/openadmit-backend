import nodemailer from 'nodemailer';
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // true for 465, false for others
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
  tls: {
    rejectUnauthorized: false, // <— accept self-signed certs
  },
});

const mailer = {
  sendEmail: async (to, {subject, text, html}) => {
    console.log(`Sending Email to ${to}`);
    try {
      await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        ...(html && { html }),
      });
      console.log(`✅ Email successfully sent to ${to}`);
    } catch (err) {
      console.log(err)
      console.error(`❌ Failed to send email: ${err.message}`);
    }
  },
};

export default mailer;

// // 🔹 Auto-trigger test email on startup (only in development)
// if (process.env.NODE_ENV === 'development') {
//   const testEmail = async () => {
//     console.log('🚀 Sending test email...');
//     await mailer.sendEmail(
//       'digvijay.singh@loyaltty.com',
//       'Test Email from Nodemailer',
//       'This is a plain text test email.',
//       '<h3>This is a test email sent automatically when the project starts 🚀</h3>'
//     );
//   };

//   // Delay a bit so server starts first
//   setTimeout(testEmail, 2000);
// }
