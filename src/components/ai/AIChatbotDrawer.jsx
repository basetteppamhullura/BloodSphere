import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateChatbotResponse } from '../../services/aiEngine';
import { Bot, X, Send, Sparkles, User, HelpCircle } from 'lucide-react';

export default function AIChatbotDrawer() {
  const { activeAIChatbotDrawer, setActiveAIChatbotDrawer } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: "msg_1",
      sender: "bot",
      text: "Hello! I am your **AI Lifesaver Assistant**. How can I help you save lives today?",
      suggestedActions: ["Am I Eligible?", "Post Urgent Need", "Find Nearby Camps", "City Shortage Status"]
    }
  ]);

  if (!activeAIChatbotDrawer) return null;

  const handleSendMessage = (textToSend = inputQuery) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = { id: `msg_${Date.now()}`, sender: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Generate AI response
    setTimeout(() => {
      const response = generateChatbotResponse(text);
      const botMsg = {
        id: `msg_${Date.now() + 1}`,
        sender: "bot",
        text: response.reply,
        suggestedActions: response.suggestedActions
      };
      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white font-bold shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">AI Lifesaver Assistant</h3>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-800">
                  RAG FAQ ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">24/7 Blood Donation Guidance & Support</p>
            </div>
          </div>

          <button
            onClick={() => setActiveAIChatbotDrawer(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-red-600 text-white font-medium rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>

              {/* Suggested Action Chips */}
              {m.suggestedActions && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                  {m.suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(action)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2.5 py-1 rounded-full border border-slate-700 font-semibold transition-all"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask AI anything (e.g. 'Can I donate if I have tattoo?')..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
