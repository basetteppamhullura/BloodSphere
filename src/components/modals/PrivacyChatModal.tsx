import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Send, X, ShieldCheck } from 'lucide-react';

export const PrivacyChatModal: React.FC = () => {
  const { activeChatModal, setActiveChatModal, showToast } = useApp();

  const [messageText, setMessageText] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'System', text: '🔒 End-to-end masked privacy relay session initialized. Personal phone numbers remain protected.', time: '10:00 AM' },
    { sender: 'Requester', text: 'Hello! Thank you for accepting our emergency request. Are you able to reach KIMS Hospital within 1 hour?', time: '10:02 AM' },
    { sender: 'Donor', text: 'Yes, I am on my way to KIMS Blood Bank now. Expected arrival: 25 mins.', time: '10:04 AM' }
  ]);

  if (!activeChatModal) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      sender: 'Donor',
      text: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, newMsg]);
    setMessageText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white border border-sky-100 rounded-3xl p-6 space-y-4 text-xs shadow-2xl relative flex flex-col h-[520px]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900">Encrypted Privacy Relay Chat</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> Phone Masked
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Connecting with <strong>{activeChatModal.donor?.name || 'Voluntary Donor'}</strong> (Request ID: {activeChatModal.request?.id || 'BR-1025'})
            </p>
          </div>

          <button
            onClick={() => setActiveChatModal(null)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl max-w-[85%] space-y-1 ${
                msg.sender === 'System'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 mx-auto text-center text-[11px]'
                  : msg.sender === 'Donor'
                  ? 'bg-red-600 text-white ml-auto shadow-xs'
                  : 'bg-white text-slate-900 border border-slate-200 mr-auto shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
                <span className="font-bold">{msg.sender}</span>
                <span>{msg.time}</span>
              </div>
              <p className="leading-snug">{msg.text}</p>
            </div>
          ))}
        </div>

        {/* MESSAGE INPUT */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 shrink-0">
          <input
            type="text"
            placeholder="Type encrypted message..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-md shadow-red-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
