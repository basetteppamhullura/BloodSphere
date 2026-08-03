import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parseNaturalLanguageEmergencyRequest } from '../../services/aiEngine';
import { Sparkles, X, Wand2, Send, AlertTriangle, Building2, MapPin } from 'lucide-react';

export default function AIPostExtractorModal() {
  const { activeAIPostModal, setActiveAIPostModal, createEmergencyRequest } = useApp();

  const [promptText, setPromptText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeAIPostModal) return null;

  const handleAIExtract = () => {
    if (!promptText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseNaturalLanguageEmergencyRequest(promptText);
      setExtractedData(parsed);
      setIsProcessing(false);
    }, 600);
  };

  const handleSubmitPost = () => {
    if (!extractedData) return;
    createEmergencyRequest(extractedData);
    setActiveAIPostModal(false);
    setPromptText('');
    setExtractedData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-red-950/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-bold shadow-md">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Natural Language Emergency Post Generator</h3>
              <p className="text-xs text-slate-400">Describe the urgent need in plain words; AI structures it instantly</p>
            </div>
          </div>

          <button
            onClick={() => setActiveAIPostModal(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Plain Text Input Box */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Type or Paste Emergency Details (Plain Language)
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Example: My uncle needs 2 units of O- blood urgently at KIMS Hospital Hubballi for accident ICU surgery tomorrow..."
              className="w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 leading-relaxed"
            />

            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] text-slate-500">Supports English, Kannada & mixed text</span>
              <button
                onClick={handleAIExtract}
                disabled={!promptText.trim() || isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4 text-amber-400" />
                {isProcessing ? 'AI Parsing...' : 'Parse Details with AI'}
              </button>
            </div>
          </div>

          {/* AI Extracted Fields Preview */}
          {extractedData && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-red-900/60 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Confidence Score: {extractedData.aiConfidenceScore}%
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800">
                  Ready to Post
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Required Blood Group</span>
                  <span className="font-extrabold text-red-400 text-sm">{extractedData.bloodGroup}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Units Required</span>
                  <span className="font-extrabold text-slate-100 text-sm">{extractedData.unitsNeeded} Units</span>
                </div>
                <div className="p-2.5 rounded bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Hospital Name</span>
                  <span className="font-semibold text-slate-200">{extractedData.hospitalName}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Urgency Level</span>
                  <span className="font-semibold text-amber-400">{extractedData.urgency}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-3">
          <button
            onClick={() => setActiveAIPostModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmitPost}
            disabled={!extractedData}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Publish Emergency Post Now
          </button>
        </div>

      </div>
    </div>
  );
}
