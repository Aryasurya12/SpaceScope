import React from 'react';
import { motion } from 'framer-motion';

interface VoiceAssistantProps {
  onTriggerRegistration: () => void;
  active: boolean;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onTriggerRegistration, active }) => {
  if (!active) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-lg max-w-[320px] text-center backdrop-blur-md shadow-lg"
      >
        <div className="w-12 h-12 mx-auto mb-3 bg-amber-500/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[11px] text-amber-400 font-display font-bold uppercase tracking-widest mb-2">Voice Link Unavailable</p>
        <p className="text-[9px] text-gray-400 font-mono leading-relaxed">
          Real-time voice features require Gemini Live API. Currently using Groq for text-based AI features.
        </p>
        <button
          onClick={onTriggerRegistration}
          className="mt-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
        >
          Continue to Registration
        </button>
      </motion.div>
    </div>
  );
};

export default VoiceAssistant;