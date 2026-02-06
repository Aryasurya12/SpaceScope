
import Groq from "groq-sdk";
import { MasteryResponse } from "../types";
import { askRagEngine } from "./apiService";

// Initialize Groq Client
// Note: Ensure VITE_GEMINI_API_KEY is set in .env.local and starts with VITE_
const groq = new Groq({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || "gsk_key_placeholder",
    dangerouslyAllowBrowser: true
});

const stellarImageCache = new Map<string, string>();

export const sendChatMessage = async (
    message: string,
    history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
    try {
        const groqHistory = history.map(msg => ({
            role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant',
            content: msg.parts[0].text
        }));

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are SpaceScope AI, an expert astronomer and astrophysicist. Keep answers concise, engaging, and accurate."
                },
                ...groqHistory,
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "Signal lost.";
    } catch (error) {
        console.error("Groq Chat Error:", error);
        return "Uplink unstable.";
    }
};

const FALLBACK_SPACE_IMAGES = [
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=500&auto=format&fit=crop"
];

export const generateStellarImage = async (prompt: string): Promise<string> => {
    if (stellarImageCache.has(prompt)) return stellarImageCache.get(prompt)!;
    const fallback = FALLBACK_SPACE_IMAGES[Math.floor(Math.random() * FALLBACK_SPACE_IMAGES.length)];
    stellarImageCache.set(prompt, fallback);
    return fallback;
};

// Hook RAG Engine for Search
export const searchSpaceEvents = async (query: string): Promise<string> => {
    try {
        const result = await askRagEngine(query);
        return result.answer;
    } catch (error) {
        return "RAG Uplink Offline.";
    }
};

// --- ADAPTIVE MASTERY ENGINE SERVICE ---

interface GroqChatSession {
    history: Array<{ role: string; content: string }>;
    systemInstruction: string;
}

export const initTutorSession = (topic: string): GroqChatSession => {
    return {
        history: [],
        systemInstruction: `You are the SpaceScope Adaptive Mastery Engine for topic: ${topic}. 
      Guide the user to 100% mastery.
      Return ONLY JSON in this format:
      {
        "current_state": "QUESTION" | "REMEDIATION_CHOICE" | "EXPLANATION" | "MASTERY_CELEBRATION",
        "is_correct": boolean,
        "mastery_score": number,
        "content": {
          "text": string,
          "options": string[],
          "explanation_modes": object
        }
      }`
    };
};

export const sendTutorMessage = async (session: GroqChatSession, message: string): Promise<MasteryResponse> => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: session.systemInstruction },
                ...session.history as Array<{ role: 'user' | 'assistant', content: string }>,
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
            response_format: { type: "json_object" }
        });

        const responseText = chatCompletion.choices[0]?.message?.content || '{}';
        session.history.push({ role: "user", content: message }, { role: "assistant", content: responseText });

        return JSON.parse(responseText) as MasteryResponse;
    } catch (error) {
        return {
            current_state: "QUESTION",
            mastery_score: 0,
            content: {
                text: "⚠ SYSTEM ALERT: Neural Uplink Offline using Fallback.",
                options: ["Option A", "Option B"]
            }
        } as MasteryResponse;
    }
};

export const generateMissionInsight = async (missionName: string, description: string): Promise<string> => {
    // Placeholder using sendChatMessage or implementation
    return "Analysis pending.";
};

export const generateMetricInsight = async (metricLabel: string, metricValue: string, context: string, trend: string): Promise<string> => {
    return "Metric normal.";
};
