import { GoogleGenAI } from "@google/genai";
import { AIActionType } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const performAIAction = async (
  action: AIActionType,
  text: string,
  context?: string
): Promise<string> => {
  const ai = getClient();
  const modelId = 'gemini-2.5-flash';

  let prompt = "";

  switch (action) {
    case AIActionType.SUMMARIZE:
      prompt = `Provide a concise summary of the following note content. Use bullet points if appropriate. \n\nContent:\n${text}`;
      break;
    case AIActionType.FIX_GRAMMAR:
      prompt = `Correct the grammar, spelling, and punctuation of the following text. Maintain the original tone and formatting as much as possible. Return ONLY the corrected text.\n\nText:\n${text}`;
      break;
    case AIActionType.CONTINUE_WRITING:
      prompt = `Continue writing the following text creatively and coherently. Keep the style consistent with the existing text. Write about 2-3 paragraphs max.\n\nText:\n${text}`;
      break;
    case AIActionType.GENERATE_TITLE:
      prompt = `Generate a short, punchy, and relevant title for the following note content. Return ONLY the title, no quotes.\n\nContent:\n${text}`;
      break;
    case AIActionType.MAKE_LONGER:
      prompt = `Expand upon the following text, adding more detail, examples, or explanation where appropriate. Keep the tone professional.\n\nText:\n${text}`;
      break;
    default:
      prompt = text;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please check your API key and try again.");
  }
};

// Streaming helper for "Continue Writing" to make it feel fast
export const streamAIContinuation = async (
  text: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  const ai = getClient();
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `Continue the following text naturally. Do not repeat the last sentence. \n\nText:\n${text}`;

  try {
    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: prompt,
    });

    for await (const chunk of response) {
       onChunk(chunk.text || "");
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
};
