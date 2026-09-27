// api/chat.js
// Vercel Serverless Function — POST /api/chat
// Keeps OPENROUTER_API_KEY server-side only.
// Uses ESM-compatible dynamic require via createRequire since package.json has "type":"module"

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env vars from .env when running locally (Vercel injects them automatically in prod)
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
} catch (_) {
  // dotenv not needed in Vercel production — env vars are injected
}

const { callOpenRouter } = require('../server/aiService.cjs');

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.endsWith('.vercel.app');

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Same-origin request — no CORS header needed
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req, res) {
  // Handle CORS preflight
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, language } = req.body || {};

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }
  if (messages.length > 50) {
    return res.status(400).json({ error: 'Conversation too long' });
  }
  for (const m of messages) {
    if (!m.speaker || !m.text || typeof m.text !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }
  }

  try {
    const result = await callOpenRouter(messages, language || 'en-IN');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[/api/chat] Error:', err.message);
    const clientMsg = err.message.includes('timed out')
      ? 'AI service timed out. Please try again.'
      : err.message.includes('malformed')
        ? 'AI returned an unexpected response. Please try again.'
        : 'AI service is temporarily unavailable.';
    return res.status(503).json({ error: clientMsg, fallback: true });
  }
}
