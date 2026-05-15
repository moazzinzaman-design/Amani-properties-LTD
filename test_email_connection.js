const nodemailer = require('nodemailer');
require('dotenv').config({ path: '/Users/moazzinzaman/mission-control/.env.local' });

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: 'Zenithaiagency@outlook.com',
      pass: process.env.OUTLOOK_APP_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection successful! Outlook is ready.');
  } catch (error) {
    console.error('❌ SMTP Connection failed:', error.message);
  }
}

testEmail();
