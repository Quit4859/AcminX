
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message, GeneratedCode } from './types';
import { generateAppCode } from './services/gemini';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Onboarding from './components/Onboarding';

const BRAND_IMAGE_URL = "https://ik.imagekit.io/QUlight/1771068517646_1.png";

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
  'Create Website': `Create a modern, responsive demo website with a clean and professional design that includes a navigation bar, hero section, about section, services section, and contact form, features smooth scrolling and basic animations, is fully responsive across desktop and mobile devices, uses consistent typography and color styling, and includes well-structured, semantic HTML, organized CSS, and clean JavaScript for interactivity.`,
  'Snake Game': `Create a fully functional Snake game where the player controls the snake using the WASD keys, the snake moves continuously across a grid, food appears randomly and causes the snake to grow and increase the score when eaten, the game ends if the snake collides with itself (and optionally the wall), a Game Over message and final score are displayed, and a restart button resets the game state, all presented with a clean, modern, and responsive design.`,
  'Modern Calculator': `Create a fully functional calculator application with a clean, modern, and responsive design that allows users to perform basic arithmetic operations (addition, subtraction, multiplication, and division), supports keyboard and button input, displays the current input and result clearly, handles errors such as division by zero gracefully, and includes a clear/reset button to restart the calculation.`
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
  },
  { 
    id: 't4',
    title: "Glassmorphism Login", 
    desc: "A stunning frosted glass login component.", 
    category: "Components", 
    prompt: "Design a stunning glassmorphism login form with a vibrant mesh gradient background. Focus on high-quality frosted glass effects, subtle animations, and modern input fields.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
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
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
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

  const chatEndRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (hasStarted) {
      scrollToBottom();
    }
  }, [history, hasStarted]);

  const handleComingSoon = () => {
    alert("this is under Development");
  };

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
      setError(err.message || "An error occurred");
      setHistory(prev => [...prev, { role: 'assistant', content: "Failed to generate code. Please try again." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const useTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    promptInputRef.current?.focus();
    promptInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleNavClick = (target: 'Templates' | 'Pricing' | 'FAQ') => {
    const refs = {
      Templates: templatesRef,
      Pricing: pricingRef,
      FAQ: faqRef
    };
    refs[target].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMobileMenuOpen(false);
  };

  const navLinks = ['Templates', 'Pricing', 'FAQ'] as const;
  const tabs = ['Apps and Games', 'Landing Pages', 'Components', 'Dashboards'];
  const filteredTemplates = TEMPLATES.filter(t => t.category === activeTab);

  if (!hasStarted) {
    return (
      <div className={`h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-white/20 overflow-y-auto overflow-x-hidden scroll-smooth`}>
        {/* Top Navigation */}
        <nav className="h-20 flex-shrink-0 border-b border-white/[0.08] flex items-center justify-between px-6 md:px-8 bg-black/40 backdrop-blur-3xl sticky top-0 z-[100] transition-all">
          <div className="flex items-center gap-10">
            <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BrandLogo className="w-12 h-12" />
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <button 
                  key={link} 
                  onClick={() => handleNavClick(link)}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 md:gap-4">
              <button onClick={handleComingSoon} className="text-sm font-semibold text-gray-400 hover:text-white transition-all px-4 py-2 rounded-lg hover:bg-white/5">Sign In</button>
              <button onClick={handleComingSoon} className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/10">Sign Up</button>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[90] bg-black pt-24 px-6 flex flex-col gap-6 lg:hidden animate-in fade-in duration-300">
             {navLinks.map(link => (
                <button key={link} onClick={() => handleNavClick(link)} className="text-2xl font-black text-left py-4 border-b border-white/5">{link}</button>
             ))}
             <button onClick={handleComingSoon} className="w-full py-4 rounded-xl bg-white text-black font-bold mt-4">Sign Up</button>
          </div>
        )}

        {/* Hero Section */}
        <main className="flex-shrink-0 flex flex-col items-center justify-center px-6 pt-24 pb-32 relative min-h-[85vh] overflow-hidden">
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
             <BrandLogo className="w-[80vw] h-auto opacity-[0.03] transform -translate-y-12 rotate-[-5deg] scale-125" />
           </div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-white/[0.05] to-transparent rounded-full blur-[120px] pointer-events-none z-0" />
           <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-1" />

           <div className="mb-14 relative z-10">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-colors cursor-default">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-pulse" />
                <span className="text-[13px] font-semibold text-gray-300 tracking-wide">Now powered by {selectedModel.name}</span>
              </div>
           </div>

          <h1 className="text-5xl md:text-7xl lg:text-[7.5rem] font-black mb-8 tracking-tighter text-center max-w-5xl leading-[0.85] flex flex-col items-center relative z-10 select-none">
            <span className="bg-gradient-to-t from-[#111] via-white to-white bg-clip-text text-transparent">Build Anything</span>
            <span className="mt-2 block bg-gradient-to-t from-[#111] via-white to-white bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>Instantly.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mb-16 leading-relaxed font-medium mt-4 relative z-10">
            Acminx is the advanced AI software engineer that turns your prompts into production-ready, full-stack applications in seconds.
          </p>

          <div className="w-full max-w-3xl relative z-10 group px-4 mb-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[2.5rem] blur opacity-30 group-focus-within:opacity-60 transition duration-1000" />
            <form onSubmit={handleGenerate} className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden focus-within:border-white/20 transition-all duration-500">
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the application you want to build..."
                className="w-full bg-transparent px-8 py-8 text-lg md:text-xl outline-none resize-none min-h-[160px] md:min-h-[180px] placeholder:text-gray-600 leading-relaxed font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate(e);
                  }
                }}
              />
              <div className="px-6 py-5 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                <div className="relative">
                  <button type="button" onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)} className="flex items-center gap-2.5 text-xs font-black text-gray-400 hover:text-white bg-white/[0.04] px-4 py-2.5 rounded-xl border border-white/[0.05] transition-all hover:bg-white/[0.08]">
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedModel.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}></div>
                    {selectedModel.name}
                    <svg className={`w-4 h-4 opacity-40 transition-transform ${isModelSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  {isModelSelectorOpen && (
                    <div className="absolute bottom-full left-0 mb-3 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {MODELS.map((model) => (
                        <button key={model.id} type="button" onClick={() => { setSelectedModel(model); setIsModelSelectorOpen(false); }} className={`w-full px-5 py-3.5 text-left text-xs font-bold transition-all flex items-center gap-3 hover:bg-white/5 ${selectedModel.id === model.id ? 'text-white bg-white/[0.02]' : 'text-gray-500 hover:text-gray-300'}`}>
                          <div className={`w-2 h-2 rounded-full ${model.color}`}></div>
                          {model.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={!prompt.trim()} className="p-4 rounded-2xl bg-white text-black hover:bg-white/90 disabled:bg-white/5 disabled:text-white/20 transition-all active:scale-90 shadow-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-12">
               {Object.keys(PROMPT_TEMPLATES).map(chip => (
                 <button 
                  key={chip} 
                  onClick={() => { setPrompt(PROMPT_TEMPLATES[chip]); promptInputRef.current?.focus(); }}
                  className="px-5 md:px-6 py-3 md:py-3.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] md:text-xs font-bold text-gray-400 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all flex items-center gap-2 md:gap-2.5 backdrop-blur-xl active:scale-95 group"
                 >
                   <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-emerald-500 transition-colors"></div>
                   {chip}
                 </button>
               ))}
            </div>
          </div>
        </main>

        {/* Templates Section */}
        <section ref={templatesRef} className="flex-shrink-0 px-6 md:px-8 py-32 md:py-40 bg-[#0a0a0a] relative border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase italic text-white">Start with a template</h2>
                <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">Jumpstart your project with our pre-built high-quality structures designed for scale.</p>
              </div>
              <div className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                <div className="flex bg-white/[0.02] border border-white/10 rounded-2xl p-2 shrink-0 backdrop-blur-xl shadow-2xl">
                  {tabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 md:px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-gray-500'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredTemplates.map((item) => (
                <div key={item.id} onClick={() => useTemplate(item.prompt)} className="group cursor-pointer bg-white/[0.01] border border-white/[0.06] rounded-[2rem] overflow-hidden hover:border-white/20 transition-all duration-700 hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.8)] hover:-translate-y-3">
                   <div className="aspect-video w-full bg-[#0d0d0d] border-b border-white/[0.06] flex items-center justify-center">
                     <div className="w-20 md:w-24 h-20 md:h-24 rounded-[1.5rem] bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-600 group-hover:text-white transition-all shadow-inner group-hover:scale-110 duration-500">
                       {item.icon}
                     </div>
                   </div>
                   <div className="p-8 md:p-12">
                     <h3 className="text-xl md:text-2xl font-black text-gray-100 flex items-center justify-between uppercase">
                       {item.title}
                       <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-500">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 12 12)"/></svg>
                       </div>
                     </h3>
                     <p className="text-base md:text-lg text-gray-500 mt-4 leading-relaxed font-medium">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} className="flex-shrink-0 px-6 md:px-8 py-32 md:py-40 bg-[#0a0a0a] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-24">
                <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter text-white">Simple Pricing</h2>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">Build the future of the web with plans tailored for every stage of development.</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hobby */}
                <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col hover:bg-white/[0.04] transition-all">
                   <h3 className="text-xl font-bold mb-2">Hobby</h3>
                   <p className="text-gray-500 text-sm mb-8">For personal experimentation and learning.</p>
                   <div className="text-5xl font-black mb-8">$0<span className="text-lg text-gray-600 ml-2 font-medium">/mo</span></div>
                   <ul className="space-y-4 mb-12 flex-1">
                      {['5 Apps per month', 'Basic AI Models', 'Community Support', 'Standard Rendering'].map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-gray-400"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>{f}</li>
                      ))}
                   </ul>
                   <button onClick={handleComingSoon} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">Sign Up Free</button>
                </div>

                {/* Pro tier */}
                <div className="p-10 rounded-[2.5rem] bg-white border border-white flex flex-col transform lg:-translate-y-4 shadow-2xl shadow-white/10 relative">
                   <div className="inline-flex items-center self-start px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase mb-4 tracking-widest">Recommended</div>
                   <h3 className="text-xl font-bold mb-2 text-black">Pro</h3>
                   <p className="text-gray-600 text-sm mb-8">For developers building production apps.</p>
                   <div className="text-5xl font-black mb-8 text-black">$20<span className="text-lg text-gray-400 ml-2 font-medium">/mo</span></div>
                   <ul className="space-y-4 mb-12 flex-1">
                      {['Unlimited Apps', 'AcminX-Logic Model', 'Priority Support', 'Advanced Code Export', 'Custom Branding'].map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-gray-700 font-medium"><svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>{f}</li>
                      ))}
                   </ul>
                   <button onClick={handleComingSoon} className="w-full py-4 rounded-2xl bg-black text-white font-bold hover:bg-black/90 transition-all shadow-xl">Get Pro</button>
                </div>

                {/* Team */}
                <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col hover:bg-white/[0.04] transition-all">
                   <h3 className="text-xl font-bold mb-2">Team</h3>
                   <p className="text-gray-500 text-sm mb-8">For teams scaling software fast.</p>
                   <div className="text-5xl font-black mb-8">Custom</div>
                   <ul className="space-y-4 mb-12 flex-1">
                      {['Collaborative Workspace', 'API Access', 'SSO & Dedicated Support', 'Custom Model Tuning'].map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-gray-400"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>{f}</li>
                      ))}
                   </ul>
                   <button onClick={handleComingSoon} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">Contact Sales</button>
                </div>
             </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="flex-shrink-0 px-6 md:px-8 py-32 md:py-40 bg-[#0a0a0a] border-t border-white/5">
          <div className="max-w-3xl mx-auto">
             <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase italic tracking-tighter text-white">Frequently Asked Questions</h2>
                <p className="text-gray-500 text-lg">Everything you need to know about AcminX.</p>
             </div>

             <div className="space-y-2">
                <FAQAccordion 
                  question="How does AcminX generate code?" 
                  answer="AcminX uses advanced reasoning models to architect and write full-stack frontend code. It translates your natural language requirements into optimized HTML, CSS (via Tailwind), and JavaScript within a single standalone structure." 
                />
                <FAQAccordion 
                  question="Do I own the generated code?" 
                  answer="Yes, absolutely. Any code generated by AcminX belongs to you. You can export it, modify it, and use it for commercial or personal projects without restriction." 
                />
                <FAQAccordion 
                  question="Is it possible to edit apps after generation?" 
                  answer="Yes! AcminX is conversational. You can prompt the AI to 'add a sidebar', 'change the colors to blue', or 'fix the mobile responsiveness' at any time." 
                />
                <FAQAccordion 
                  question="Does AcminX support React?" 
                  answer="The core builder currently generates high-quality standalone HTML/JS structures that are easy to port to any framework. We are actively working on dedicated React/Next.js export options." 
                />
                <FAQAccordion 
                  question="Is there a limit on what I can build?" 
                  answer="If you can describe it, AcminX can attempt to build it. From complex dashboards to interactive games, our system is designed to handle high-level logic and sophisticated UI patterns." 
                />
             </div>
          </div>
        </section>

        <footer className="flex-shrink-0 p-16 md:p-24 border-t border-white/[0.04] text-center mt-auto bg-black/20">
          <div className="flex items-center justify-center mx-auto mb-8 overflow-hidden">
            <BrandLogo className="w-20 h-20" />
          </div>
          <p className="text-[10px] md:text-[11px] text-gray-700 uppercase tracking-[0.6em] font-black opacity-60 px-4">Powered by AcminX & {selectedModel.name} System</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden selection:bg-emerald-500/20">
      <div className="hidden md:flex w-[420px] flex-shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d] z-10 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <button onClick={() => setHasStarted(false)} className="w-12 h-12 flex items-center justify-center hover:scale-110 transition-all active:scale-95 overflow-hidden">
              <BrandLogo className="w-12 h-12" />
            </button>
            <h1 className="font-black text-xs tracking-[0.25em] text-gray-500 uppercase">Workspace</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded uppercase tracking-[0.1em]">Live</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin bg-black/10">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-6 py-5 rounded-[1.5rem] text-[15px] leading-relaxed shadow-2xl ${msg.role === 'user' ? 'bg-white text-black font-bold shadow-black/40' : 'bg-white/[0.04] text-gray-300 border border-white/10 backdrop-blur-xl'}`}>
                <FormattedMessage text={msg.content} isUser={msg.role === 'user'} />
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-white/[0.04] px-6 py-5 rounded-[1.5rem] border border-white/10 flex items-center gap-4 backdrop-blur-xl">
                <div className="w-5 h-5 border-[3px] border-white/10 border-t-white rounded-full animate-spin"></div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">{selectedModel.name} is building...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-3xl">
          {error && <p className="text-red-500 text-[10px] mb-5 font-black uppercase tracking-[0.2em] px-2">{error}</p>}
          <form onSubmit={handleGenerate} className="relative">
            <textarea
              ref={promptInputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Refine your application..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-[1.8rem] px-7 py-6 pr-16 text-[15px] focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[110px] max-h-[300px] resize-none leading-relaxed transition-all placeholder:text-gray-700 font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate(e);
                }
              }}
            />
            <div className="absolute bottom-5 left-5">
               <button type="button" onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)} className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white transition-all bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedModel.color}`}></div>
                  {selectedModel.name}
                </button>
            </div>
            <button type="submit" disabled={isGenerating || !prompt.trim()} className="absolute bottom-5 right-5 p-4 rounded-2xl bg-white text-black hover:bg-white/90 disabled:bg-white/5 disabled:text-white/20 transition-all active:scale-90 shadow-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        <div className="md:hidden p-4 border-b border-white/10 flex items-center justify-between bg-[#0d0d0d]">
          <button onClick={() => setHasStarted(false)} className="w-12 h-12 flex items-center justify-center overflow-hidden active:scale-95">
            <BrandLogo className="w-10 h-10" />
          </button>
          <div className="flex bg-white/[0.04] rounded-lg p-1 border border-white/10">
            <button onClick={() => setView('preview')} className={`px-4 py-1.5 rounded-md text-[10px] font-black ${view === 'preview' ? 'bg-white text-black' : 'text-gray-500'}`}>PREVIEW</button>
            <button onClick={() => setView('code')} className={`px-4 py-1.5 rounded-md text-[10px] font-black ${view === 'code' ? 'bg-white text-black' : 'text-gray-500'}`}>CODE</button>
          </div>
        </div>

        <div className="hidden md:flex h-16 border-b border-white/10 bg-[#0d0d0d] items-center px-8 justify-between bg-black/40 backdrop-blur-2xl">
          <div className="flex bg-white/[0.04] rounded-[0.9rem] p-1 border border-white/10 shadow-inner">
            <button onClick={() => setView('preview')} className={`px-8 py-2 rounded-[0.6rem] text-xs font-black transition-all ${view === 'preview' ? 'bg-white text-black shadow-2xl shadow-white/5' : 'text-gray-500 hover:text-gray-300'}`}>PREVIEW</button>
            <button onClick={() => setView('code')} className={`px-8 py-2 rounded-[0.6rem] text-xs font-black transition-all ${view === 'code' ? 'bg-white text-black shadow-2xl shadow-white/5' : 'text-gray-500 hover:text-gray-300'}`}>CODE</button>
          </div>
          
          <div className="flex items-center gap-6 relative">
            <div className="text-[11px] font-black text-gray-500 bg-white/[0.04] px-5 py-2 rounded-xl border border-white/10 font-mono tracking-[0.2em] uppercase">
              ENGINE: <span className="text-white">{selectedModel.name}</span>
            </div>
            <button onClick={handleComingSoon} className="px-5 py-2.5 bg-white text-black text-xs font-black rounded-xl hover:bg-gray-200 transition-all active:scale-95 uppercase">this is under Development</button>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden bg-black/30">
          {view === 'code' ? (
            <Editor code={currentCode?.html || '<!-- No code generated yet. Describe something in the chat to start. -->'} />
          ) : (
            <Preview html={currentCode?.html || ''} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
