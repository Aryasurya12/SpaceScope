const BASE_URL = 'http://localhost:8000/api';
const RAG_URL = 'http://localhost:8000/rag';

export interface ISSData {
    timestamp: number;
    iss_position: {
        latitude: string;
        longitude: string;
    };
    message: string;
}

const MOCK_ISS: ISSData = {
    timestamp: Date.now(),
    iss_position: { latitude: "51.5074", longitude: "-0.1278" },
    message: "simulated"
};

const MOCK_SOLAR = [
    {
        "g": { "value": 0, "text": "OFFLINE" },
        "s": { "value": 0, "text": "OFFLINE" },
        "r": { "value": 0, "text": "OFFLINE" }
    }
];

const silentFetch = async (url: string, fallback: any) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) return { ...fallback, _status: 'error', _origin: 'gateway-error' };
        const data = await response.json();
        return { ...data, _status: 'live', _origin: 'remote-api' };
    } catch (error) {
        clearTimeout(timeoutId);
        return { ...fallback, _status: 'simulated', _origin: 'local-fallback' };
    }
};

export const fetchISSLocation = async (): Promise<ISSData & { _status: string; _origin: string }> => {
    return await silentFetch(`${BASE_URL}/iss`, MOCK_ISS);
};

export const fetchSolarActivity = async (): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/solar`);
        if (!response.ok) throw new Error('Gateway Error');
        const data = await response.json();

        const transformScale = (obj: any) => {
            if (!obj) return { value: 0, text: 'N/A' };
            const scaleStr = obj.Scale || "0";
            const value = parseInt(scaleStr.replace(/[RSG]/, ''), 10) || 0;
            let text = obj.Text || 'Normal';
            if (text.toLowerCase() === 'none') text = 'Quiet';
            return { value, text };
        };

        const result: any = { _status: 'live', _origin: 'remote-api' };

        // Map 0 (current), 1 (24h peak), 2 (peak since ...)
        [0, 1, 2].forEach(idx => {
            const entry = data[idx.toString()] || data[idx];
            if (entry) {
                result[idx] = {
                    r: transformScale(entry.R),
                    s: transformScale(entry.S),
                    g: transformScale(entry.G)
                };
            }
        });

        return result;

    } catch (error) {
        return { 0: MOCK_SOLAR[0], _status: 'simulated', _origin: 'local-fallback' };
    }
};

export const fetchNasaApod = async (): Promise<any> => {
    return await silentFetch(`${BASE_URL}/nasa-apod`, {
        url: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1200&auto=format&fit=crop",
        title: "Simulation Active",
        explanation: "The live NASA APOD feed is currently in simulated mode."
    });
};

export const fetchTechPortProjects = async (): Promise<any> => {
    return await silentFetch(`${BASE_URL}/techport`, { projects: [] });
};

export const fetchSpaceXLatest = async (): Promise<any> => {
    return await silentFetch(`${BASE_URL}/spacex`, {});
};

export const askRagEngine = async (query: string): Promise<{ answer: string; sources: string[] }> => {
    try {
        const response = await fetch(`${RAG_URL}?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("RAG Endpoint Error");
        return await response.json();
    } catch (e) {
        console.error("RAG Error", e);
        return { answer: "RAG Engine is unavailable.", sources: [] };
    }
};

export const getSystemStatus = async () => {
    const [iss, solar] = await Promise.all([
        fetchISSLocation(),
        fetchSolarActivity()
    ]);

    return {
        gateway: iss._status !== 'simulated' ? 'ONLINE' : 'OFFLINE',
        iss: iss._status,
        solar: solar._status,
        supabase: 'ONLINE',
        gemini: 'ACTIVE'
    };
};
