// api/health.js
// Vercel Serverless Function — GET /api/health
// Returns backend status without exposing the actual API key.

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
} catch (_) {}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  return res.status(200).json({
    status: 'ok',
    service: 'Jeevika Saathi API',
    model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash',
    keyConfigured: !!process.env.OPENROUTER_API_KEY,
    environment: process.env.VERCEL ? 'vercel' : 'local',
  });
}
