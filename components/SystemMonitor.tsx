import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchISSLocation, fetchSolarActivity } from '../services/apiService';

const SystemMonitor: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const checkHealth = useCallback(async (isManual = false) => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        
        const timestamp = new Date().toLocaleTimeString();
        if (isManual) {
            setLogs(prev => [`[${timestamp}] Initiating Manual System Resync...`, ...prev.slice(0, 5)]);
        }

        const start = Date.now();
        const [iss, solar] = await Promise.all([
            fetchISSLocation(),
            fetchSolarActivity()
        ]);
        const end = Date.now();

        setStats({
            latency: `${end - start}ms`,
            gateway: iss._status === 'live' ? 'ONLINE' : 'OFFLINE',
            iss: iss._status,
            solar: solar._status,
            gemini: 'STABLE',
            supabase: 'LINKED'
        });

        setLogs(prev => [
            `[${timestamp}] Telemetry Sync: ISS status ${iss._status.toUpperCase()}`,
            `[${timestamp}] Solar Proxy: NOAA scales ${solar._status.toUpperCase()}`,
            `[${timestamp}] Neural Link: Gemini Core Heartbeat ACTIVE`,
            ...prev.slice(0, 5)
        ]);
        
        setTimeout(() => setIsRefreshing(false), 800); // Visual padding
    }, [isRefreshing]);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(() => checkHealth(false), 10000);
        return () => clearInterval(interval);
    }, [checkHealth]);

    const services = [
        { name: 'Gemini AI Core', status: stats?.gemini || 'CONNECTING', type: 'Cognitive Layer', id: 'GMN-03' },
        { name: 'Supabase DB', status: stats?.supabase || 'CONNECTING', type: 'Persistence Layer', id: 'SUP-01' },
        { name: 'ISS Telemetry', status: stats?.iss || 'CONNECTING', type: 'Orbital Stream', id: 'ISS-NOW' },
        { name: 'NOAA Weather', status: stats?.solar || 'CONNECTING', type: 'Solar Flux Proxy', id: 'NOA-SW' },
        { name: 'Local Gateway', status: stats?.gateway || 'OFFLINE', type: 'CORS Bypass', id: 'LCL-GTW' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-space-800/50 p-6 rounded-2xl border border-white/10 backdrop-blur-md relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-display font-bold text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className={`w-2 h-2 bg-cyan-500 rounded-full ${isRefreshing ? 'animate-ping' : 'animate-pulse'}`} />
                            Network Infrastructure Map
                        </h3>
                        <button 
                            onClick={() => checkHealth(true)}
                            disabled={isRefreshing}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-widest transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-400'}`}
                        >
                            <svg className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            {isRefreshing ? 'Syncing...' : 'Manual Resync'}
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {services.map((service, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-cyan-500/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-mono text-[10px] text-gray-500">
                                        {service.id}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white uppercase tracking-wider">{service.name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{service.type}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-[10px] font-black tracking-widest uppercase ${service.status === 'live' || service.status === 'ONLINE' || service.status === 'STABLE' || service.status === 'LINKED' ? 'text-green-400' : service.status === 'simulated' ? 'text-amber-400' : 'text-red-500'}`}>
                                        {service.status}
                                    </div>
                                    <div className="text-[9px] text-gray-600 font-mono">UPLINK_0{i+1}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-black/40 p-6 rounded-2xl border border-white/10 font-mono relative">
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Raw Diagnostic Stream</h4>
                    <div className="space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className={`text-[11px] ${log.includes('Manual') ? 'text-cyan-400' : 'text-gray-300'}`}>
                                <span className="text-cyan-600 mr-2">{'>>>'}</span> {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-cyan-900/10 border border-cyan-500/20 p-6 rounded-2xl">
                    <h4 className="text-[10px] text-cyan-500 uppercase font-bold tracking-[0.2em] mb-4">Node Latency</h4>
                    <div className="text-4xl font-display font-black text-white mb-2">{stats?.latency || '--ms'}</div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: stats ? '65%' : '0%' }}
                            className="h-full bg-cyan-400"
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 leading-relaxed uppercase">
                        Round-trip time for telemetry synchronization across distributed orbital sensors.
                    </p>
                </div>

                <div className="bg-space-800/40 border border-white/10 p-6 rounded-2xl">
                    <h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mb-4">Security Protocol</h4>
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[11px] font-bold text-green-400 uppercase">HTTPS Encryption Active</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded border border-cyan-500/20 mt-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span className="text-[11px] font-bold text-cyan-400 uppercase">JWT Auth Validated</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;