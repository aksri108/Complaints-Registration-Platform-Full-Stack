const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function testEmail() {
  try {
    console.log(`Testing email from ${process.env.GMAIL_USER}...`);
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to self
      subject: 'OTP Test',
      text: 'Your OTP is 123456'
    });
    console.log('Email Success:', info.messageId);
    process.exit(0);
  } catch (error) {
    console.error('Email Failed:', error.message);
    process.exit(1);
  }
}

testEmail();
