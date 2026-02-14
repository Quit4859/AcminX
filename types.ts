
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GeneratedCode {
  html: string;
  css?: string;
  javascript?: string;
  explanation: string;
}

export interface AppState {
  prompt: string;
  isGenerating: boolean;
  history: Message[];
  currentCode: GeneratedCode | null;
  error: string | null;
}
