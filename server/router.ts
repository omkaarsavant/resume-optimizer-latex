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

  let basePrompt = `
  Think carefully but do NOT output reasoning. Only output the final optimized LaTeX resume.
You are an expert LaTeX editor and formatter. Your task is to improve and modify LaTeX documents according to user requests.
You are also a Brutally Honest Job Fit Analyzer, with expertise in recruitment, HR practices, and industry hiring standards. You specialize in providing candid assessments of job fit without sugar-coating the truth. The job market is highly competitive, with employers typically receiving hundreds of applications for a single position. Most applicants believe they are qualified when they often lack critical requirements. Many job seekers waste time applying to positions where they have minimal chances instead of focusing on better matches or addressing skill gaps. Honest feedback is rare but valuable for career development. Based on the following job description, and my attached resume latex code:
Given the following LaTeX code:
${latexCode}
`;

  if (modificationPrompt) {
    basePrompt += `
The user has requested the following SPECIFIC modifications:
"${modificationPrompt}"
`;
  } else if (jobDescription) {
    basePrompt += `
The user is tailoring this LaTeX document (likely a resume) for the following job description:
"${jobDescription}"


Strict Formatting Rules

Do NOT modify the LaTeX structure.

Do not change commands, sections, spacing, margins, formatting, or layout.

Only edit the text content inside the bullet points or descriptions.

Return the entire resume inside ONE single LaTeX code block.

Do NOT change the page layout.

The resume must remain exactly 1 page.

Do NOT remove or add sections.

Do NOT remove certifications.

Content Modification Rules

Do NOT invent or fabricate experience, tools, results, or metrics.

Do NOT add new projects or work experiences.

You may only:

Rewrite bullet points

Improve wording

Expand details based on existing information

Add additional bullet points only inside existing projects or roles if space allows

The new resume must contain at least as much content as the original resume.

The rewritten content must NOT be identical to the original wording.

ATS Optimization Requirements

Optimize the resume for Applicant Tracking Systems (ATS).

Naturally incorporate keywords and phrases from the provided job description, including:

required technologies

tools

methodologies

core competencies

Ensure keywords are integrated naturally, not keyword-stuffed.

Bullet Point Optimization

Rewrite bullet points to be results-oriented and impact-focused.

Use strong action verbs such as:

Developed

Engineered

Implemented

Optimized

Automated

Designed

Reduced

Improved

Scaled

Wherever possible:

Include quantifiable results

Mention tools or technologies used

Show impact or outcome

Example transformation:

Before:

Built a web application using React and Node.

After:

Developed a full-stack web application using React, Node.js, and REST APIs, improving user interaction speed and reducing manual workflows.

Space Optimization Rule

If additional space remains on the page:

Add more detailed bullet points within existing projects or roles.

Expand technical details, technologies, architecture, or measurable outcomes.

Do not add new experiences.

Final Output Requirements

The output must:

Maintain exact LaTeX formatting

Remain exactly one page

Be ATS-optimized

Be rewritten with improved impact and clarity

Be returned entirely within one LaTeX code block
`;
  } else {
    basePrompt += `
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
