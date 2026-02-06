"use client";

import React, { useState, useEffect, useRef } from 'react';
import { generateMetricInsight, analyzePollutionImage } from '../services/geminiService';
import { fetchLocationData } from '../services/openmeteoService';

// --- Types & Interfaces ---

type ImpactMode = 'AGRICULTURE' | 'DISASTER' | 'POLLUTION' | 'CLIMATE';

interface Metric {
    label: string;
    value: string;
    context: string;
    trend: 'up' | 'down' | 'stable';
    color: string;
}

interface ImpactData {
    id: ImpactMode;
    title: string;
    subtitle: string;
    description: string;
    metrics: Metric[];
    colorClass: string;
}

// --- Configuration Data ---

const IMPACT_MODES: Record<ImpactMode, ImpactData> = {
    AGRICULTURE: {
        id: 'AGRICULTURE',
        title: 'Precision Agriculture',
        subtitle: 'Crop Health Monitoring',
        description: 'Multispectral imaging detects crop stress weeks before the human eye, optimizing irrigation and fertilizer use.',
        colorClass: 'text-green-400',
        metrics: [
            { label: 'NDVI Index', value: '0.78', context: 'Vegetation High', trend: 'stable', color: 'text-green-400' },
            { label: 'Soil Moisture', value: '18%', context: 'Irrigation Needed', trend: 'down', color: 'text-yellow-400' },
            { label: 'Yield Forecast', value: '+12%', context: 'Above Average', trend: 'up', color: 'text-cyan-400' }
        ]
    },
    DISASTER: {
        id: 'DISASTER',
        title: 'Disaster Response',
        subtitle: 'Emergency Management',
        description: 'Thermal sensors detect wildfires through smoke, while radar satellites map flood extents through heavy cloud cover.',
        colorClass: 'text-red-400',
        metrics: [
            { label: 'Thermal Spots', value: '3', context: 'Active Fronts', trend: 'up', color: 'text-red-500' },
            { label: 'Flood Area', value: '450 km²', context: 'Inundated', trend: 'up', color: 'text-orange-400' },
            { label: 'Latency', value: '5 min', context: 'Real-time Alert', trend: 'down', color: 'text-green-400' }
        ]
    },
    POLLUTION: {
        id: 'POLLUTION',
        title: 'Pollution Tracking',
        subtitle: 'Atmospheric Chemistry',
        description: 'Spectrometers measure light absorption to identify invisible methane leaks and nitrogen dioxide plumes from orbit.',
        colorClass: 'text-purple-400',
        metrics: [
            { label: 'NO2 Density', value: 'High', context: 'Industrial Zone', trend: 'up', color: 'text-red-400' },
            { label: 'Methane', value: 'Detected', context: 'Point Source', trend: 'up', color: 'text-yellow-400' },
            { label: 'AQI Level', value: '142', context: 'Unhealthy', trend: 'down', color: 'text-purple-400' }
        ]
    },
    CLIMATE: {
        id: 'CLIMATE',
        title: 'Climate Analysis',
        subtitle: 'Long-term Observation',
        description: 'Decades of consistent satellite imagery provide the irrefutable data needed to model sea level rise and ice mass loss.',
        colorClass: 'text-cyan-400',
        metrics: [
            { label: 'Ice Mass', value: '-12%', context: 'Decadal Loss', trend: 'down', color: 'text-red-400' },
            { label: 'Sea Level', value: '+3.4mm', context: 'Annual Rise', trend: 'up', color: 'text-blue-400' },
            { label: 'Forest Cover', value: 'Stable', context: 'Protected Area', trend: 'stable', color: 'text-green-400' }
        ]
    }
};

// --- Icons ---

const Icons = {
    Satellite: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Eye: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Scan: () => <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l3.293 3.293a1 1 0 01-1.414 1.414L4 6.414V9a1 1 0 01-2 0V4zm17 0a1 1 0 00-1-1h-4a1 1 0 000 2h2.586l-3.293 3.293a1 1 0 101.414 1.414L19 6.414V9a1 1 0 002 0V4zM3 20a1 1 0 001 1h4a1 1 0 000-2H5.414l3.293-3.293a1 1 0 10-1.414-1.414L4 17.586V15a1 1 0 00-2 0v5zM20 20a1 1 0 01-1 1h-4a1 1 0 010-2h2.586l-3.293-3.293a1 1 0 011.414-1.414L19 17.586V15a1 1 0 012 0v5z" /></svg>,
    Leaf: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    Alert: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Wind: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Thermo: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    TrendUp: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    TrendDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
    Activity: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    ArrowRight: () => <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
};

// --- Sub-Components ---

