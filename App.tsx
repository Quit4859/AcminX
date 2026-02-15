import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  { id: 'gemini-3-pro-preview', name: 'AcminX-Logic', color: 'bg-emerald-500' },
  { id: 'gemini-flash-lite-latest', name: 'AcminX-Lite', color: 'bg-blue-500' }
];

const PROMPT_TEMPLATES: Record<string, string> = {
  'Create Website': `Create a modern, responsive demo website with a clean and professional design that includes a navigation bar, hero section, about section, services section, and contact form...`,
  'Snake Game': `Create a fully functional Snake game where the player controls the snake using the WASD keys...`,
  'Modern Calculator': `Create a fully functional calculator application with a clean, modern, and responsive design...`
};

const TEMPLATES = [
  { 
    id: 't1',
    title: "Space Invaders Clone", 
    desc: "A classic retro arcade game built with Canvas API.", 
    category: "Apps and Games", 
    prompt: "Build a classic Space Invaders game using HTML5 Canvas. Include a score system, multiple levels of difficulty, and retro sound effects placeholders.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    )
  },
  { 
    id: 't2',
    title: "AI SaaS Landing", 
    desc: "Modern landing page for an AI productivity tool.", 
    category: "Landing Pages", 
    prompt: "Create a modern, dark-themed SaaS landing page for an AI productivity tool. Include a hero section with a gradient call-to-action, a features bento grid, and a pricing table.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    id: 't3',
    title: "Analytics Dashboard", 
    desc: "Real-time data visualization with Chart.js.", 
    category: "Dashboards", 
    prompt: "Build a comprehensive analytics dashboard with real-time charts using Chart.js. Include a sidebar for navigation, key metric cards (active users, revenue, conversion), and a detailed data table.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v16a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

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

const FAQAccordion: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex items-center justify-between text-left group">
        <span className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">{question}</span>
        <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v12m6-6H6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] pb-6' : 'max-h-0'}`}>
        <p className="text-gray-400 leading-relaxed">{answer}</p>
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
  const [activeTab, setActiveTab] = useState('Apps and Games');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const checkKey = useCallback(async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeySelected(hasKey);
      return hasKey;
    }
    return !!process.env.API_KEY;
  }, []);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setIsKeySelected(true); // Assume success per guidelines
    } else {
      alert("API Key management is not available in this environment. Please set process.env.API_KEY.");
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (hasStarted) scrollToBottom();
  }, [history, hasStarted]);

  const handleGenerate = async (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt.trim() || isGenerating) return;

    // Check for key first
    const hasKey = await checkKey();
    if (!hasKey) {
      setError("Please configure your Gemini API Key before generating.");
      await handleOpenKeyDialog();
      return;
    }

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
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key project mismatch. Please re-select your key.");
        setIsKeySelected(false);
        await handleOpenKeyDialog();
      } else {
        setError(err.message || "An error occurred");
      }
      setHistory(prev => [...prev, { role: 'assistant', content: `Generation failed: ${err.message}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComingSoon = () => alert("Coming Soon!");

  const handleNavClick = (target: 'Templates' | 'Pricing' | 'FAQ') => {
    const refs = { Templates: templatesRef, Pricing: pricingRef, FAQ: faqRef };
    refs[target].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMobileMenuOpen(false);
  };

  if (!hasStarted) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-white/20 overflow-y-auto scroll-smooth">
        <nav className="h-20 flex-shrink-0 border-b border-white/[0.08] flex items-center justify-between px-6 md:px-8 bg-black/40 backdrop-blur-3xl sticky top-0 z-[100]">
          <div className="flex items-center gap-10">
            <BrandLogo className="w-12 h-12 cursor-pointer" />
            <div className="hidden lg:flex items-center gap-8">
              {['Templates', 'Pricing', 'FAQ'].map(link => (
                <button key={link} onClick={() => handleNavClick(link as any)} className="text-sm font-medium text-gray-400 hover:text-white transition-all">{link}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isKeySelected && (
              <button 
                onClick={handleOpenKeyDialog}
                className="hidden sm:flex items-center gap-2 text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/20 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                SETUP API KEY
              </button>
            )}
            <button onClick={handleComingSoon} className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all">Get Started</button>
          </div>
        </nav>

        <main className="flex-shrink-0 flex flex-col items-center justify-center px-6 pt-24 pb-32 relative min-h-[85vh]">
          <h1 className="text-5xl md:text-7xl lg:text-[7.5rem] font-black mb-8 tracking-tighter text-center max-w-5xl leading-[0.85]">
            <span className="bg-gradient-to-t from-[#111] via-white to-white bg-clip-text text-transparent">Build Anything</span>
            <span className="mt-2 block bg-gradient-to-t from-[#111] via-white to-white bg-clip-text text-transparent">Instantly.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mb-16 leading-relaxed">
            AcminX is the advanced AI software engineer that turns your prompts into production-ready applications.
          </p>

          <div className="w-full max-w-3xl relative z-10 group px-4">
            <form onSubmit={handleGenerate} className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.2rem] shadow-2xl focus-within:border-white/20 transition-all">
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the application you want to build..."
                className="w-full bg-transparent px-8 py-8 text-lg outline-none resize-none min-h-[160px] placeholder:text-gray-600 font-medium"
              />
              <div className="px-6 py-5 flex items-center justify-between border-t border-white/5">
                <button type="button" onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)} className="flex items-center gap-2.5 text-xs font-black text-gray-400 hover:text-white bg-white/[0.04] px-4 py-2.5 rounded-xl border border-white/[0.05]">
                  <div className={`w-2.5 h-2.5 rounded-full ${selectedModel.color}`}></div>
                  {selectedModel.name}
                </button>
                <button type="submit" disabled={!prompt.trim()} className="p-4 rounded-2xl bg-white text-black hover:bg-white/90 disabled:bg-white/5 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors uppercase font-black tracking-widest">Billing Documentation & Key Setup</a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
      <div className="hidden md:flex w-[420px] flex-shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d] z-10">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <BrandLogo className="w-10 h-10 cursor-pointer" />
          <div className="flex items-center gap-2">
            {!isKeySelected && (
              <button onClick={handleOpenKeyDialog} className="text-[9px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20">NO KEY</button>
            )}
            <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded uppercase">Live</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-black/10">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-6 py-5 rounded-[1.5rem] text-[15px] ${msg.role === 'user' ? 'bg-white text-black font-bold' : 'bg-white/[0.04] text-gray-300 border border-white/10'}`}>
                <FormattedMessage text={msg.content} isUser={msg.role === 'user'} />
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-white/[0.04] px-6 py-5 rounded-[1.5rem] border border-white/10 flex items-center gap-4 animate-pulse">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Building Application...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-6 border-t border-white/10 bg-black/40">
          {error && <p className="text-red-500 text-[10px] mb-4 font-black uppercase tracking-widest px-2">{error}</p>}
          <form onSubmit={handleGenerate} className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Refine your application..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-[1.8rem] px-7 py-6 pr-16 text-[15px] focus:outline-none min-h-[110px] resize-none leading-relaxed"
            />
            <button type="submit" disabled={isGenerating || !prompt.trim()} className="absolute bottom-5 right-5 p-4 rounded-2xl bg-white text-black hover:bg-white/90 disabled:bg-white/5 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex h-16 border-b border-white/10 bg-[#0d0d0d] items-center px-8 justify-between">
          <div className="flex bg-white/[0.04] rounded-[0.9rem] p-1 border border-white/10 shadow-inner">
            <button onClick={() => setView('preview')} className={`px-8 py-2 rounded-[0.6rem] text-xs font-black transition-all ${view === 'preview' ? 'bg-white text-black' : 'text-gray-500'}`}>PREVIEW</button>
            <button onClick={() => setView('code')} className={`px-8 py-2 rounded-[0.6rem] text-xs font-black transition-all ${view === 'code' ? 'bg-white text-black' : 'text-gray-500'}`}>CODE</button>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleOpenKeyDialog} className="text-[10px] font-black text-gray-500 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeWidth={2}/></svg>
              API KEY
            </button>
            <button onClick={handleComingSoon} className="px-5 py-2.5 bg-white text-black text-xs font-black rounded-xl hover:bg-gray-200 transition-all">DEPLOY</button>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden bg-black/30">
          {view === 'code' ? (
            <Editor code={currentCode?.html || '<!-- No code generated yet -->'} />
          ) : (
            <Preview html={currentCode?.html || ''} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;