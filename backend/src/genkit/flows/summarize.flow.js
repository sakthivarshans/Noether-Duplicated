import { ai } from '../genkit.config.js';
import { z } from 'zod';

export const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: z.string().describe('The text to be summarized.'),
    outputSchema: z.string().describe('The summarized text.'),
  },
  async (text) => {
    const llmResponse = await ai.generate({
      prompt: `Summarize the following text into key points: ${text}`,
      model: 'googleai/gemini-pro',
      config: {
        temperature: 0.3,
      },
    });

    return llmResponse.text;
  }
);
