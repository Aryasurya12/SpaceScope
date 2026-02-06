import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, DashboardSection } from '../types';
import CelestialMap from './CelestialMap';
import AIChat from './AIChat';
import MissionTimeline from './MissionTimeline';
import LearningZone from './LearningZone';
import EarthVisualizer from './EarthVisualizer';
import UserProfile from './UserProfile';
import SystemMonitor from './SystemMonitor';
import StarfieldBackground from './StarfieldBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSolarActivity, fetchISSLocation } from '../services/apiService';
import { fetchWeatherByCoords, WeatherData } from '../services/weatherService';

const Icons: Record<string, () => React.JSX.Element> = {
    Events: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Weather: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Timeline: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Learning: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Satellite: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    System: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    PROFILE: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
};

const IconMap: Record<string, keyof typeof Icons> = {
    EVENTS: 'Events',
    WEATHER: 'Weather',
    TIMELINE: 'Timeline',
    LEARNING: 'Learning',
    SATELLITES: 'Satellite',
    SYSTEM: 'System',
    PROFILE: 'PROFILE'
};

interface DashboardProps {
    setView: (view: ViewState) => void;
}

const DashboardLayout: React.FC<DashboardProps> = ({ setView }) => {
    const [section, setSection] = useState<DashboardSection>(DashboardSection.EVENTS);
    const [realtimeSolar, setRealtimeSolar] = useState<any>(null);
    const [isGatewayActive, setIsGatewayActive] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stormSimulation, setStormSimulation] = useState(false);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [issLocation, setIssLocation] = useState<{ lat: string, lon: string } | null>(null);

    const loadRealtimeData = useCallback(async () => {
        setIsRefreshing(true);
        const [solar, iss] = await Promise.all([
            fetchSolarActivity(),
            fetchISSLocation()
        ]);

        setRealtimeSolar(solar);
        setIsGatewayActive(iss._status === 'live');

        if (iss.iss_position) {
            setIssLocation({ lat: iss.iss_position.latitude, lon: iss.iss_position.longitude });
            const weatherData = await fetchWeatherByCoords(iss.iss_position.latitude, iss.iss_position.longitude);
            setWeather(weatherData);
        }

        setTimeout(() => setIsRefreshing(false), 500);
    }, []);

    useEffect(() => {
        loadRealtimeData();
        const interval = setInterval(loadRealtimeData, 30000);
        return () => clearInterval(interval);
    }, [loadRealtimeData]);

    // Derived Values for Weather
    const displaySolar = stormSimulation ? {
        0: { r: { value: 4, text: 'EXTREME' }, s: { value: 3, text: 'STRONG' }, g: { value: 5, text: 'EXTREME' } },
        1: { r: { value: 4, text: 'EXTREME' }, s: { value: 3, text: 'STRONG' }, g: { value: 5, text: 'EXTREME' } }
    } : realtimeSolar;

    const auroraProb = ((displaySolar?.[0]?.g?.value || 0) * 20) + Math.floor(Math.random() * 5); // Simple calc based on G scale

    return (
        <div className="flex h-screen bg-space-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] overflow-hidden">
                <div className="w-full h-[100px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-scanline" />
            </div>

            <motion.aside
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-20 lg:w-64 bg-space-800/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-40 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
            >
                <div className="p-6 flex items-center gap-3 cursor-pointer group" onClick={() => setView(ViewState.LANDING)}>
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.5)] group-hover:animate-spin-slow transition-transform"></div>
                        <div className="absolute inset-2 rounded-full bg-space-900"></div>
                    </div>
                    <h1 className="hidden lg:block font-display font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">SPACESCOPE</h1>
                </div>

                <nav className="flex-1 mt-8 space-y-1">
                    {Object.entries(DashboardSection).map(([key, value]) => {
                        const iconKey = IconMap[key] || 'Events';
                        const Icon = Icons[iconKey];
                        const isActive = section === value;
                        return (
                            <button
                                key={key}
                                onClick={() => setSection(value)}
                                className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 relative group overflow-hidden ${isActive ? 'text-cyan-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {isActive && <motion.div layoutId="active-nav-glow" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_#00F0FF]" />}
                                <Icon />
                                <span className="hidden lg:block font-sans font-medium tracking-wide">{key}</span>
                            </button>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-white/5 hidden lg:block bg-black/20">
                    <div className="flex flex-col gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isGatewayActive ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${isGatewayActive ? 'text-green-400' : 'text-amber-400'}`}>
                                {isGatewayActive ? 'Gateway Live' : 'Gateway Offline'}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.aside>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <StarfieldBackground />
                <div className="absolute inset-0 bg-space-900/60 z-0 pointer-events-none radial-vignette"></div>

                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 relative z-20 bg-space-800/10 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <h2 className="font-display text-xl font-bold uppercase tracking-widest text-cyan-100">{section} DASHBOARD</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex gap-4 text-[10px] font-mono font-bold bg-black/30 px-5 py-2 rounded-full border border-cyan-500/20">
                            <span className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${stormSimulation ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : (displaySolar?.[0]?.r?.value > 0 ? 'bg-yellow-400' : 'bg-cyan-500')}`}></span>
                                RADIO: R{displaySolar?.[0]?.r?.value || '0'}
                            </span>
                            <span className="text-gray-700">|</span>
                            <span className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${stormSimulation ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : (displaySolar?.[0]?.g?.value > 0 ? 'bg-yellow-400' : 'bg-green-500')}`}></span>
                                MAG: G{displaySolar?.[0]?.g?.value || '0'}
                            </span>
                            <span className="text-gray-700">|</span>
                            <span className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${stormSimulation ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : (displaySolar?.[0]?.s?.value > 0 ? 'bg-yellow-400' : 'bg-purple-500')}`}></span>
                                SOLAR: S{displaySolar?.[0]?.s?.value || '0'}
                            </span>
                        </div>

                        <button
                            onClick={() => setStormSimulation(!stormSimulation)}
                            className={`px-3 py-1.5 rounded border text-[9px] font-black tracking-widest uppercase transition-all ${stormSimulation ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-gray-400 hover:border-cyan-500/50'}`}
                        >
                            {stormSimulation ? 'LIVE STREAMS JAMMED' : 'Simulate Storm'}
                        </button>

                        <button
                            onClick={loadRealtimeData}
                            disabled={isRefreshing}
                            className={`p-2 rounded-full border border-white/10 hover:border-cyan-500/50 hover:bg-white/5 transition-all group ${isRefreshing ? 'opacity-50' : ''}`}
                            title="Force System Resync"
                        >
                            <svg className={`w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-y-auto relative z-20 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div key={section} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                            {section === DashboardSection.EVENTS && <CelestialMap />}
                            {section === DashboardSection.WEATHER && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            {
                                                label: 'Current Temp',
                                                value: weather?.temp_c ? `${weather.temp_c}°C` : 'N/A',
                                                text: weather?.condition.text || 'Scanning...',
                                                color: 'text-cyan-400', border: 'border-cyan-500/20', shadow: 'shadow-cyan-500/10'
                                            },
                                            {
                                                label: 'Wind / Humidity',
                                                value: weather?.wind_kph ? `${weather.wind_kph}kph` : 'N/A',
                                                text: weather?.humidity ? `${weather.humidity}% Humidity` : 'Determining...',
                                                color: 'text-yellow-400', border: 'border-yellow-500/20', shadow: 'shadow-yellow-500/10'
                                            },
                                            {
                                                label: 'UV / AQI PM2.5',
                                                value: weather?.uv !== undefined ? `UV ${weather.uv}` : 'N/A',
                                                text: weather?.air_quality.pm2_5 ? `PM2.5: ${weather.air_quality.pm2_5}` : 'Sampling...',
                                                color: 'text-purple-400', border: 'border-purple-500/20', shadow: 'shadow-purple-500/10'
                                            }
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                className={`bg-space-800/40 p-8 rounded-2xl border ${item.border} backdrop-blur-md cursor-help group relative overflow-hidden`}
                                                onClick={() => window.dispatchEvent(new CustomEvent('ai-query', { detail: `Explain how ${item.label} (${item.value}) affects local conditions at coordinates ${issLocation?.lat}, ${issLocation?.lon}.` }))}
                                            >
                                                <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity ${item.color}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <h3 className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em] mb-4">{item.label}</h3>
                                                <div className={`text-4xl font-display font-black ${item.color} mb-4 flex items-baseline gap-2`}>
                                                    {item.value}
                                                </div>
                                                <div className="font-mono text-[10px] tracking-widest uppercase py-1 px-3 bg-white/5 rounded-full inline-block mb-4">
                                                    {item.text}
                                                </div>
                                                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                                                    <span>Live Telemetry</span>
                                                    <span className="text-cyan-400 font-mono">
                                                        {issLocation ? `${parseFloat(issLocation.lat).toFixed(1)}°N / ${parseFloat(issLocation.lon).toFixed(1)}°E` : 'LOCATING...'}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Live Solar Cam */}
                                        <div className="bg-space-800/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-[400px]">
                                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    SDO Live Feed | AIA 171
                                                </h4>
                                                <div className="text-[9px] font-mono text-gray-500">REF=NASA_SDO_UV</div>
                                            </div>
                                            <div className="flex-1 relative group cursor-crosshair">
                                                <img
                                                    src="https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg"
                                                    alt="Live Sun"
                                                    className="w-full h-full object-cover filter brightness-75 contrast-125 group-hover:brightness-100 transition-all duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                                <div className="absolute bottom-4 left-6">
                                                    <p className="text-[10px] text-cyan-400 font-mono tracking-tighter uppercase max-w-[200px]">
                                                        Observing upper transition region and quiet corona.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Aurora Probability */}
                                        <div className="bg-space-800/40 p-10 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                                                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent animate-pulse" />
                                            </div>
                                            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 mb-8">Auroral Probability</h4>
                                            <div className="relative mb-8">
                                                <svg className="w-48 h-48 transform -rotate-90">
                                                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                                    <motion.circle
                                                        cx="96" cy="96" r="80"
                                                        stroke="currentColor"
                                                        strokeWidth="12"
                                                        fill="transparent"
                                                        strokeDasharray={2 * Math.PI * 80}
                                                        initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                                        animate={{ strokeDashoffset: (2 * Math.PI * 80) * (1 - Math.min(auroraProb, 100) / 100) }}
                                                        className="text-green-500"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col justify-center items-center">
                                                    <span className="text-6xl font-display font-black text-white">{Math.min(auroraProb, 100)}%</span>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-bold tracking-widest text-green-400 uppercase">
                                                {auroraProb > 70 ? 'High probability of sighting' : auroraProb > 30 ? 'Enhanced activity detected' : 'Minimal auroral activity'}
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-4 max-w-[250px] leading-relaxed uppercase">
                                                Calculated based on G-Scale indices and current magnetospheric flux.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {section === DashboardSection.TIMELINE && <MissionTimeline />}
                            {section === DashboardSection.LEARNING && <LearningZone />}
                            {section === DashboardSection.SATELLITES && <EarthVisualizer />}
                            {section === DashboardSection.SYSTEM && <SystemMonitor />}
                            {section === DashboardSection.PROFILE && <UserProfile />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <AIChat />
            </main>
        </div>
    );
};

export default DashboardLayout;