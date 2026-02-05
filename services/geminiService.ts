
import { GoogleGenAI, GenerateContentResponse, Chat, Type, Schema } from "@google/genai";
import { MasteryResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple in-memory cache to prevent hitting rate limits on re-renders
const stellarImageCache = new Map<string, string>();

// Chat with Gemini (Switched to Flash for better availability)
export const sendChatMessage = async (
  message: string, 
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are SpaceScope AI, an expert astronomer and astrophysicist. Keep answers concise, engaging, and accurate for a web dashboard audience.",
      },
      history: history
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "Communication interference. Please try again.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Uplink unstable. Please retry transmission.";
  }
};

// Fallback images for when quota is exceeded or generation fails
const FALLBACK_SPACE_IMAGES = [
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=500&auto=format&fit=crop"
];

const getRandomFallback = () => FALLBACK_SPACE_IMAGES[Math.floor(Math.random() * FALLBACK_SPACE_IMAGES.length)];

// Generate high-quality stellar images
export const generateStellarImage = async (prompt: string): Promise<string> => {
  // Check cache first to avoid unnecessary API calls
  if (stellarImageCache.has(prompt)) {
    return stellarImageCache.get(prompt)!;
  }

  try {
    // Creating a fresh instance to ensure latest API key context
    const imageAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await imageAi.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt} Cinematic lighting, 3D scientific render, isolated subject, dark background, professional astrophysics visualization.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                // Cache successful generation
                stellarImageCache.set(prompt, imageUrl);
                return imageUrl;
            }
        }
    }
    
    console.warn("Gemini returned response but no image data found. Using fallback.");
    const fallback = getRandomFallback();
    stellarImageCache.set(prompt, fallback);
    return fallback;

  } catch (error: any) {
    // Gracefully handle Quota Exceeded (429) without alarming errors
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.warn("Gemini Image Quota Exceeded. Using cached static visuals.");
    } else {
        console.error("Stellar Image Generation Error:", error);
    }
    
    // Return and cache fallback to keep UI stable
    const fallback = getRandomFallback();
    stellarImageCache.set(prompt, fallback);
    return fallback;
  }
};

// Search Grounding for Real-Time Events
export const searchSpaceEvents = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text || "No recent data found.";
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return "Unable to retrieve real-time data.";
  }
};

// --- ADAPTIVE MASTERY ENGINE SERVICE ---

const MASTERY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    current_state: { 
      type: Type.STRING, 
      enum: ["QUESTION", "REMEDIATION_CHOICE", "EXPLANATION", "MASTERY_CELEBRATION"],
      description: "The current state of the tutor interaction." 
    },
    is_correct: { type: Type.BOOLEAN, description: "Whether the last answer was correct." },
    mastery_score: { type: Type.INTEGER, description: "Current mastery (0-100)." },
    content: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "Main text: question, message, or explanation." },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "4 options for questions."
        },
        explanation_modes: {
          type: Type.OBJECT,
          properties: {
            analogy: { type: Type.STRING },
            flowchart: { type: Type.ARRAY, items: { type: Type.STRING } },
            concept_map: { type: Type.STRING },
            diagram_description: { type: Type.STRING }
          }
        }
      },
      required: ["text"]
    }
  },
  required: ["current_state", "content"]
};

export const initTutorSession = (topic: string): Chat => {
  // Switched to Flash to avoid 429 Quota errors on Pro model
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      responseMimeType: 'application/json',
      responseSchema: MASTERY_SCHEMA,
      systemInstruction: `You are the SpaceScope Adaptive Mastery Engine for topic: ${topic}. 
      Guide the user to 100% mastery using this cycle:
      1. State 'QUESTION': Ask a foundational conceptual question.
      2. If Correct: Increment mastery_score by 20. If 100, state 'MASTERY_CELEBRATION'. Else, ask a more complex 'QUESTION'.
      3. If Incorrect: State 'REMEDIATION_CHOICE'. Offer options: Analogy, Flowchart, Concept Map, Diagram.
      4. After Choice: State 'EXPLANATION' with the chosen mode. Then immediately follow with a 'Mirror Question' (a similar logic problem) in the next turn.
      Be rigorous, scientific, and encouraging. Return ONLY JSON.`,
    }
  });
};

// Updated return type to Promise<MasteryResponse>
export const sendTutorMessage = async (session: Chat, message: string): Promise<MasteryResponse> => {
  try {
    const result = await session.sendMessage({ message });
    let text = result.text || '{}';
    // Sanitize JSON
    text = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text) as MasteryResponse;
  } catch (error) {
    console.error("Mastery Engine Error:", error);
    // Return Fallback "Offline Mode" Object to prevent UI crash
    return {
        current_state: "QUESTION",
        mastery_score: 0,
        content: {
            text: "⚠ SYSTEM ALERT: Neural Uplink Quota Exceeded. Operating in Safe Mode.\n\nQuestion: Which fundamental force is responsible for the formation of stars from nebulae?",
            options: [
                "Gravitational Force",
                "Electromagnetic Force",
                "Strong Nuclear Force",
                "Weak Nuclear Force"
            ]
        }
    } as MasteryResponse;
  }
};

// Generate mission insight
export const generateMissionInsight = async (missionName: string, description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a 1-sentence profound strategic insight about the mission: ${missionName}. Context: ${description}`,
    });
    return response.text || "Uplink failed.";
  } catch (error) {
    return "Analysis offline due to solar interference.";
  }
};

// Generate metric insight
export const generateMetricInsight = async (metricLabel: string, metricValue: string, context: string, trend: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this satellite metric: "${metricLabel}: ${metricValue}" (${context}, Trend: ${trend}). Provide a 1-sentence brief implication (max 12 words) for a dashboard.`,
    });
    return response.text || "Analysis pending.";
  } catch (error) {
    return "Data unavailable.";
  }
};