interface ComparisonSliderProps {
    imgLeft: string;
    imgRight: string;
    labelLeft: string;
    labelRight: string;
    overlayColor?: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ imgLeft, imgRight, labelLeft, labelRight, overlayColor }) => {
    const [sliderValue, setSliderValue] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            if (entries[0]) setContainerWidth(entries[0].contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-xl bg-black border border-white/10 select-none group">
            <div className="absolute inset-0 w-full h-full">
                <img src={imgRight} alt="Analysis" className="w-full h-full object-cover opacity-90" />
                {overlayColor && (
                    <div className={`absolute inset-0 ${overlayColor} mix-blend-overlay transition-opacity duration-300 ease-out ${isDragging ? 'opacity-70' : 'opacity-30'}`} />
                )}
                <div className={`absolute top-4 right-4 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white border border-white/20 flex items-center gap-2 transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                    <Icons.Satellite /> {labelRight}
                </div>
            </div>

            <div
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white/80 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10"
                style={{ width: `${sliderValue}%` }}
            >
                <div style={{ width: containerWidth || '100vw', height: '100%' }}>
                    <img src={imgLeft} alt="Visual" className="w-full h-full object-cover" />
                </div>
                <div className={`absolute top-4 left-4 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white border border-white/20 flex items-center gap-2 transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                    <Icons.Eye /> {labelLeft}
                </div>
            </div>

            <input
                type="range"
                min="0" max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />

            <div
                className="absolute inset-y-0 -ml-4 w-8 z-20 pointer-events-none flex items-center justify-center transition-all duration-150"
                style={{ left: `${sliderValue}%`, transform: isDragging ? 'scale(1.1)' : 'scale(1)' }}
            >
                <div className={`w-8 h-8 rounded-full backdrop-blur border shadow-lg flex items-center justify-center transition-colors duration-300 ${isDragging ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-white/20 border-white text-white'}`}>
                    <Icons.Scan />
                </div>
            </div>

            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/90 bg-black/60 px-3 py-1 rounded-full pointer-events-none border border-white/10 transition-opacity duration-500 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                DRAG TO COMPARE
            </div>
        </div>
    );
};

// --- Main Component ---

const EarthVisualizer: React.FC = () => {
    const [activeMode, setActiveMode] = useState<ImpactMode>('POLLUTION');
    const [insights, setInsights] = useState<Record<string, string>>({});
    const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});

    // --- Unified States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [userImage, setUserImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [dynamicMetrics, setDynamicMetrics] = useState<Metric[]>(IMPACT_MODES.POLLUTION.metrics);

    // Default image pairs per mode
    const [sliderImages, setSliderImages] = useState({
        left: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200",
        right: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1200"
    });

    const currentData = IMPACT_MODES[activeMode];

    // --- Tab Switcher Logic ---
    const switchTab = (mode: ImpactMode) => {
        setActiveMode(mode);
        setUserImage(null);
        setSearchQuery("");
        setDynamicMetrics(IMPACT_MODES[mode].metrics);

        // Immediate image switching to prevent black screen bug
        if (mode === 'AGRICULTURE') {
            setSliderImages({
                left: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200",
                right: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=1200"
            });
        } else if (mode === 'DISASTER') {
            setSliderImages({
                left: "https://images.unsplash.com/photo-1621223917765-dbd88e89528d?q=80&w=1200",
                right: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1200"
            });
        } else if (mode === 'CLIMATE') {
            setSliderImages({
                left: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=1200",
                right: "https://images.unsplash.com/photo-1617112028741-69234b6e5109?q=80&w=1200"
            });
        } else {
            setSliderImages({
                left: "https://images.unsplash.com/photo-1534081333815-ae5019106622?q=80&w=1200",
                right: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1200"
            });
        }
    };

    // --- Search Handler (Real Data Integration) ---
    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsScanning(true);
        try {
            const result = await fetchLocationData(searchQuery, activeMode);
            if (result && result.metrics) {
                // Update Slider with dynamic geocoded imagery if available, else keep current
                if (result.images) setSliderImages(result.images);

                // Map API values (val1, val2, val3) to UI cards
                const m = result.metrics;
                setDynamicMetrics([
                    { label: m.val1.label, value: `${m.val1.value}${m.val1.unit ? ' ' + m.val1.unit : ''}`, context: 'Remote Telemetry', trend: 'stable', color: 'text-cyan-400' },
                    { label: m.val2.label, value: `${m.val2.value}${m.val2.unit ? ' ' + m.val2.unit : ''}`, context: 'Spectral Analysis', trend: 'up', color: 'text-purple-400' },
                    { label: m.val3.label, value: `${m.val3.value}${m.val3.unit ? ' ' + m.val3.unit : ''}`, context: result.locationName, trend: 'down', color: 'text-green-400' }
                ]);
            }
        } catch (e) {
            console.error("Discovery Failed:", e);
        } finally {
            setIsScanning(false);
        }
    };

    // --- Upload Handler (Antigravity Protocol) ---
    const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setUserImage(base64);
            setIsScanning(true);

            const aiData = await analyzePollutionImage(base64, activeMode);
            if (aiData && aiData.val1) {
                setDynamicMetrics([
                    {
                        label: aiData.val1.label,
                        value: `${aiData.val1.value}${aiData.val1.unit ? ' ' + aiData.val1.unit : ''}`,
                        context: 'Antigravity Vision',
                        trend: 'up',
                        color: 'text-cyan-400'
                    },
                    {
                        label: aiData.val2.label,
                        value: `${aiData.val2.value}${aiData.val2.unit ? ' ' + aiData.val2.unit : ''}`,
                        context: 'Spectral Proxy',
                        trend: 'stable',
                        color: 'text-purple-400'
                    },
                    {
                        label: 'Analysis Confidence',
                        value: `${aiData.confidence}%`,
                        context: aiData.tactical_insight,
                        trend: 'up',
                        color: 'text-green-400'
                    }
                ]);
            }
            setIsScanning(false);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        dynamicMetrics.forEach(async (metric, index) => {
            const key = `${activeMode}-${index}`;
            if (insights[key]) return;
            setLoadingInsights(prev => ({ ...prev, [key]: true }));
            try {
                const text = await generateMetricInsight(metric.label, metric.value, metric.context, metric.trend);
                setInsights(prev => ({ ...prev, [key]: text }));
            } catch (e) {
            } finally {
                setLoadingInsights(prev => ({ ...prev, [key]: false }));
            }
        });
    }, [activeMode, dynamicMetrics]);

    return (
        <div className="flex flex-col h-full w-full bg-space-900 overflow-hidden relative">

            {/* COMMAND DECK Row (Unified UI) */}
            <div className="shrink-0 flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                <div className="flex-1 w-full relative">
                    <input
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-cyan-500/50 outline-none transition-all"
                        placeholder="Uplink Location (City or Region)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <label className="cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-6 py-2.5 rounded-xl text-xs font-bold border border-cyan-500/30 flex items-center gap-2 transition-all whitespace-nowrap">
                    {isScanning ? <span className="animate-pulse">DECRYPTING...</span> : <><Icons.Scan /> Hyperspectral Upload</>}
                    <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
                </label>
            </div>

            {/* Header / Tabs */}
            <div className="shrink-0 mb-6 pb-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                        <Icons.Satellite /> EARTH MONITOR
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Multi-spectral planetary intelligence and environmental analytics.</p>
                </div>

                <div className="flex bg-space-800 p-1 rounded-lg border border-white/5">
                    {(Object.keys(IMPACT_MODES) as ImpactMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => switchTab(mode)}
                            className={`
                                flex items-center gap-2 px-3 py-2 text-xs font-bold rounded transition-colors
                                ${activeMode === mode ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}
                            `}
                        >
                            {mode === 'AGRICULTURE' && <Icons.Leaf />}
                            {mode === 'DISASTER' && <Icons.Alert />}
                            {mode === 'POLLUTION' && <Icons.Wind />}
                            {mode === 'CLIMATE' && <Icons.Thermo />}
                            <span className="hidden md:inline">{IMPACT_MODES[mode].title.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                <div className="lg:col-span-8 flex flex-col gap-4">
                    <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                        <ComparisonSlider
                            imgLeft={userImage || sliderImages.left}
                            imgRight={sliderImages.right}
                            labelLeft={userImage ? "Optical Capture" : "Optical Vista"}
                            labelRight="Antigravity Lens"
                            overlayColor={
                                activeMode === 'AGRICULTURE' ? 'bg-green-600' :
                                    activeMode === 'DISASTER' ? 'bg-red-600' :
                                        activeMode === 'POLLUTION' ? 'bg-purple-600' :
                                            'bg-cyan-600'
                            }
                        />

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 pointer-events-none z-20">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${currentData.colorClass.replace('text', 'bg')}`}></span>
                                <h3 className={`font-bold uppercase tracking-widest text-sm ${currentData.colorClass}`}>{currentData.title}</h3>
                            </div>
                            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">{currentData.description}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Live Telemetry</h4>
                        {dynamicMetrics.map((metric, i) => {
                            const key = `${activeMode}-${i}`;
                            return (
                                <div key={i} className="bg-space-800/40 p-4 rounded-lg border border-white/5 flex justify-between items-start group hover:bg-space-800/60 transition-colors">
                                    <div className="flex-1 mr-4">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{metric.label}</div>
                                        <div className="text-xl font-display font-bold text-white leading-none mb-1">{metric.value}</div>
                                        <div className="text-[10px] text-gray-400 italic">{metric.context}</div>

                                        <div className="mt-2 pt-2 border-t border-white/5">
                                            {loadingInsights[key] ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[9px] text-cyan-500/50 font-mono">AI ANALYZING...</span>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-cyan-300 font-mono leading-relaxed border-l-2 border-cyan-500/30 pl-2">
                                                    {insights[key] || "Syncing with orbital nodes..."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`${metric.color} bg-white/5 p-2 rounded-full mt-1 shrink-0`}>
                                        {metric.trend === 'up' && <Icons.TrendUp />}
                                        {metric.trend === 'down' && <Icons.TrendDown />}
                                        {metric.trend === 'stable' && <div className="w-4 h-1 bg-current rounded-full" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarthVisualizer;