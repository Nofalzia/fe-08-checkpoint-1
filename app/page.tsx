'use client';

import { useChat } from '@ai-sdk/react';
import { Sparkles, RefreshCw, AlertCircle, Send } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

export default function ChatPage() {
  const { messages, error, regenerate, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom on new messages (smooth behavior, prevents CLS)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <main className="flex flex-col h-dvh max-w-2xl mx-auto p-4 bg-zinc-950">
      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
        {/* FIRST-RUN EMPTY STATE */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white">Start a conversation</h3>
            <p className="text-sm text-zinc-400 max-w-sm">
              Ask a question or pick one of the quick prompts below to test the UI flow.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {[
                'Audit my frontend workflow',
                'Generate a component schema',
                'Debug a stream error',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                  }}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 px-3 py-2 rounded-lg text-zinc-300 transition"
                >
                  {prompt} →
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES LIST */}
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          const content = m.parts
            ?.map((part) => ('text' in part ? part.text : ''))
            .join('')
            ?.trim() || '';
          return (
            <div
              key={`${m.id}-${idx}`}
              className={`p-3 rounded-xl text-sm max-w-[85%] ${
                isUser
                  ? 'bg-blue-600 text-white ml-auto'
                  : 'bg-zinc-800 border border-zinc-700/50 text-zinc-100'
              }`}
            >
              {content}
            </div>
          );
        })}

        {/* LOADING SKELETON (CLS-proof layout match) */}
        {isLoading && !messages[messages.length - 1]?.parts.some((part) => 'text' in part && part.text.trim()) && (
          <div className="p-3 bg-zinc-800/50 border border-zinc-700/30 rounded-xl w-3/4 animate-pulse space-y-2">
            <div className="h-4 bg-zinc-700/60 rounded w-5/6"></div>
            <div className="h-4 bg-zinc-700/60 rounded w-2/3"></div>
          </div>
        )}

        {/* ERROR STATE WITH RETRY */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-3 text-red-400">
            <div className="flex items-center gap-2 text-sm flex-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="line-clamp-2">{error.message || 'Failed to generate response. Please try again.'}</span>
            </div>
            <button
              onClick={() => regenerate()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50 text-red-300 text-xs font-medium rounded-lg transition shrink-0 whitespace-nowrap"
              aria-label="Retry message"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry message
            </button>
          </div>
        )}

        {/* Scroll anchor for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR (Mobile Safari Safe with env() inset) */}
      <form onSubmit={handleSubmit} className="pt-2 pb-safe border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message..."
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition"
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-1"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </main>
  );
}