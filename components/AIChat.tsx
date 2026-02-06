import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { askRagEngine } from '../services/apiService';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const AIChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Systems online. I am SpaceScope AI. Ask me about celestial bodies, mission data, or cosmic phenomena.' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Handle incoming AI queries from other components (like Weather Cards)
    useEffect(() => {
        const handleAIQuery = async (e: any) => {
            const query = e.detail;
            setIsOpen(true);
            setMessages(prev => [...prev, { role: 'user', text: query }]);
            setLoading(true);

            try {
                const response = await askRagEngine(query);
                const sourceList = response.sources.length > 0
                    ? `\n\nSources: ${response.sources.join(', ')}`
                    : '';

                setMessages(prev => [...prev, {
                    role: 'model',
                    text: `${response.answer}${sourceList}`
                }]);
            } catch (err) {
                setMessages(prev => [...prev, { role: 'model', text: "Error connecting to RAG engine." }]);
            } finally {
                setLoading(false);
            }
        };

        window.addEventListener('ai-query', handleAIQuery);
        return () => window.removeEventListener('ai-query', handleAIQuery);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Convert to history format for Gemini
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        try {
            const response = await sendChatMessage(userMsg.text, history);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'model', text: "Gemini Core error. Check uplink." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-cyan-600 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.5)] flex items-center justify-center border-2 border-cyan-300 overflow-hidden"
            >
                {isOpen ? (
                    <span className="text-2xl text-white">×</span>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-300 to-purple-500 animate-pulse" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 z-40 w-96 max-w-[90vw] h-[500px] bg-space-800/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-cyan-500/20 bg-black/20 rounded-t-2xl flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]" />
                            <h3 className="font-display text-white tracking-widest">GEMINI CORE</h3>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                            ? 'bg-cyan-700/50 text-white rounded-br-none border border-cyan-500/30'
                                            : 'bg-space-900/80 text-gray-200 rounded-bl-none border border-white/10'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-space-900/80 p-3 rounded-lg rounded-bl-none border border-white/10 flex gap-2">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-cyan-500/20 bg-black/20 rounded-b-2xl">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about the cosmos..."
                                    className="flex-1 bg-space-900 border border-cyan-900/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                                >
                                    SEND
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChat;