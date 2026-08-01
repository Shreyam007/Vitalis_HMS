import express from 'express';
import jwt from 'jsonwebtoken';
import { eventBus } from '../sse/eventBus.js';

const router = express.Router();
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'vitalis_jwt_access_secret_super_secure_key_2026_x90a';

router.get('/events', (req, res) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Missing SSE auth token' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token for SSE' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`retry: 3000\n`);
  res.write(`event: connected\ndata: ${JSON.stringify({ userId: decoded.id })}\n\n`);

  eventBus.addClient(decoded.id, res);
});

export default router;
