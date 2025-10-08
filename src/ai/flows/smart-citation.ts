'use server';

/**
 * @fileOverview Implements a flow for smart citation using GenAI.
 *
 * - smartCitation - A function that takes a topic as input and returns a summary of the top search results.
 * - SmartCitationInput - The input type for the smartCitation function.
 * - SmartCitationOutput - The return type for the smartCitation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartCitationInputSchema = z.object({
  topic: z.string().describe('The topic to search for.'),
});
export type SmartCitationInput = z.infer<typeof SmartCitationInputSchema>;

const SmartCitationOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise and informative summary of the top search results for the topic.'),
  references: z
    .array(
      z.object({
        title: z.string().describe('The title of the tutorial or article.'),
        url: z.string().url().describe('The URL of the resource.'),
      })
    )
    .describe('A list of 3-5 novel, high-quality tutorial links from the internet with good content.'),
});
export type SmartCitationOutput = z.infer<typeof SmartCitationOutputSchema>;

export async function smartCitation(input: SmartCitationInput): Promise<SmartCitationOutput> {
  return smartCitationFlow(input);
}

const smartCitationPrompt = ai.definePrompt({
  name: 'smartCitationPrompt',
  input: {schema: SmartCitationInputSchema},
  output: {schema: SmartCitationOutputSchema},
  prompt: `You are a helpful research assistant. For the topic "{{topic}}", provide a concise and informative summary. Additionally, find 3-5 novel, high-quality tutorial links from the internet with good content to be used as citations.
`,
});

const smartCitationFlow = ai.defineFlow(
  {
    name: 'smartCitationFlow',
    inputSchema: SmartCitationInputSchema,
    outputSchema: SmartCitationOutputSchema,
  },
  async input => {
    const {output} = await smartCitationPrompt(input);
    return output!;
  }
);
