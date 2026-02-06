import React, { useState } from 'react';
import {
    Bell,
    Radio,
    TrendingUp,
    AlertTriangle,
    Globe,
    Rocket,
    Satellite,
    Zap,
    Clock,
    Filter
} from 'lucide-react';

// ===================================
// MOCK NEWS DATA
// ===================================

const mockNews = [
    {
        id: 1,
        type: 'critical-alert',
        priority: 'high',
        category: 'alert',
        title: 'Solar Storm Warning - G4 Level Geomagnetic Activity',
        description: 'NOAA Space Weather Prediction Center has issued a G4 (Severe) geomagnetic storm watch. Satellite operations and power grids may experience disruptions. Aurora visibility expected at mid-latitudes.',
        timestamp: '2 hours ago',
        icon: AlertTriangle,
        accentColor: 'red'
    },
    {
        id: 2,
        type: 'mission-progress',
        category: 'launch',
        missionName: 'Artemis III',
        phase: 'Pre-Launch Systems Check',
        progress: 73,
        status: 'On Schedule',
        title: 'Artemis III Lunar Mission - T-45 Days to Launch Window',
        description: 'All primary systems nominal. Orion spacecraft integration with SLS rocket completed. Crew training exercises ongoing at Johnson Space Center.',
        timestamp: '5 hours ago',
        icon: Rocket,
        accentColor: 'green'
    },
    {
        id: 3,
        type: 'mission-progress',
        category: 'launch',
        missionName: 'Voyager 1',
        phase: 'Interstellar Data Transmission',
        progress: 85,
        status: 'Active',
        title: 'Voyager 1 Transmits New Data from Beyond Heliosphere',
        description: 'NASA\'s Voyager 1 spacecraft, now 15 billion miles from Earth, has successfully transmitted new measurements of interstellar plasma density. Signal strength remains stable despite distance.',
        timestamp: '1 day ago',
        icon: Satellite,
        accentColor: 'cyan'
    },
    {
        id: 4,
        type: 'general-news',
        category: 'discovery',
        title: 'James Webb Telescope Discovers Potentially Habitable Exoplanet',
        description: 'JWST has detected water vapor and methane signatures in the atmosphere of exoplanet K2-18b, located 120 light-years away in the constellation Leo. The planet orbits within its star\'s habitable zone.',
        image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=400&fit=crop',
        timestamp: '3 days ago',
        icon: Globe,
        accentColor: 'blue'
    },
    {
        id: 5,
        type: 'critical-alert',
        priority: 'medium',
        category: 'alert',
        title: 'ISS Debris Avoidance Maneuver Scheduled',
        description: 'International Space Station will perform a debris avoidance maneuver at 14:30 UTC to avoid a close approach with cataloged space debris. Crew safety is not at risk.',
        timestamp: '8 hours ago',
        icon: Zap,
        accentColor: 'orange'
    },
    {
        id: 6,
        type: 'general-news',
        category: 'discovery',
        title: 'Astronomers Map Largest Cosmic Structure Ever Observed',
        description: 'An international team has mapped the "Big Ring" - a near-perfect ring of galaxies spanning 1.3 billion light-years. The discovery challenges current cosmological models about the universe\'s large-scale structure.',
        image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=400&fit=crop',
        timestamp: '1 week ago',
        icon: TrendingUp,
        accentColor: 'purple'
    }
];

// ===================================
// MAIN NEWS HUB COMPONENT
// ===================================

