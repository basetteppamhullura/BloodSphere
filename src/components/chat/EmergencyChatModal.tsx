import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { EmergencyChatMessage, MessageType } from '../../types';
import {
  Lock,
  X,
  Send,
  MapPin,
  Building2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ShieldCheck,
  Check,
  CheckCheck,
  Sparkles,
  Droplet,
  Radio
} from 'lucide-react';

export const EmergencyChatModal: React.FC = () => {
  const {
    activeChatSessionId,
    chatSessions,
    closeEmergencyChatModal,
    sendChatMessage,
    markChatMessagesRead,
    closeEmergencyChatSession,
    setTypingIndicator,
    requests
  } = useApp();

  const { currentUser, currentRole } = useAuth();
  const [inputText, setInputText] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Chat Session
  const activeSession = chatSessions.find(s => s.id === activeChatSessionId);

  // Auto Scroll to Bottom on Messages Update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, activeSession?.isDonorTyping, activeSession?.isRequesterTyping]);

  // Mark Messages as Read on Open
  useEffect(() => {
    if (activeSession && currentUser) {
      markChatMessagesRead(activeSession.id, currentUser.id);
    }
  }, [activeSession?.id, activeSession?.messages.length, currentUser?.id]);

  if (!activeSession) return null;

  const activeReq = requests.find(r => r.id === activeSession.requestId);
  const isClosed = activeSession.status === 'closed' || activeSession.status === 'completed' || activeReq?.status === 'COMPLETED';

  // Determine Participant Role Display
  const isUserDonor = currentRole === 'donor' || currentUser?.id === activeSession.donorId;
  const participantName = isUserDonor
    ? `Patient Requester • ${activeSession.requesterName}`
    : `Verified Donor • ${activeSession.donorName}`;
  const participantBloodGroup = isUserDonor ? activeSession.bloodGroup : activeSession.donorBloodGroup;
  const isOtherUserOnline = isUserDonor ? activeSession.isRequesterOnline : activeSession.isDonorOnline;
  const isOtherUserTyping = isUserDonor ? activeSession.isRequesterTyping : activeSession.isDonorTyping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (currentUser) {
      setTypingIndicator(activeSession.id, currentUser.id, e.target.value.length > 0);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isClosed || !currentUser) return;

    sendChatMessage({
      sessionId: activeSession.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentRole,
      message: inputText.trim(),
      messageType: 'text'
    });

    setInputText('');
    setTypingIndicator(activeSession.id, currentUser.id, false);
  };

  // Quick Action Handlers
  const handleQuickAction = (type: MessageType, textPayload: string, metadata?: any) => {
    if (isClosed || !currentUser) return;

    sendChatMessage({
      sessionId: activeSession.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentRole,
      message: textPayload,
      messageType: type,
      metadata
    });

    setShowQuickActions(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl h-[90vh] max-h-[750px] bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Floating Background Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-red-100/30 rounded-full blur-2xl pointer-events-none" />

        {/* 1. CHAT HEADER */}
        <div className="p-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-red-50 flex items-center justify-between gap-3 relative z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
              <span>{participantBloodGroup}</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 truncate">
                  {participantName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOtherUserOnline !== false ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                  {isOtherUserOnline !== false ? '🟢 ONLINE' : '⚪ OFFLINE'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-medium truncate">
                <span className="flex items-center gap-1 text-sky-700 font-mono">
                  <Lock className="w-3 h-3 text-emerald-600" /> Room: emergency-request-{activeSession.requestId}
                </span>
                <span>•</span>
                <span className="truncate">Hospital: {activeSession.hospitalName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={closeEmergencyChatModal}
              className="p-2 rounded-xl bg-sky-50 text-slate-400 hover:text-slate-700 hover:bg-sky-100 transition-colors"
              title="Close Chat Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRIVACY LOCK BANNER */}
        <div className="px-4 py-1.5 bg-sky-50/70 border-b border-sky-100 flex items-center justify-between text-[10px] text-slate-600 font-medium relative z-10 shrink-0">
          <span className="flex items-center gap-1.5 text-sky-800 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            🔒 Private End-to-End Encrypted Session • Patient ID: {activeSession.requestId}
          </span>
          <span className="text-slate-400 font-mono">Socket.IO Room Active</span>
        </div>

        {/* 2. MESSAGES STREAM CONTAINER */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5 relative z-10 text-xs bg-slate-50/50">
          
          {/* Welcome Info Card */}
          <div className="p-4 rounded-2xl bg-white border border-sky-100 text-center space-y-2 max-w-md mx-auto shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-xs">Emergency Blood Donation Chat Established</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Use this private channel to coordinate hospital arrival time, blood unit verification, and clinical appointment details directly with <strong>{activeSession.hospitalName}</strong>.
            </p>
          </div>

          {/* Render Messages */}
          {activeSession.messages.map(msg => {
            const isMe = currentUser?.id === msg.senderId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in`}
              >
                <span className="text-[9px] text-slate-400 font-bold px-1">
                  {isMe ? 'You' : msg.senderName} • {msg.timestamp}
                </span>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl shadow-2xs space-y-1.5 ${
                    isMe
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-tr-xs'
                      : 'bg-white border border-sky-100 text-slate-900 rounded-tl-xs'
                  }`}
                >
                  {/* Message Type Renderers */}
                  {msg.messageType === 'text' && (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  )}

                  {msg.messageType === 'hospital_location' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <MapPin className="w-4 h-4 shrink-0" /> Hospital Geolocation Shared
                      </div>
                      <p className="text-[11px] opacity-95">{msg.message}</p>
                      {msg.metadata?.location && (
                        <div className="p-2 rounded-xl bg-black/10 text-[10px] font-mono">
                          📍 Lat: {msg.metadata.location.lat.toFixed(4)}, Lng: {msg.metadata.location.lng.toFixed(4)}
                        </div>
                      )}
                    </div>
                  )}

                  {msg.messageType === 'hospital_details' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <Building2 className="w-4 h-4 shrink-0" /> Hospital Clinical Details
                      </div>
                      <p className="text-[11px] opacity-95">{msg.message}</p>
                    </div>
                  )}

                  {msg.messageType === 'eta' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <Clock className="w-4 h-4 shrink-0" /> Estimated Arrival Time (ETA)
                      </div>
                      <p className="text-[11px] font-bold opacity-95">{msg.message}</p>
                    </div>
                  )}

                  {msg.messageType === 'appointment_details' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <Calendar className="w-4 h-4 shrink-0" /> Appointment Scheduled
                      </div>
                      <p className="text-[11px] opacity-95">{msg.message}</p>
                    </div>
                  )}

                  {msg.messageType === 'confirm_availability' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> Availability Confirmed
                      </div>
                      <p className="text-[11px] opacity-95">{msg.message}</p>
                    </div>
                  )}

                  {/* Read / Unread Indicator */}
                  <div className="flex items-center justify-end gap-1 text-[9px] opacity-80 pt-0.5 font-mono">
                    {msg.read ? (
                      <span className="flex items-center gap-0.5 text-emerald-200">
                        <CheckCheck className="w-3.5 h-3.5" /> Read
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isOtherUserTyping && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium italic animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <span>{isUserDonor ? activeSession.requesterName : activeSession.donorName} is typing...</span>
            </div>
          )}

          {/* Read Only Closed Banner */}
          {isClosed && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-1 font-bold text-xs my-3">
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>🔒 This emergency conversation has been closed.</span>
              </div>
              <p className="text-[10px] font-normal text-amber-700">Previous messages remain accessible for medical history records.</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. QUICK ACTIONS CHIPS BAR */}
        {!isClosed && (
          <div className="px-4 py-2 bg-white border-t border-sky-100 flex items-center gap-2 overflow-x-auto text-[11px] font-bold relative z-10 shrink-0">
            <button
              onClick={() => handleQuickAction('hospital_location', `📍 Hospital Location: ${activeSession.hospitalName}, ${activeSession.hospitalAddress || 'Vidyanagar, Hubballi'}`)}
              className="px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shrink-0 flex items-center gap-1 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" /> Share Hospital Location
            </button>

            <button
              onClick={() => handleQuickAction('eta', `⏱ Donor ETA: Arriving at ${activeSession.hospitalName} within 15–20 minutes.`)}
              className="px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shrink-0 flex items-center gap-1 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" /> ETA 15 Mins
            </button>

            <button
              onClick={() => handleQuickAction('confirm_availability', `✅ Availability Confirmed: Ready for immediate donor screening & blood collection.`)}
              className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirm Availability
            </button>

            <button
              onClick={() => handleQuickAction('hospital_details', `🏥 Hospital Details: ${activeSession.hospitalName} • Emergency Trauma Ward Bed 14.`)}
              className="px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shrink-0 flex items-center gap-1 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Hospital Details
            </button>
          </div>
        )}

        {/* 4. INPUT FOOTER BAR */}
        <div className="p-4 border-t border-sky-100 bg-white relative z-10 shrink-0">
          {!isClosed ? (
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={handleInputChange}
                className="flex-1 p-3 rounded-2xl bg-slate-50 border border-sky-200 text-slate-900 font-medium text-xs focus:border-red-500 focus:outline-none shadow-2xs"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" /> Send
              </button>

              <button
                type="button"
                onClick={() => closeEmergencyChatSession(activeSession.id)}
                className="px-3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] transition-colors"
                title="Complete & Close Emergency Chat"
              >
                End Chat
              </button>
            </form>
          ) : (
            <div className="text-center py-1 text-[11px] text-slate-400 font-mono">
              Chat session locked • Read-only transcript
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
