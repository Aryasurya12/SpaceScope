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

  const loadRealtimeData = useCallback(async () => {
      setIsRefreshing(true);
      const [solar, iss] = await Promise.all([
          fetchSolarActivity(),
          fetchISSLocation()
      ]);
      
      setRealtimeSolar(solar);
      setIsGatewayActive(iss._status === 'live');
      setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  useEffect(() => {
    loadRealtimeData();
    const interval = setInterval(loadRealtimeData, 30000);
    return () => clearInterval(interval);
  }, [loadRealtimeData]);

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
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isGatewayActive ? 'bg-green-500' : 'bg-amber-500'}`}></span>
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
                <div className="hidden md:flex gap-4 text-xs font-mono text-cyan-400/80 bg-black/30 px-4 py-1.5 rounded-full border border-cyan-900/30">
                    <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGatewayActive ? 'bg-yellow-400' : 'bg-gray-600'}`}></span>
                        RADIO: {realtimeSolar?.[0]?.r?.text || 'OFFLINE'}
                    </span>
                    <span className="text-gray-700">|</span>
                    <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isGatewayActive ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                        STORM: {realtimeSolar?.[0]?.g?.text || 'OFFLINE'}
                    </span>
                </div>
                
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="bg-space-800/40 p-8 rounded-2xl border border-white/10">
                                <h3 className="text-gray-400 uppercase text-xs tracking-widest mb-4">Radio Blackout</h3>
                                <div className="text-6xl font-display text-cyan-400 mb-4">{realtimeSolar?.[0]?.r?.value ?? '0'}</div>
                                <p className="text-sm text-gray-400">Atmospheric interference scale.</p>
                             </div>
                             <div className="bg-space-800/40 p-8 rounded-2xl border border-white/10">
                                <h3 className="text-gray-400 uppercase text-xs tracking-widest mb-4">Geomagnetic Scale</h3>
                                <div className="text-6xl font-display text-yellow-400 mb-4">{realtimeSolar?.[0]?.g?.value ?? '0'}</div>
                                <p className="text-sm text-gray-400">Planetary magnetic field status.</p>
                             </div>
                             <div className="bg-space-800/40 p-8 rounded-2xl border border-white/10">
                                <h3 className="text-gray-400 uppercase text-xs tracking-widest mb-4">Solar Radiation</h3>
                                <div className="text-6xl font-display text-purple-400 mb-4">{realtimeSolar?.[0]?.s?.value ?? '0'}</div>
                                <p className="text-sm text-gray-400">Particle radiation flux level.</p>
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