
import React, { useState } from 'react';

interface PreviewProps {
  html: string;
}

const Preview: React.FC<PreviewProps> = ({ html }) => {
  const [reloadKey, setReloadKey] = useState(0);

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Browser-like Header with Reload Button */}
      <div className="px-4 py-3 bg-[#0d0d0d] border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]"></div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#666] uppercase tracking-[0.1em]">Live Preview</span>
            <div className="flex items-center gap-2">
              <div className="bg-[#151515] border border-[#222] px-3 py-1 rounded-md flex items-center">
                <span className="text-[10px] text-[#444] font-mono">localhost:3000</span>
              </div>
              <button 
                onClick={handleReload}
                disabled={!html}
                className={`p-1.5 rounded-md transition-all group ${!html ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#1a1a1a] active:scale-95'}`}
                title="Reload preview"
              >
                <svg 
                  className={`w-3.5 h-3.5 transition-colors ${!html ? 'text-[#333]' : 'text-[#444] group-hover:text-emerald-500'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-white">
        {html ? (
          <iframe
            key={reloadKey}
            srcDoc={html}
            title="App Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-forms allow-modals allow-popups"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 bg-[#0a0a0a]">
            <div className="w-12 h-12 mb-4 opacity-5 text-emerald-500">
               <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
               </svg>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-800">Preview area empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
