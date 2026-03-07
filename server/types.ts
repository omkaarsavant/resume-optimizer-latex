import { z } from 'zod';

export const GenerateInputSchema = z.object({
  latex_code: z.string().min(1, 'LaTeX code is required'),
  conversation_history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1, 'Content is required'),
      })
    )
    .default([]),
  retry: z.boolean().optional(),
  continue: z.boolean().optional(),
});

export type GenerateInput = z.infer<typeof GenerateInputSchema>;

export const GenerateOutputSchema = z.object({
  output: z.string(),
  status: z.enum(['success', 'error']),
  error: z.string().optional(),
});

export type GenerateOutput = z.infer<typeof GenerateOutputSchema>;

export interface GeminiResponse {
  text?: string;
  candidates?: Array<{
    text?: string;
  }>;
}