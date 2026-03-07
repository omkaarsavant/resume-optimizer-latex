import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiClient: any = null;

export async function getGeminiClient() {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`Initializing Gemini client with model: gemini-3.1-flash-lite-preview`);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
  });

  geminiClient = {
    async generateContent(prompt: string, options?: { temperature?: number }) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8000,
          },
        });

        const response = await result.response;
        const text = response.text();

        return {
          text: text,
        };
      } catch (error) {
        console.error("Error generating content:", error);
        throw error;
      }
    },
  };

  return geminiClient;
}

export function resetGeminiClient() {
  geminiClient = null;
}