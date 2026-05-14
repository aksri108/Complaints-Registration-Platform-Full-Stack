const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { sendOTP } = require('../services/email');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/send-otp', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  try {
    // Check if user exists and is already verified
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length > 0 && existingUsers[0].isVerified) {
      return res.status(400).json({ error: 'Email already registered and verified' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    if (existingUsers.length > 0) {
      // Update existing unverified user
      await db.update(users)
        .set({ name, otp, otpExpiry })
        .where(eq(users.email, email));
    } else {
      // Create new user
      await db.insert(users).values({ name, email, otp, otpExpiry });
    }

    await sendOTP(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/register', async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ error: 'Email, OTP, and password are required' });

  try {
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = existingUsers[0];

    if (user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    await db.update(users)
      .set({ isVerified: true, password: password, otp: null, otpExpiry: null })
      .where(eq(users.email, email));

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = existingUsers[0];

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Email not verified. Please register first.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: false, // As per requirements for easier testing
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;
