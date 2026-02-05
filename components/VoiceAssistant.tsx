import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceAssistantProps {
  onTriggerRegistration: () => void;
  active: boolean;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onTriggerRegistration, active }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const cleanupResources = async () => {
    // Stop all audio sources
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();

    // Close session
    if (sessionRef.current) {
      try { await sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }

    // Close AudioContexts
    if (inputAudioContextRef.current) {
      try { await inputAudioContextRef.current.close(); } catch (e) {}
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      try { await outputAudioContextRef.current.close(); } catch (e) {}
      outputAudioContextRef.current = null;
    }

    // Stop Media Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
    setIsConnecting(false);
  };

  const startVoiceSession = async (isAutoRetry = false) => {
    if (isConnecting && !isAutoRetry) return;
    
    await cleanupResources();
    
    setIsConnecting(true);
    if (!isAutoRetry) {
      setErrorStatus(null);
      setDetailedError(null);
    }

    // 1. Check for secure context
    if (!window.isSecureContext) {
      setErrorStatus("Security Protocol Breach");
      setDetailedError("Neural Link requires a secure HTTPS/Localhost origin.");
      setIsConnecting(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 2. Initialize Hardware
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // 3. Establish Live Connection
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are the SpaceScope Neural Link. Be futuristic, concise, and professional. If the user needs to register or create a login, call navigateToRegistration.',
          tools: [{
            functionDeclarations: [{
              name: 'navigateToRegistration',
              description: 'Opens the registration interface.',
              parameters: { type: Type.OBJECT, properties: {} }
            }]
          }]
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsListening(true);
            setRetryCount(0); // Reset retry on success
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isListening) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              sessionPromise.then(session => {
                try {
                  session.sendRealtimeInput({ 
                    media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                  });
                } catch (err) {
                  console.warn("Input stream interrupted:", err);
                }
              }).catch(() => {});
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputCtx.state !== 'closed') {
              try {
                const nextTime = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputCtx.destination);
                source.start(nextTime);
                nextStartTimeRef.current = nextTime + buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              } catch (e) {
                console.error("Audio playback error:", e);
              }
            }
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'navigateToRegistration') {
                  onTriggerRegistration();
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                    });
                  });
                }
              }
            }
          },
          onerror: (e: any) => {
            console.error("Neural Link Stream Error:", e);
            const errorMsg = e.message || String(e);
            
            if (errorMsg.includes('unavailable') || errorMsg.includes('503')) {
              handleServiceUnavailable();
            } else {
              setErrorStatus("Link Desynchronized");
              setDetailedError("The connection was dropped by the host. (ERR_NET_FAILURE)");
              cleanupResources();
            }
          },
          onclose: () => {
            setIsListening(false);
            setIsConnecting(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      setIsConnecting(false);
      const errorMsg = err.message || "";
      console.warn("Neural Link Fatal Failure:", err);

      if (errorMsg.includes('unavailable') || errorMsg.includes('503')) {
        handleServiceUnavailable();
      } else if (errorMsg.includes('fetch') || errorMsg.includes('Network')) {
        setErrorStatus("Tactical Comms Jammed");
        setDetailedError("Network failure. Check your firewall or proxy settings.");
      } else if (errorMsg.includes('not implemented') || errorMsg.includes('supported')) {
        setErrorStatus("Hardware Mismatch");
        setDetailedError("The requested Neural Link protocol is not supported by this node.");
      } else if (err.name === 'NotAllowedError' || errorMsg.includes('Permission')) {
        setErrorStatus("Uplink Unauthorized");
        setDetailedError("Microphone access was denied. Check browser permissions.");
      } else {
        setErrorStatus("Neural Uplink Offline");
        setDetailedError(errorMsg || "Unknown system error.");
      }
    }
  };

  const handleServiceUnavailable = () => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      setErrorStatus("Subspace Interference");
      setDetailedError(`Re-routing comms... Attempt ${retryCount + 1}/3`);
      setTimeout(() => startVoiceSession(true), 3000);
    } else {
      setErrorStatus("Host Node Unavailable");
      setDetailedError("The Gemini Neural Core is currently saturated or offline. Use manual credentials.");
      cleanupResources();
    }
  };

  useEffect(() => {
    if (active && !errorStatus && !isConnecting && !isListening) {
        startVoiceSession();
    }
    return () => { cleanupResources(); };
  }, [active]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl"
              />
              <div className="relative w-10 h-10 bg-black/40 border border-cyan-400/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <div className="flex gap-1 items-center">
                   {[0.2, 0.4, 0.6, 0.4, 0.2].map((h, i) => (
                     <motion.div 
                        key={i}
                        animate={{ height: [4, 16, 4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                        className="w-0.5 bg-cyan-400 rounded-full"
                     />
                   ))}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em] mt-3 drop-shadow-lg font-bold">Neural Link Active</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isListening && active && (
        <div className="flex flex-col items-center gap-4">
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => startVoiceSession()}
            disabled={isConnecting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-4 bg-black/60 backdrop-blur-xl border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-4 group shadow-2xl
              ${errorStatus ? 'border-red-500/50 text-red-400' : 'border-cyan-500/30 text-cyan-400 hover:border-cyan-400'}
            `}
          >
            <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : errorStatus ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`} />
            {isConnecting ? 'Recalibrating Frequencies...' : errorStatus ? 'Retry Neural Uplink' : 'Initialize Neural Voice Link'}
            <svg className={`w-4 h-4 transition-transform ${isConnecting ? 'animate-spin' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </motion.button>
          
          {errorStatus && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg max-w-[280px] text-center backdrop-blur-md shadow-lg"
            >
                <p className="text-[11px] text-red-400 font-display font-bold uppercase tracking-widest mb-1">{errorStatus}</p>
                <p className="text-[9px] text-gray-500 font-mono uppercase leading-relaxed">{detailedError}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;