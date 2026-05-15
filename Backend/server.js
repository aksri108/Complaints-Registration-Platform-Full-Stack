const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const complaintRoutes = require('./src/routes/complaints');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'https://aksri108.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
// Complaints endpoints are split between regular user and admin, but they are all in complaintRoutes file
// Map /api/complaints for regular usage
app.use('/api/complaints', complaintRoutes);
// Mount admin route explicitly at /api/admin/complaints
const { authenticateToken, isAdmin } = require('./src/middleware/auth');
const { complaints, users } = require('./src/db/schema');
const db = require('./src/db');
const { eq, desc } = require('drizzle-orm');

app.get('/api/admin/complaints', authenticateToken, isAdmin, async (req, res) => {
  try {
    const allComplaints = await db.select({
      id: complaints.id,
      complaintText: complaints.complaintText,
      aiQuestion: complaints.aiQuestion,
      userAnswer: complaints.userAnswer,
      createdAt: complaints.createdAt,
      userName: users.name,
      userEmail: users.email
    })
      .from(complaints)
      .leftJoin(users, eq(complaints.userId, users.id))
      .orderBy(desc(complaints.createdAt));

    res.json(allComplaints);
  } catch (error) {
    console.error('Error fetching admin complaints:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
