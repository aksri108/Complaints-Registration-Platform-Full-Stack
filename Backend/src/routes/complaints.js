const express = require('express');
const router = express.Router();
const db = require('../db');
const { complaints, users } = require('../db/schema');
const { eq, desc } = require('drizzle-orm');
const { generateFollowUpQuestion } = require('../services/ai');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/ai/question', authenticateToken, async (req, res) => {
  const { complaint_text } = req.body;
  if (!complaint_text) return res.status(400).json({ error: 'Complaint text is required' });

  try {
    const question = await generateFollowUpQuestion(complaint_text);
    res.json({ ai_question: question });
  } catch (error) {
    console.error('Error in /ai/question:', error);
    res.status(500).json({ error: 'Failed to generate AI question', details: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { complaint_text, ai_question, ai_answer } = req.body;
  
  if (!complaint_text) {
    return res.status(400).json({ error: 'Complaint text is required' });
  }

  try {
    const newComplaint = await db.insert(complaints).values({
      userId: req.user.id,
      complaintText: complaint_text,
      aiQuestion: ai_question || null,
      userAnswer: ai_answer || null
    }).returning();

    res.status(201).json(newComplaint[0]);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.get('/my', authenticateToken, async (req, res) => {
  try {
    const myComplaints = await db.select().from(complaints)
      .where(eq(complaints.userId, req.user.id))
      .orderBy(desc(complaints.createdAt));
      
    res.json(myComplaints);
  } catch (error) {
    console.error('Error fetching my complaints:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
