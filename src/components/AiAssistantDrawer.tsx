import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const AiAssistantDrawer: React.FC = () => {
  const {
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    aiMessages,
    isAiLoading,
    askAi,
    quickAiPrompt,
    setQuickAiPrompt,
    resetAiChat,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-fill and auto-submit quick prompt if set
  useEffect(() => {
    if (quickAiPrompt) {
      askAi(quickAiPrompt);
      setQuickAiPrompt(null);
    }
  }, [quickAiPrompt, askAi, setQuickAiPrompt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isAiDrawerOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiDrawerOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isAiLoading) return;
    const promptToSend = inputPrompt.trim();
    setInputPrompt('');
    askAi(promptToSend);
  };

  const sampleQuestions = [
    'Which hospitals are at highest risk?',
    'Why is Metro General critical?',
    'Which supplies may expire soon?',
    'What should we redistribute first?',
    'What happens if demand increases by 30%?',
    'Give me a summary of the current supply situation.',
    'Explain the current crisis and tell me what actions should be prioritized.',
  ];

  if (!isAiDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-950/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">HealthFlow AI Assistant</h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Gemini Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Directly grounded on live hospital inventory &amp; simulation state
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetAiChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAiDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {aiMessages.map(msg => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser ? 'bg-teal-600 text-white' : 'bg-slate-800 text-teal-300 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  {/* Message content rendering */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h4 key={idx} className="font-bold text-white text-xs mt-2 mb-1">
                            {line.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('## ')) {
                        return (
                          <h3 key={idx} className="font-bold text-teal-300 text-sm mt-2 mb-1">
                            {line.replace('## ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('* **') || line.startsWith('- **')) {
                        return (
                          <div key={idx} className="pl-2 border-l border-teal-500/50 my-1">
                            <span className="font-semibold text-teal-200">
                              {line.replace(/^[*-]\s\*\*/, '').replace(/\*\*.*$/, '')}:{' '}
                            </span>
                            <span>{line.replace(/^[*-]\s\*\*.*?\*\*:\s*/, '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('* ') || line.startsWith('- ')) {
                        return (
                          <li key={idx} className="ml-4 list-disc text-slate-300">
                            {line.replace(/^[*-]\s/, '')}
                          </li>
                        );
                      }
                      return (
                        <p key={idx} className={line.trim() === '' ? 'h-2' : ''}>
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      {!isUser && (
                        <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                          msg.source === 'gemini' 
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{msg.source === 'gemini' ? 'Gemini 3.8 Flash' : 'HealthFlow Engine'}</span>
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px]">{msg.timestamp}</span>
                  </div>

                  {!isUser && msg.dataPointsUsed && msg.dataPointsUsed.length > 0 && (
                    <div className="mt-2 bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-[10px]">
                      <div className="font-semibold text-slate-400 mb-1 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-400" />
                        <span>Live Network Data Points Analyzed:</span>
                      </div>
                      <ul className="space-y-0.5 text-slate-300 pl-4 list-disc">
                        {msg.dataPointsUsed.map((dp, i) => (
                          <li key={i}>{dp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isAiLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-teal-300 border border-slate-700 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs ml-2">Reasoning over multi-hospital inventories...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/70">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Quick Analysis Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => askAi(q)}
                disabled={isAiLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white transition-colors disabled:opacity-50 text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask AI about hospital supplies, runout risks, redistribution..."
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            disabled={isAiLoading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isAiLoading}
            className="p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
