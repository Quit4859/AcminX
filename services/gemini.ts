import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCode, Message } from "../types";

const SYSTEM_INSTRUCTION = `You are an elite software architect and senior frontend engineer. 
Your goal is to build flawless, production-ready, standalone web applications based on user prompts.

### EXECUTION PROCESS:
1. ANALYZE: Carefully parse the user's request, identifying all functional and non-functional requirements.
2. PLAN: Mentally architect the application structure, state management, and UI components.
3. VERIFY: Check for logic flaws, edge cases (e.g., empty states, mobile responsiveness), and accessibility.
4. GENERATE: Produce the final, optimized code.

### TECHNICAL CONSTRAINTS:
- Output MUST be a SINGLE, COMPLETELY STANDALONE HTML file.
- Use <!DOCTYPE html>, <html>, <head>, and <body> tags.
- STYLING: Exclusively use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>.
- ICONS: Use Lucide icons: <script src="https://unpkg.com/lucide@latest"></script>. Initialize with lucide.createIcons() at the bottom of the body.
- LOGIC: All JavaScript must be inside a <script> tag. No external JS files.
- ASSETS: Use high-quality placeholder images (e.g., Unsplash) if needed.
- AESTHETICS: Modern dark-mode, glassmorphism, smooth animations (CSS transitions/keyframes), and professional typography (Inter/system-ui).

### OUTPUT FORMAT:
You MUST return a valid JSON object matching this schema:
{
  "html": "The full string content of the HTML file.",
  "explanation": "A concise summary of the architecture and features."
}`;

export const generateAppCode = async (prompt: string, history: Message[], model: string = "gemini-3-pro-preview"): Promise<GeneratedCode> => {
  try {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Initialization moved inside try to catch library-level initialization errors
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    
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
        // Only set thinkingBudget for supported Gemini 3/2.5 models
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

    // Access the .text property directly as per GenAI guidelines
    const text = response.text;
    if (!text) {
      throw new Error("The AI returned an empty response.");
    }
    
    const result = JSON.parse(text);
    if (!result.html) {
      throw new Error("Failed to extract HTML from the AI response.");
    }
    
    return result as GeneratedCode;
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    const msg = error?.message || "";
    
    // Explicitly handle API key errors and rename as requested by user
    // This catches variations like "An API Key must be set when running in a browser"
    if (
      msg.toLowerCase().includes("api key must be set") || 
      msg.toLowerCase().includes("key must be set") || 
      msg.toLowerCase().includes("api key not valid") ||
      msg.includes("API_KEY")
    ) {
      throw new Error("this is under Development");
    }

    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
    }

    if (msg.includes("500") || msg.includes("Rpc failed")) {
      throw new Error("The Acminx service is currently under high load. Please retry in a few seconds.");
    }
    
    throw new Error(msg || "An unexpected error occurred during generation.");
  }
};