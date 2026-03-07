import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { getGeminiClient } from './services/gemini';
import { validateLaTeXCode } from './utils/latexValidator';

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

  let basePrompt = `
You are an expert LaTeX editor and formatter. Your task is to improve and modify LaTeX documents according to user requests.

Given the following LaTeX code:
${latexCode}
`;

  if (modificationPrompt) {
    basePrompt += `
The user has requested the following SPECIFIC modifications:
"${modificationPrompt}"

Please apply these changes to the LaTeX code precisely. 
Ensure the formatting remains professional and follows academic/industry standards.
Maintain the overall structure of the original document while optimizing the content as requested.
`;
  } else if (jobDescription) {
    basePrompt += `
The user is tailoring this LaTeX document (likely a resume) for the following job description:
"${jobDescription}"


IMPORTANT RULES:
- Change the content according to the job description but DO NOT change the layout or spacing.
- Only modify the content text, not the LaTeX structure.
- Do NOT fake or invent any experience or achievements.
- Do NOT remove certifications if exist.
- Ensure the resume remains exactly 1 page filled.
- Do NOT add any new projects or new experiences.
- Only modify or optimize the content inside the existing projects/experience if needed.
- There should be no empty spaces in the resume.
- Keep everything in one single LaTeX code block.
- Do NOT alter LaTeX commands or structure.
- Do NOT change spacing; only adjust wording slightly (1 or 2 points) if necessary to fit.
- If there is still extra space remaining, add additional bullet points within existing projects or experiences based on the provided information.
`;
  } else {
    basePrompt += `
Please:
1. Improve the formatting and structure
2. Ensure all commands are correct
3. Add helpful comments where appropriate
4. Maintain the original content and meaning
5. Ensure the output is compilable and follows academic standards
`;
  }

  basePrompt += `
IMPORTANT:
- Do NOT wrap the output in markdown code blocks.
- Do NOT include \`\`\`latex or \`\`\`.
- The output must start directly with the LaTeX code (e.g., \\documentclass or the first line of the document).
`;

  if (retry) {
    return `
${context}

IMPORTANT: The previous output was not quite right. 
Please generate a DIFFERENT variation of the LaTeX code. 
Try alternative phrasings, slightly different structures, or different ways to highlight the same information. 
Make sure this version is distinct from the previous one in the conversation history.

${basePrompt}
`;
  }

  if (shouldContinue) {
    return `
${context}

Continue mode: Further improve and refine the LaTeX code based on previous modifications and any instructions provided above.

${basePrompt}
`;
  }

  return `
${context}

${basePrompt}
`;
}