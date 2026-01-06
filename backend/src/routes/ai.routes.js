import { Router } from 'express';
import { summarizeFlow } from '../genkit/flows/summarize.flow.js';
import { askAiFlow } from '../genkit/flows/askAi.flow.js';

const router = Router();

// Endpoint to summarize text
router.post('/summarize', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for summarization.' });
  }
  try {
    const summary = await summarizeFlow.run(text);
    res.json({ summary });
  } catch (error) {
    console.error('Summarization flow error:', error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

// Endpoint to ask a question
router.post('/ask-ai', async (req, res) => {
  const { context, question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'A question is required.' });
  }
  try {
    const answer = await askAiFlow.run({ context: context || '', question });
    res.json({ answer });
  } catch (error) {
    console.error('Ask AI flow error:', error);
    res.status(500).json({ error: 'Failed to get an answer from the AI.' });
  }
});

export default router;
