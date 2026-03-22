import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { generateFinancialReport } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Sparkles, Send, Bot, User, Loader2, Trash2, MessageSquare, Info, ShieldAlert, Copy, Check, Key, Settings as SettingsIcon, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIFinancialAssistant = () => {
  const { transactions, assets, liabilities, settings, updateSettings, chatHistory, setChatHistory, clearChatHistory } = useFinance();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const apiKey = settings.geminiApiKey || '';
  const showKeyInput = !settings.geminiApiKey;

  // Convert ChatMessage[] from context to local Message[] format (with Date objects)
  const messages: Message[] = chatHistory.map(m => ({
    ...m,
    timestamp: new Date(m.timestamp)
  }));

  const quickActions = [
    "Analyze my spending",
    "What is my net worth?",
    "Suggest a budget",
    "Identify anomalies"
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setChatHistory([...chatHistory, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await generateFinancialReport(
        transactions,
        assets,
        liabilities,
        userMsg.content,
        apiKey,
        settings.currency
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString()
      };

      setChatHistory([...chatHistory, userMsg, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error analyzing your data. Please ensure your API key is configured correctly.",
        timestamp: new Date().toISOString()
      };
      setChatHistory([...chatHistory, userMsg, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    clearChatHistory();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKey.trim()) {
      updateSettings({ geminiApiKey: tempKey.trim() });
      setTempKey('');
    }
  };

  const resetApiKey = () => {
    updateSettings({ geminiApiKey: undefined });
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col pb-6 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl shadow-inner">
              <Sparkles className="text-emerald-500" size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Aura Intelligence</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Generative Financial Strategy & Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={resetApiKey}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-500 transition-colors bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700"
            title="Change API Key"
          >
            <Key size={14} /> API Key
          </button>
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700"
          >
            <Trash2 size={14} /> Clear History
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col relative shadow-xl shadow-slate-200/50 dark:shadow-none">
        {showKeyInput ? (
          <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
                <Key className="text-emerald-500" size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Aura Core Activation</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">To enable generative financial strategy, please provide your Gemini API key. This key is stored locally in your browser and never sent to our servers.</p>
              </div>
              
              <form onSubmit={saveApiKey} className="space-y-4">
                <div className="relative">
                  <input 
                    type="password"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all pr-10"
                    placeholder="Enter your Gemini API Key..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ShieldAlert size={18} />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Activate Aura Core
                </button>
              </form>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
                >
                  Get a free Gemini API Key <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex gap-3 md:gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                    <div className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                      msg.role === 'assistant' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-500/20' 
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    )}>
                        {msg.role === 'assistant' ? (
                          <Bot size={18} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <User size={18} className="text-slate-500 dark:text-slate-400" />
                        )}
                    </div>
                    
                    <div className={cn(
                        "max-w-[85%] md:max-w-[75%] group relative",
                        msg.role === 'user' ? 'text-right' : 'text-left'
                    )}>
                        <div className={cn(
                            "rounded-2xl px-4 py-3 md:px-6 md:py-4 shadow-sm",
                            msg.role === 'user' 
                            ? 'bg-emerald-500 text-white rounded-tr-none' 
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/50'
                        )}>
                            <div className={cn(
                              "prose prose-sm md:prose-base max-w-none dark:prose-invert leading-relaxed",
                              msg.role === 'user' ? 'prose-p:text-white' : 'prose-p:text-slate-700 dark:prose-p:text-slate-300'
                            )}>
                               <ReactMarkdown components={{
                                 p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                                 strong: ({children}) => <strong className="font-bold text-slate-900 dark:text-emerald-300">{children}</strong>,
                                 ul: ({children}) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                                 li: ({children}) => <li className="mb-1">{children}</li>,
                                 code: ({children}) => <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs font-mono">{children}</code>
                               }}>
                                 {msg.content}
                               </ReactMarkdown>
                            </div>
                        </div>
                        <div className={cn(
                          "flex items-center gap-2 mt-1.5 px-1",
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                              {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {msg.role === 'assistant' && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => copyToClipboard(msg.content, msg.id)}
                                 className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-500 transition-colors"
                                 title="Copy to clipboard"
                               >
                                 {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                               </button>
                               <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-500 transition-colors">
                                 <Info size={12} />
                               </button>
                            </div>
                          )}
                        </div>
                    </div>
                </div>
              ))}
              {loading && (
                 <div className="flex gap-3 md:gap-5 animate-pulse">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
                        <Bot size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl rounded-tl-none px-6 py-4 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3">
                        <Loader2 size={18} className="animate-spin text-emerald-500" />
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Analyzing financial vectors...</span>
                    </div>
                 </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {quickActions.map(action => (
                        <button 
                            key={action}
                            onClick={() => setInput(action)}
                            className="text-[10px] md:text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all shadow-sm"
                        >
                            {action}
                        </button>
                    ))}
                </div>

                <div className="relative max-w-4xl mx-auto">
                    <textarea 
                        ref={textareaRef}
                        rows={1}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-lg resize-none custom-scrollbar"
                        placeholder="Ask Aura about your burn rate, net worth projection, or spending anomalies..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={loading}
                        style={{ minHeight: '56px', maxHeight: '150px' }}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className={cn(
                          "absolute right-2.5 bottom-2.5 p-2.5 rounded-xl transition-all duration-200",
                          input.trim() && !loading 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 scale-100' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 scale-95 opacity-50 cursor-not-allowed'
                        )}
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="mt-3 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                        <MessageSquare size={10} />
                        <span>Live Ledger Context</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                        <ShieldAlert size={10} />
                        <span>Encrypted Analysis</span>
                    </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
