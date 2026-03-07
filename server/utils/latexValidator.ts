import { z } from 'zod';

export function validateLaTeXCode(code: string) {
  // Basic LaTeX validation - check for document structure
  const trimmedCode = code.trim();

  // Check for minimal LaTeX structure
  const hasDocumentClass = /\\documentclass/.test(trimmedCode);
  const hasBeginDocument = /\\begin\s*\{\s*document\s*\}/.test(trimmedCode);
  const hasEndDocument = /\\end\s*\{\s*document\s*\}/.test(trimmedCode);

  // Check for common LaTeX patterns
  const hasMathMode = /\$[^$]+\$/.test(trimmedCode) || /\\\[.*?\\\]/.test(trimmedCode);
  const hasCommands = /\\[a-zA-Z]+/.test(trimmedCode);

  // Warning if structure seems incomplete but still process
  let message = '';
  let isValid = true;

  if (!hasDocumentClass && !hasBeginDocument && !hasEndDocument) {
    // Check if it's a minimal LaTeX snippet OR just plain text (which the AI will fix)
    if (!hasMathMode && !hasCommands) {
      message = 'This doesn\'t look like LaTeX code, but our AI will try to format it into LaTeX for you.';
      isValid = true; // Still allow processing for plain text
    } else {
      message = 'LaTeX code appears to be a snippet without full document structure';
    }
  }

  return {
    isValid,
    message,
  };
}

export function sanitizeLaTeXInput(code: string): string {
  // Remove potential harmful content
  return code
    .replace(/\\input\s*\{[^}]*\}/g, '') // Remove input commands
    .replace(/\\include\s*\{[^}]*\}/g, '') // Remove include commands
    .replace(/\\write18\s*\{[^}]*\}/g, '') // Remove shell escape
    .replace(/\\immediate\s+\\write18\s*\{[^}]*\}/g, ''); // Remove immediate shell escape
}

export function isCodeTooLarge(code: string): boolean {
  return code.length > 32 * 1024; // 32KB limit
}