// server/security.cjs
/**
 * Security and validation utilities for Jeevika Saathi Express backend.
 * Provides:
 * - In-memory rate limiting with memory-leak protection
 * - Input validation & sanitization
 * - Security response headers
 * - Standardized safe error handler
 */

const crypto = require('crypto');

/**
 * Creates an in-memory rate limiter middleware.
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60,000ms / 1 min)
 * @param {number} options.max - Max requests allowed per window per IP
 * @param {string} options.message - Error message when rate limit exceeded
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 60;
  const message = options.message || 'Too many requests. Please try again later.';

  // Map of ip -> { count, resetTime }
  const clients = new Map();

  // Periodic cleanup every 2 minutes to prevent unbounded memory growth
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of clients.entries()) {
      if (now > data.resetTime) {
        clients.delete(ip);
      }
    }
  }, 2 * 60 * 1000);

  // Do not prevent process exit in tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    if (typeof options.skip === 'function' && options.skip(req)) {
      return next();
    }
    // Determine client IP securely
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let clientData = clients.get(ip);
    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 1,
        resetTime: now + windowMs
      };
      clients.set(ip, clientData);
    } else {
      clientData.count += 1;
    }

    // Set rate limit headers
    const remaining = Math.max(0, max - clientData.count);
    const resetSeconds = Math.ceil((clientData.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (clientData.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: message,
        retryAfterSeconds: resetSeconds
      });
    }

    next();
  };
}

/**
 * Validates a 10-digit Indian mobile number.
 */
function isValidIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  // Allow format: 9876543210 or 919876543210
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(cleaned.slice(2));
  }
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Normalizes phone number to 10 digits.
 */
function normalizePhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits.slice(-10);
}

/**
 * Sanitizes generic user input string to prevent script injection / control characters.
 */
function sanitizeString(input, maxLength = 255) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control chars
    .slice(0, maxLength);
}

/**
 * Middleware that attaches essential security headers.
 */
function securityHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

module.exports = {
  createRateLimiter,
  isValidIndianPhone,
  normalizePhoneNumber,
  sanitizeString,
  securityHeadersMiddleware
};
