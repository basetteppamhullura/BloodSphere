import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Phone, X, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PrivacyChatModal() {
  const { activeChatModal, setActiveChatModal, addToastNotification } = useApp();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'requester', text: "Hello! Thank you for offering to donate. We urgently need 2 units of O- at KIMS Hospital." },
    { id: 2, sender: 'donor', text: "Hi! I am in Vidyanagar Hubballi, only 1.2 km away. I can reach the blood bank within 20 mins." }
  ]);
  const [inputText, setInputText] = useState('');
  const [phoneConsented, setPhoneConsented] = useState(false);

  if (!activeChatModal) return null;

  const { request, donor } = activeChatModal;

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'donor', text: inputText }]);
    setInputText('');
  };

  const handleToggleConsent = () => {
    const nextVal = !phoneConsented;
    setPhoneConsented(nextVal);
    if (nextVal) {
      addToastNotification("Contact info revealed to requester by mutual consent.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800 font-bold text-xs">
              {request.bloodGroup}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Privacy Relay Chat</h3>
              <p className="text-[11px] text-slate-400">Connecting with {request.patientName} ({request.hospitalName})</p>
            </div>
          </div>

          <button
            onClick={() => setActiveChatModal(null)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Consent Banner */}
        <div className="p-3 bg-indigo-950/60 border-b border-indigo-800/50 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Phone numbers hidden until mutual consent.</span>
          </div>

          <button
            onClick={handleToggleConsent}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              phoneConsented
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500'
            }`}
          >
            {phoneConsented ? '✓ Phone Shared' : 'Share Phone Number'}
          </button>
        </div>

        {/* Chat Log */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'donor' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'donor'
                    ? 'bg-red-600 text-white font-medium rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {phoneConsented && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Direct Phone Relay Unlocked: <strong className="text-white">+91 98765 43210</strong></span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type message to requester..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
