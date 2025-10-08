
'use server';
/**
 * @fileOverview Generates detailed answers for past year question papers using GenAI.
 *
 * - generateAnswersForPYQ - A function that handles the generation of answers for PYQ papers.
 * - GenerateAnswersForPYQInput - The input type for the generateAnswersForPYQ function.
 * - GenerateAnswersForPYQOutput - The return type for the generateAnswersForPYQ function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnswersForPYQInputSchema = z.object({
  pyqContent: z
    .string()
    .describe('The content of the past year question paper (PDF or text).'),
});
export type GenerateAnswersForPYQInput = z.infer<typeof GenerateAnswersForPYQInputSchema>;

const GenerateAnswersForPYQOutputSchema = z.object({
  answers: z.string().describe('Detailed answers for each question in the PYQ paper.'),
});
export type GenerateAnswersForPYQOutput = z.infer<typeof GenerateAnswersForPYQOutputSchema>;

export async function generateAnswersForPYQ(input: GenerateAnswersForPYQInput): Promise<GenerateAnswersForPYQOutput> {
  return generateAnswersForPYQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswersForPYQPrompt',
  input: {schema: GenerateAnswersForPYQInputSchema},
  output: {schema: GenerateAnswersForPYQOutputSchema},
  prompt: `You are an expert educator specializing in providing detailed answers to past year question papers.

You will use the content of the question paper to generate detailed and accurate answers for each question.
Present the answers in a clear, organized, and plain text format. Do not use any markdown formatting like asterisks for bolding or lists.

Question Paper Content:
{{{pyqContent}}}`,
});

const generateAnswersForPYQFlow = ai.defineFlow(
  {
    name: 'generateAnswersForPYQFlow',
    inputSchema: GenerateAnswersForPYQInputSchema,
    outputSchema: GenerateAnswersForPYQOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
