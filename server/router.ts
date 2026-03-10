import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { getGeminiClient } from './services/gemini.js';
import { validateLaTeXCode } from './utils/latexValidator.js';

const t = initTRPC.create();

const router = t.router;
const publicProcedure = t.procedure;

export function createRouter() {
  return router({
    latex: router({
      generate: publicProcedure
        .input(
          z.object({
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
            job_description: z.string().optional(),
            modification_prompt: z.string().optional(),
          })
        )
        .query(async ({ input }) => {
          const { latex_code, conversation_history, retry, continue: shouldContinue, job_description, modification_prompt } = input;

          // ... (validation logic)
          const validationResult = validateLaTeXCode(latex_code);
          if (!validationResult.isValid) {
            return {
              output: latex_code,
              status: 'error',
              error: validationResult.message,
            } as const;
          }

          // Prepare Gemini prompt
          const prompt = createGeminiPrompt(latex_code, conversation_history, retry, !!shouldContinue, job_description, modification_prompt);

          try {
            // ... (AI generation logic)
            const geminiClient = await getGeminiClient();
            const response = await geminiClient.generateContent(prompt, { temperature: retry ? 0.9 : 0.7 });

            if (!response || !response.text) {
              return {
                output: latex_code,
                status: 'error',
                error: 'No response generated from AI',
              } as const;
            }

            return {
              output: response.text,
              status: 'success',
            } as const;

          } catch (error) {
            console.error('Gemini API error:', error);
            return {
              output: latex_code,
              status: 'error',
              error: 'Failed to process LaTeX code: ' + (error instanceof Error ? error.message : 'Unknown error'),
            } as const;
          }
        }),
    }),
  });
}

function createGeminiPrompt(
  latexCode: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  retry: boolean = false,
  shouldContinue: boolean = false,
  jobDescription?: string,
  modificationPrompt?: string
): string {
  const context = conversationHistory.map(msg => `
${msg.role === 'user' ? 'User:' : 'Assistant:'}
${msg.content}
`).join('');

  // 1. Core Persona & Context
  let prompt = `You are an expert LaTeX resume optimizer and ATS specialist. 
Your goal is to transform the provided LaTeX resume into a professional, high-impact version while maintaining strict formatting.

### INPUT LATEX CODE:
${latexCode}

### GLOBAL RULES:
- RETURN THE ENTIRE LATEX CODE ONLY.
- Minimum 3 bullet points for each
- DO NOT wrap the output in markdown code blocks (\`\`\`latex ... \`\`\`).
- DO NOT include any conversational text before or after the code.
- The output must start directly with the first line of the LaTeX document (e.g., \\documentclass).
- DO NOT invent or fabricate facts, metrics, or experiences.
- Maintain the EXACT original layout, spacing, and LaTeX structure. 
- The resume MUST remain exactly 1 page. Do NOT add new sections or remove certifications.
`;

  // 2. Specific Instructions
  prompt += `\n### TASK INSTRUCTIONS:\n`;

  if (jobDescription) {
    prompt += `
- OPTIMIZE for the following Job Description:
"${jobDescription}"
- Naturally incorporate relevant keywords and core competencies.
- Focus on measurable accomplishments and results-oriented bullet points using strong action verbs.
`;
  }

  if (modificationPrompt) {
    prompt += `
- APPLY THESE SPECIFIC CHANGES:
"${modificationPrompt}"
- Prioritize these requests while still maintaining professional standards.
`;
  }

  // Fallback if no specific instructions provided
  if (!jobDescription && !modificationPrompt) {
    prompt += `
- Improve the wording and impact of all bullet points.
- Ensure the resume is polished, professional, and results-oriented.
- Optimize for ATS readability within the existing structure.
`;
  }

  // 3. Strict Formatting & Style Rules (Reiteration for emphasis)
  prompt += `
\n### STRICT FORMATTING RULES:
- Edit ONLY the text content inside bullet points or descriptions.
- Do NOT change commands, sections, margins, or formatting.
- Ensure the new resume contains at least as much content as the original.
- The rewritten content must NOT be identical to the original wording; improve the impact significantly.
- If there is extra space, expand technical details or add bullet points to existing roles.
`;

  // 4. Mode Specific Additions
  if (retry) {
    prompt = `
${context}

IMPORTANT: The previous output was not quite right. 
Please generate a DIFFERENT variation. Try alternative phrasings and different ways to highlight results. 
Make sure this version is distinct from the previous one.

${prompt}
`;
  } else if (shouldContinue) {
    prompt = `
${context}

CONTINUE MODE: Refine and build upon the previous modifications based on the new instructions below.

${prompt}
`;
  } else {
    prompt = `
${context}

${prompt}
`;
  }

  return prompt;
}

