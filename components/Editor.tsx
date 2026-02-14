
import React from 'react';

interface EditorProps {
  code: string;
  onChange?: (val: string) => void;
}

const Editor: React.FC<EditorProps> = ({ code, onChange }) => {
  return (
    <div className="h-full flex flex-col bg-[#0d0d0d] border-r border-[#222]">
      <div className="px-4 py-2 bg-[#151515] border-b border-[#222] flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Source Code</span>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      <textarea
        className="flex-1 w-full bg-transparent p-4 font-mono text-sm text-blue-300 outline-none resize-none leading-relaxed"
        value={code}
        readOnly
        spellCheck={false}
      />
    </div>
  );
};

export default Editor;
