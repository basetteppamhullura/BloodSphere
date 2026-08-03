import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Phone, X, Send } from 'lucide-react';

export const PrivacyChatModal: React.FC = () => {
  const { activeChatModal, setActiveChatModal, showToast } = useApp();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'requester', text: "Hello! We urgently need 2 units of O- at KIMS Hospital." },
    { id: 2, sender: 'donor', text: "Hi! I am in Vidyanagar, 1.2 km away. I can reach within 20 mins." }
  ]);
  const [input, setInput] = useState('');
  const [phoneShared, setPhoneShared] = useState(false);

  if (!activeChatModal) return null;

  const { donor } = activeChatModal;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'donor', text: input }]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h3 className="font-bold text-xs text-white">Privacy Relay Chat with {donor.name}</h3>
          <button onClick={() => setActiveChatModal(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-indigo-950/60 border-b border-indigo-800/50 flex items-center justify-between text-xs text-indigo-200">
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-indigo-400" /> Phone masked until consent</span>
          <button
            onClick={() => { setPhoneShared(!phoneShared); showToast("Phone contact unlocked!"); }}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px]"
          >
            {phoneShared ? '✓ Unlocked' : 'Share Phone'}
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'donor' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-xl text-xs ${m.sender === 'donor' ? 'bg-red-600 text-white font-medium' : 'bg-slate-800 text-slate-200'}`}>
                {m.text}
              </div>
            </div>
          ))}

          {phoneShared && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" /> Direct Phone: <strong className="text-white">{donor.phone}</strong>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type message..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
          />
          <button onClick={handleSend} className="p-2 rounded-xl bg-red-600 text-white font-bold">
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
