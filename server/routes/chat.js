import { Router } from 'express';
import { streamChat } from '../services/gemini.js';

const router = Router();

router.post('/', async (req, res) => {
  const { messages, systemPrompt, model } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = await streamChat({ messages, systemPrompt, model });

    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify(text)}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    const message = err.message || 'Unknown error';
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export default router;
