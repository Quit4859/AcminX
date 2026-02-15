import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCode, Message } from "../types";

const SYSTEM_INSTRUCTION = `You are an elite software architect and senior frontend engineer. 
Your goal is to build flawless, production-ready, standalone web applications based on user prompts.

### OUTPUT FORMAT:
You MUST return a valid JSON object matching this schema:
{
  "html": "The full string content of the HTML file.",
  "explanation": "A concise summary of the architecture and features."
}`;

export const generateAppCode = async (prompt: string, history: Message[], model: string = "gemini-3-pro-preview"): Promise<GeneratedCode> => {
  // Use the API key exclusively from process.env.API_KEY.
  // In this environment, it is populated after window.aistudio.openSelectKey() is called.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please click 'Configure API Key' to set up your paid project credentials.");
  }

  // Always create a new instance right before the call to ensure the latest key is used.
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const isThinkingModel = model.includes('gemini-3') || model.includes('gemini-2.5');
    
    const response = await ai.models.generateContent({
      model: model, 
      contents: [
        ...history.map(m => ({ 
          role: m.role === 'assistant' ? 'model' : 'user', 
          parts: [{ text: m.content }] 
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        ...(isThinkingModel ? { thinkingConfig: { thinkingBudget: 16000 } } : {}),
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["html", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI engine.");
    }
    
    return JSON.parse(text) as GeneratedCode;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    if (error?.message?.includes("API key not valid") || error?.message?.includes("An API Key must be set")) {
      throw new Error("Your API Key is invalid or expired. Please re-configure it via the Settings.");
    }

    if (error?.message?.includes("Requested entity was not found")) {
      throw new Error("Requested entity was not found. This often means your API key project is not linked to Gemini models. Please re-select a paid project key.");
    }
    
    throw new Error(error.message || "An unexpected error occurred during code generation.");
  }
};