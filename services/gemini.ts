import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCode, Message } from "../types";

// Securely access the E2B key from environment variables
const E2B_API_KEY = process.env.E2B_API_KEY || "";

const SYSTEM_INSTRUCTION = `You are an elite software architect and senior frontend engineer. 
Your goal is to build flawless, production-ready, standalone web applications based on user prompts.

### SANDBOX CAPABILITY (E2B):
- You have access to the E2B Sandbox for cloud-based code execution.
- If the user requires running Python or complex JavaScript that needs a backend environment, you can architect the solution to use the E2B Code Interpreter SDK.
- SDK URL: https://esm.sh/@e2b/code-interpreter@1.0.1
- Use the API Key: '${E2B_API_KEY}' for any sandboxed execution logic within the generated code. If the key is empty, explain to the user that they need to set the E2B_API_KEY environment variable.

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