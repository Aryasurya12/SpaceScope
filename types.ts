
export enum ViewState {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD'
}

export enum AuthMode {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP'
}

export enum DashboardSection {
  EVENTS = 'EVENTS',
  WEATHER = 'WEATHER',
  TIMELINE = 'TIMELINE',
  LEARNING = 'LEARNING',
  SATELLITES = 'SATELLITES',
  SYSTEM = 'SYSTEM',
  PROFILE = 'PROFILE'
}

export interface CelestialEvent {
  id: string;
  name: string;
  date: string;
  type: 'Meteor Shower' | 'Conjunction' | 'Eclipse' | 'ISS Pass' | 'Comet';
  visibility: 'High' | 'Medium' | 'Low';
  explanation: string;
  peakTime: string;
  significance: string;
  timeWindow: string;
  conditionSummary: string;
  coordinates: [number, number]; // Lat, Lng
  position?: { top: string; left: string }; // Top%, Left% for CSS positioning
  // New Telemetry Fields
  targetDate: string; // ISO String for countdown
  locationName: string;
  coordinatesText: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  mastery_score: number;
  missions_logged: number;
  flight_hours: number;
  credentials_level: string;
  updated_at: string;
}

export interface MasteryResponse {
  current_state: 'QUESTION' | 'REMEDIATION_CHOICE' | 'EXPLANATION' | 'MASTERY_CELEBRATION';
  is_correct?: boolean;
  mastery_score?: number;
  content: {
    text: string;
    options?: string[];
    explanation_modes?: {
      analogy?: string;
      flowchart?: string[];
      concept_map?: string;
      diagram_description?: string;
    };
  };
}
