'use server';
/**
 * @fileOverview Generates a multiple-choice quiz from a document.
 *
 * - generateQuizFromDocument - A function that handles the quiz generation process.
 * - GenerateQuizFromDocumentInput - The input type for the function.
 * - GenerateQuizFromDocumentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuizFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (PDF or PPTX), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  questionCount: z.number().min(1).max(50).describe('The number of questions to generate.'),
});
export type GenerateQuizFromDocumentInput = z.infer<typeof GenerateQuizFromDocumentInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('An array of 4 possible answers.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct answer in the options array.'),
});

const GenerateQuizFromDocumentOutputSchema = z.object({
  questions: z
    .array(QuizQuestionSchema)
    .describe('An array of multiple-choice questions generated from the document.'),
});
export type GenerateQuizFromDocumentOutput = z.infer<typeof GenerateQuizFromDocumentOutputSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;


export async function generateQuizFromDocument(input: GenerateQuizFromDocumentInput): Promise<GenerateQuizFromDocumentOutput> {
  return generateQuizFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromDocumentPrompt',
  input: { schema: GenerateQuizFromDocumentInputSchema },
  output: { schema: GenerateQuizFromDocumentOutputSchema },
  prompt: `You are an expert quiz creator for students. Your task is to analyze the provided document and generate a multiple-choice quiz to test a user's understanding of the material.

Generate exactly {{questionCount}} questions. Each question must have exactly 4 options. One of these options must be the correct answer.

Ensure the questions cover the key concepts and important details from the document. The options should be plausible but distinct.

Document: {{media url=documentDataUri}}`,
});

const generateQuizFromDocumentFlow = ai.defineFlow(
  {
    name: 'generateQuizFromDocumentFlow',
    inputSchema: GenerateQuizFromDocumentInputSchema,
    outputSchema: GenerateQuizFromDocumentOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
