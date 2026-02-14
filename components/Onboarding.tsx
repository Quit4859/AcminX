import React from 'react';

const Onboarding: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 overflow-y-auto h-full scrollbar-thin pb-20">
      {/* Header Section */}
      <div className="mb-12">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">
          v1.0.0 Stable
        </div>
        <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
          🚀 AcminX — Intelligent App Builder
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed font-light">
          AcminX is a powerful open-source platform designed to turn natural language into fully functional, production-ready web applications. 
          Build dynamic, data-aware apps simply by describing what you want — <span className="text-emerald-400 font-medium">no complex setup, no rigid workflows.</span>
        </p>
      </div>

      {/* Intro Section */}
      <section className="mb-12 border-l-2 border-emerald-500/30 pl-6 py-2">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">🌐 What is AcminX?</h2>
        <p className="text-gray-400 leading-relaxed">
          AcminX transforms your ideas into modern web applications using AI-driven generation and live web intelligence. 
          Just describe your app, and AcminX builds it with clean architecture and scalable design patterns.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            "Conversational dev",
            "Real-time data",
            "Production code",
            "Iterative refinement"
          ].map((item, i) => (
            <div key={i} className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg text-xs font-bold text-emerald-500 text-center uppercase tracking-tighter">
              🔹 {item}
            </div>
          ))}
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-8 flex items-center gap-3">
          <span className="text-emerald-500 text-3xl">✨</span> Core Capabilities
        </h2>
        
        <div className="space-y-6">
          {/* Capability 01 */}
          <div className="bg-[#111] border border-[#222] p-8 rounded-2xl hover:border-emerald-500/30 transition-all group">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="text-5xl font-black text-[#222] group-hover:text-emerald-500/20 transition-colors">01</div>
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-3 uppercase tracking-wide">🧠 Natural Language App Generation</h3>
                <p className="text-gray-400 mb-4">Describe your application in plain English and receive structured, scalable React + Tailwind code instantly.</p>
                <div className="flex flex-wrap gap-2">
                  {["Crypto Dashboard", "SaaS Landing Page", "Admin Analytics", "Student Portals"].map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 bg-black rounded border border-[#333] text-gray-500 font-mono">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Capability 02 */}
          <div className="bg-[#111] border border-[#222] p-8 rounded-2xl hover:border-blue-500/30 transition-all group">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="text-5xl font-black text-[#222] group-hover:text-blue-500/20 transition-colors">02</div>
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-3 uppercase tracking-wide">🔎 Intelligent Web Data Integration</h3>
                <p className="text-gray-400 mb-4">AcminX can retrieve, structure, and interpret web content to power your applications with real-world data.</p>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">✓ Automated extraction</li>
                  <li className="flex items-center gap-2">✓ Structured parsing</li>
                  <li className="flex items-center gap-2">✓ Contextual responses</li>
                  <li className="flex items-center gap-2">✓ Live UI generation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Capability 03 */}
          <div className="bg-[#111] border border-[#222] p-8 rounded-2xl hover:border-purple-500/30 transition-all group">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="text-5xl font-black text-[#222] group-hover:text-purple-500/20 transition-colors">03</div>
              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-3 uppercase tracking-wide">🔄 Iterative, Conversational Development</h3>
                <p className="text-gray-400 mb-4">Build your app step-by-step through conversation. No restarting. Just continuous evolution.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  <span>• Fix bugs</span>
                  <span>• Add features</span>
                  <span>• Refactor UI</span>
                  <span>• Performance</span>
                  <span>• Design Adjust</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <section className="bg-[#0d0d0d] border border-[#222] p-6 rounded-xl">
          <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            🏗 Architecture Philosophy
          </h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="text-emerald-500">→</span> 
              <span>Modular component structures</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500">→</span> 
              <span>Clean state management</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500">→</span> 
              <span>Scalable routing systems</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500">→</span> 
              <span>Production-focused code standards</span>
            </li>
          </ul>
        </section>

        <section className="bg-[#0d0d0d] border border-[#222] p-6 rounded-xl">
          <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            💡 What You Can Build
          </h2>
          <div className="flex flex-wrap gap-2">
            {["Financial Dashboards", "Edu Platforms", "E-commerce", "Analytics Portals", "AI SaaS Tools", "Responsive Apps"].map((item, i) => (
              <span key={i} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-[11px] font-medium text-blue-300 border border-[#333]">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500 italic">If you can describe it — you can build it.</p>
        </section>
      </div>

      {/* Example Prompt */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-emerald-400 mb-4 uppercase tracking-tighter">⚡ Example Prompt</h2>
          <p className="text-lg text-gray-200 font-medium italic mb-6">
            “Build a crypto dashboard with live price cards, trending coins, portfolio tracker, and dark mode toggle.”
          </p>
          <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-emerald-500/20"></div>
             <p className="text-xs text-emerald-500/60 font-mono uppercase">Results in seconds</p>
             <div className="h-px flex-1 bg-emerald-500/20"></div>
          </div>
        </div>
      </section>

      {/* Final Why Section */}
      <section className="text-center">
        <h2 className="text-3xl font-black text-gray-100 mb-8 tracking-tighter uppercase italic">🌟 Why AcminX?</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase">Rapid Prototyping</span>
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase">Scalable Production</span>
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase">Intelligent Automation</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Onboarding;