const NewsHub = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    // Filter news based on active category
    const filteredNews = mockNews.filter(item => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'alerts') return item.type === 'critical-alert';
        if (activeFilter === 'launch') return item.category === 'launch';
        if (activeFilter === 'discovery') return item.category === 'discovery';
        return true;
    });

    // Get breaking news (highest priority alerts)
    const breakingNews = mockNews.find(item => item.type === 'critical-alert' && item.priority === 'high');

    return (
        <div className="w-full h-full bg-[#0B0D17] text-white overflow-hidden flex flex-col">

            {/* BREAKING NEWS TICKER */}
            {breakingNews && (
                <div className="bg-gradient-to-r from-red-900/40 via-red-800/40 to-red-900/40 border-b-2 border-red-500/50 px-6 py-3 flex items-center gap-4 animate-pulse">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-red-400 animate-bounce" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        </div>
                        <span className="text-red-300 font-black text-sm uppercase tracking-widest">BREAKING</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-white font-semibold text-sm truncate">
                            🔴 LIVE: {breakingNews.title}
                        </p>
                    </div>
                    <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                </div>
            )}

            {/* HEADER & FILTER CONTROLS */}
            <div className="bg-[#0B0D17]/95 backdrop-blur-sm border-b border-cyan-500/20 px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Radio className="w-6 h-6 text-cyan-400" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            NEWS HUB
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live Updates</span>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Filter className="w-4 h-4" />
                        <span>Filter:</span>
                    </div>
                    {[
                        { id: 'all', label: 'All Updates', icon: Globe },
                        { id: 'alerts', label: 'Critical Alerts', icon: AlertTriangle },
                        { id: 'launch', label: 'Launch Progress', icon: Rocket },
                        { id: 'discovery', label: 'Discoveries', icon: TrendingUp }
                    ].map(filter => {
                        const Icon = filter.icon;
                        const isActive = activeFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                        ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300'
                                        : 'bg-white/5 border border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{filter.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* MAIN NEWS FEED */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {filteredNews.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No news items match this filter</p>
                        </div>
                    </div>
                ) : (
                    filteredNews.map(item => {
                        // CARD TYPE A: CRITICAL ALERT
                        if (item.type === 'critical-alert') {
                            const Icon = item.icon;
                            const borderColor = item.priority === 'high' ? 'border-red-500' : 'border-orange-500';
                            const bgColor = item.priority === 'high' ? 'bg-red-500/10' : 'bg-orange-500/10';
                            const textColor = item.priority === 'high' ? 'text-red-400' : 'text-orange-400';
                            const glowColor = item.priority === 'high' ? 'shadow-red-500/30' : 'shadow-orange-500/30';

                            return (
                                <div
                                    key={item.id}
                                    className={`${bgColor} border-2 ${borderColor} rounded-xl p-6 ${glowColor} shadow-lg hover:shadow-xl transition-all cursor-pointer group`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 w-12 h-12 ${bgColor} border ${borderColor} rounded-full flex items-center justify-center`}>
                                            <Icon className={`w-6 h-6 ${textColor} group-hover:scale-110 transition-transform`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 ${bgColor} border ${borderColor} rounded text-xs font-bold ${textColor} uppercase`}>
                                                    {item.priority === 'high' ? '⚠️ Critical' : '⚡ Alert'}
                                                </span>
                                                <span className="text-gray-500 text-xs">{item.timestamp}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // CARD TYPE B: MISSION PROGRESS UPDATE
                        if (item.type === 'mission-progress') {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.id}
                                    className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 border border-cyan-500 rounded-full flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-1">
                                            {/* Mission Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="text-lg font-bold text-cyan-300 mb-1">
                                                        {item.missionName}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-300 font-semibold">
                                                            {item.status}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">• {item.phase}</span>
                                                    </div>
                                                </div>
                                                <span className="text-gray-500 text-xs">{item.timestamp}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Mission Progress</span>
                                                    <span className="text-sm font-bold text-cyan-300">{item.progress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${item.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* News Headline */}
                                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // CARD TYPE C: GENERAL NEWS
                        if (item.type === 'general-news') {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.id}
                                    className="bg-white/5 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer group"
                                >
                                    {/* Image */}
                                    {item.image && (
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-transparent to-transparent"></div>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs font-semibold text-blue-300 uppercase">
                                                        Discovery
                                                    </span>
                                                    <span className="text-gray-500 text-xs">{item.timestamp}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return null;
                    })
                )}
            </div>
        </div>
    );
};

export default NewsHub;
