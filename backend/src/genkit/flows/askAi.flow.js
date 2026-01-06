import { ai } from '../genkit.config.js';
import { z } from 'zod';

export const askAiFlow = ai.defineFlow(
  {
    name: 'askAiFlow',
    inputSchema: z.object({
      context: z.string().describe('The document or text to ask a question about.'),
      question: z.string().describe('The user\'s question.'),
    }),
    outputSchema: z.string().describe('The AI-generated answer.'),
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `Based on the following context, answer the user's question. If the context is not relevant, use your general knowledge.

      Context:
      ---
      ${input.context}
      ---

      Question: ${input.question}
      `,
      model: 'googleai/gemini-pro',
      config: {
        temperature: 0.5,
      },
    });

    return llmResponse.text;
  }
);
