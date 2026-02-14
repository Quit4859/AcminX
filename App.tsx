import React, { useState, useRef, useEffect } from 'react';
import { Message, GeneratedCode } from './types';
import { generateAppCode } from './services/gemini';
import Editor from './components/Editor';
import Preview from './components/Preview';

const BRAND_IMAGE_URL = "https://cdn.discordapp.com/attachments/1369330546811080836/1472193159382565096/1771068517646_1.png?ex=6991ae39&is=69905cb9&hm=8a4cb6811f0aa0e0a80e6688a2625191a3f6a8352c23f3acf18ec3dd744c65d1";

const BrandLogo = ({ className = "w-10 h-10" }) => (
  <img 
    src={BRAND_IMAGE_URL} 
    alt="Logo" 
    draggable="false"
    onContextMenu={(e) => e.preventDefault()}
    className={`${className} object-contain select-none mix-blend-screen pointer-events-none`}
    style={{ filter: 'brightness(1.2)' }}
  />
);

const MODELS = [
  { id: 'gemini-3-pro-preview', name: 'AcminX-o1 Max', color: 'bg-emerald-500' },
  { id: 'gemini-flash-lite-latest', name: 'AcminX-Lite', color: 'bg-blue-500' }
];

const PROMPT_TEMPLATES: Record<string, string> = {
  'Create Website': `Create a modern, responsive demo website with a clean and professional design.`,
  'Snake Game': `Create a fully functional Snake game with WASD controls and scoring.`,
  'Modern Calculator': `Create a functional calculator with a glassmorphism design.`
};

const FormattedMessage: React.FC<{ text: string, isUser: boolean }> = ({ text, isUser }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <div className={`whitespace-pre-wrap ${isUser ? '' : 'text-gray-300'}`}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return <strong key={i} className={`font-black ${isUser ? 'text-black' : 'text-white'}`}>{content}</strong>;
        }
        return part;
      })}
    </div>
  );
};

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleConnectGemini = async () => {
    try {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        onClose();
      }
    } catch (err) {
      console.error("Failed to open key selector:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Settings</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Manage API Credentials</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
           </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-between group">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                   <h3 className="font-black text-sm uppercase tracking-widest">Google Gemini</h3>
                   <p className="text-[10px] text-gray-500 font-bold">Paid Billing Project Required</p>
                </div>
             </div>
             <button onClick={handleConnectGemini} className="px-5 py-2.5 rounded-xl bg-white text-black text-[11px] font-black uppercase hover:bg-emerald-400 transition-all">
               Connect
             </button>
          </div>
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
             <p className="text-[11px] text-gray-500 leading-relaxed">
                To use the builder, you must select an API key. Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-emerald-500 underline">billing docs</a> for setup.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCode, setCurrentCode] = useState<GeneratedCode | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (hasStarted) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, hasStarted]);

  const handleGenerate = async (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt.trim() || isGenerating) return;

    if (!hasStarted) setHasStarted(true);

    const userMessage: Message = { role: 'user', content: finalPrompt };
    setHistory(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateAppCode(finalPrompt, history, selectedModel.id);
      setCurrentCode(result);
      setHistory(prev => [...prev, { role: 'assistant', content: result.explanation }]);
      setView('preview');
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        setError("API Key Error. Please connect in Settings.");
        setIsSettingsOpen(true);
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasStarted) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-y-auto">
        <nav className="h-20 border-b border-white/[0.08] flex items-center justify-between px-8 bg-black/40 backdrop-blur-3xl sticky top-0 z-[100]">
          <div className="flex items-center gap-4">
            <BrandLogo className="w-12 h-12" />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSettingsOpen(true)} className="text-sm font-semibold text-gray-400 hover:text-white transition-all">API Keys</button>
            <button className="bg-white text-black px-6 py-2.5 rounded-xl font-bold">Sign Up</button>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-32">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-center max-w-4xl leading-[0.85] bg-gradient-to-t from-gray-500 to-white bg-clip-text text-transparent">
            Build Anything Instantly.
          </h1>
          <div className="w-full max-w-3xl group">
            <form onSubmit={handleGenerate} className="bg-black/60 border border-white/10 rounded-[2.2rem] overflow-hidden focus-within:border-white/20">
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the application you want to build..."
                className="w-full bg-transparent px-8 py-8 text-xl outline-none resize-none min-h-[180px] placeholder:text-gray-600"
              />
              <div className="px-6 py-5 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                <button type="button" onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)} className="flex items-center gap-2 text-xs font-black text-gray-400 bg-white/[0.04] px-4 py-2 rounded-xl">
                  {selectedModel.name}
                </button>
                <button type="submit" className="p-4 rounded-2xl bg-white text-black">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
              </div>
            </form>
          </div>
        </main>
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden font-sans">
      <div className="w-[420px] flex-shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d] hidden md:flex">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <BrandLogo className="w-10 h-10" />
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth={2}/></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-5 py-4 rounded-2xl ${msg.role === 'user' ? 'bg-white text-black font-bold' : 'bg-white/[0.04] text-gray-300 border border-white/10'}`}>
                <FormattedMessage text={msg.content} isUser={msg.role === 'user'} />
              </div>
            </div>
          ))}
          {isGenerating && <div className="text-xs font-bold text-gray-500 animate-pulse">GENERATING...</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="p-6 border-t border-white/10">
          <form onSubmit={handleGenerate} className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Refine app..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4 pr-14 text-sm outline-none h-24"
            />
            <button type="submit" className="absolute bottom-4 right-4 p-3 bg-white text-black rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
          </form>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-white/10 flex items-center px-8 justify-between bg-[#0d0d0d]">
          <div className="flex bg-white/[0.04] rounded-lg p-1 border border-white/10">
            <button onClick={() => setView('preview')} className={`px-8 py-2 rounded-md text-xs font-black ${view === 'preview' ? 'bg-white text-black' : 'text-gray-500'}`}>PREVIEW</button>
            <button onClick={() => setView('code')} className={`px-8 py-2 rounded-md text-xs font-black ${view === 'code' ? 'bg-white text-black' : 'text-gray-500'}`}>CODE</button>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="px-4 py-2 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 transition-all">ADD API KEYS</button>
        </div>
        <div className="flex-1 relative">
          {view === 'code' ? <Editor code={currentCode?.html || ''} /> : <Preview html={currentCode?.html || ''} />}
        </div>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;