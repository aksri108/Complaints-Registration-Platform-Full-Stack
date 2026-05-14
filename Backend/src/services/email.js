const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your OTP for Complaint Registration',
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendOTP,
};
