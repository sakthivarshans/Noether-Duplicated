'use server';
/**
 * @fileOverview Grades a quiz and provides detailed explanations for each question.
 *
 * - gradeQuiz - A function that handles the quiz grading process.
 * - GradeQuizInput - The input type for the function.
 * - GradeQuizOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionResultSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswerIndex: z.number(),
  userAnswerIndex: z.number(),
});

const GradeQuizInputSchema = z.object({
  results: z.array(QuestionResultSchema),
});
export type GradeQuizInput = z.infer<typeof GradeQuizInputSchema>;

const ExplanationSchema = z.object({
    question: z.string(),
    reasoning: z.string().describe("A detailed explanation of why the correct answer is correct, based on general knowledge of the topic."),
    wrongAnswerExplanation: z.string().optional().describe("If the user's answer was incorrect, an explanation of why their chosen option is wrong."),
});

const GradeQuizOutputSchema = z.object({
  explanations: z.array(ExplanationSchema),
});
export type GradeQuizOutput = z.infer<typeof GradeQuizOutputSchema>;
export type Explanation = z.infer<typeof ExplanationSchema>;

export async function gradeQuiz(input: GradeQuizInput): Promise<GradeQuizOutput> {
  return gradeQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeQuizPrompt',
  input: { schema: GradeQuizInputSchema },
  output: { schema: GradeQuizOutputSchema },
  prompt: `You are an expert tutor. A student has just completed a quiz. Your task is to provide detailed feedback for each question.

For each question in the provided results, do the following:
1.  Provide a clear and detailed explanation ("reasoning") for why the correct answer is correct.
2.  If the student's answer was incorrect, also provide a specific explanation ("wrongAnswerExplanation") detailing the misunderstanding that likely led to their choice. If their answer was correct, do not provide this field.

Here are the student's results:
{{{jsonStringify results}}}
`,
});

const gradeQuizFlow = ai.defineFlow(
  {
    name: 'gradeQuizFlow',
    inputSchema: GradeQuizInputSchema,
    outputSchema: GradeQuizOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
