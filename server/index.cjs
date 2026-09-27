// server/index.js
// Secure backend API server for Jeevika Saathi
// Keeps OPENROUTER_API_KEY server-side, away from the browser

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { callOpenRouter } = require('./aiService.cjs');

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json({ limit: '20kb' }));

// CORS — only allow the Vite dev server and same-origin production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. same-origin in prod)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash-lite',
    keyConfigured: !!process.env.OPENROUTER_API_KEY
  });
});

// Main chat endpoint — receives conversation history, returns structured AI response
app.post('/api/chat', async (req, res) => {
  const { messages, language } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: 'Conversation too long' });
  }

  // Validate each message has speaker and text
  for (const m of messages) {
    if (!m.speaker || !m.text || typeof m.text !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }
  }

  try {
    const result = await callOpenRouter(messages, language || 'en-IN');
    return res.json(result);
  } catch (err) {
    // Never expose internal error details to the client
    console.error('[API] /api/chat error:', err.message);
    const clientMsg = err.message.includes('timed out')
      ? 'AI service timed out. Please try again.'
      : err.message.includes('malformed')
        ? 'AI returned an unexpected response. Please try again.'
        : 'AI service is temporarily unavailable.';
    return res.status(503).json({ 
      error: clientMsg,
      fallback: true
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Jeevika Saathi API server running on http://localhost:${PORT}`);
  console.log(`   OpenRouter key: ${process.env.OPENROUTER_API_KEY ? '✓ configured' : '✗ not set (Demo Mode only)'}`);
  console.log(`   Model: ${process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash-lite'}`);
});
