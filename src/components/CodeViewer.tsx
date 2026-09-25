import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Code2, Terminal, ShieldCheck, Info } from 'lucide-react';

interface CodeViewerProps {
  title: string;
  code: string;
  language: string;
  icon: React.ReactNode;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ title, code, language, icon }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 shadow-2xl mb-8">
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-bottom border-white/5">
        <div className="flex items-center gap-2 text-gray-300 font-medium">
          {icon}
          <span>{title}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Copiar código"
        >
          {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
        </button>
      </div>
      <div className="max-h-[500px] overflow-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
