'use server';
/**
 * @fileOverview Implements a flow for generating a dynamic learning roadmap for a given topic.
 *
 * - generateLearningRoadmap - A function that takes a topic and returns a structured learning path.
 * - GenerateLearningRoadmapInput - The input type for the function.
 * - GenerateLearningRoadmapOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLearningRoadmapInputSchema = z.object({
  topic: z.string().describe('The central topic for the learning roadmap.'),
});
export type GenerateLearningRoadmapInput = z.infer<typeof GenerateLearningRoadmapInputSchema>;

const RoadmapStepSchema = z.object({
  title: z.string().describe('The title of this sub-topic or learning module.'),
  description: z.string().describe('A brief, one-sentence description of what this step covers.'),
});

const RoadmapSectionSchema = z.object({
  title: z.string().describe('The title of the main section in the roadmap (e.g., "Basics", "Advanced Topics").'),
  steps: z.array(RoadmapStepSchema).describe('An ordered list of learning steps within this section.'),
});

const BookReferenceSchema = z.object({
    title: z.string().describe("The title of the reference book."),
    author: z.string().describe("The author(s) of the book."),
    url: z.string().url().describe("A URL to find or purchase the book (e.g., Amazon, Google Books, or publisher's page).")
});

const GenerateLearningRoadmapOutputSchema = z.object({
  roadmap: z.array(RoadmapSectionSchema).describe('The structured learning roadmap, divided into sections.'),
  referenceBooks: z.array(BookReferenceSchema).describe('A list of 2-3 highly-rated and relevant reference books for the topic.'),
});
export type GenerateLearningRoadmapOutput = z.infer<typeof GenerateLearningRoadmapOutputSchema>;


export async function generateLearningRoadmap(input: GenerateLearningRoadmapInput): Promise<GenerateLearningRoadmapOutput> {
  return generateLearningRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningRoadmapPrompt',
  input: { schema: GenerateLearningRoadmapInputSchema },
  output: { schema: GenerateLearningRoadmapOutputSchema },
  prompt: `You are an expert curriculum designer. Your task is to generate a comprehensive, structured learning roadmap for a given topic, similar in concept to the NeetCode.io roadmap for algorithms.

For the topic "{{topic}}", create a clear, step-by-step learning path. Group related concepts into logical sections (e.g., "Fundamentals", "Intermediate Concepts", "Advanced Techniques"). Each step within a section should represent a specific concept or skill to learn.

After creating the roadmap, find 2-3 highly-rated and relevant reference books that would be excellent resources for learning this topic. Provide the book title, author, and a valid URL where the book can be found.

The roadmap should be ordered logically, starting from the most fundamental concepts and progressing to more advanced ones. Ensure the output is a JSON object that strictly follows the provided schema.
`,
});

const generateLearningRoadmapFlow = ai.defineFlow(
  {
    name: 'generateLearningRoadmapFlow',
    inputSchema: GenerateLearningRoadmapInputSchema,
    outputSchema: GenerateLearningRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
