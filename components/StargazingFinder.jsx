import React, { useState } from 'react';
import { Telescope, MapPin, Compass, Clock, Star, Search, Filter } from 'lucide-react';

// ===================================
// MOCK DATA - Realistic Stargazing Spots
// ===================================

const mockSpots = [
    {
        id: 1,
        name: "Griffith Observatory",
        image: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?w=400&h=300&fit=crop",
        distance: "12 km",
        lightPollution: "Bortle 7 (Suburban)",
        equipment: "🔭 14-inch Zeiss Reflector",
        equipmentType: "telescope",
        rating: 4.8,
        constellations: [
            {
                name: "Orion (The Hunter)",
                visibilityWindow: "22:00 - 02:00",
                direction: "South-East 135°",
                brightness: "Excellent"
            },
            {
                name: "Ursa Major (Big Dipper)",
                visibilityWindow: "20:00 - 05:00",
                direction: "North 15°",
                brightness: "Very Good"
            }
        ]
    },
    {
        id: 2,
        name: "Cherry Springs State Park",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
        distance: "45 km",
        lightPollution: "Bortle 2 (Dark Sky)",
        equipment: "🔭 Public Telescopes + Binoculars",
        equipmentType: "both",
        rating: 5.0,
        constellations: [
            {
                name: "Andromeda Galaxy (M31)",
                visibilityWindow: "21:00 - 03:00",
                direction: "North-East 45°",
                brightness: "Excellent"
            },
            {
                name: "Cassiopeia (The Queen)",
                visibilityWindow: "All Night",
                direction: "North 10°",
                brightness: "Outstanding"
            }
        ]
    },
    {
        id: 3,
        name: "Rooftop Observatory - Tech Hub",
        image: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=300&fit=crop",
        distance: "3 km",
        lightPollution: "Bortle 8 (City)",
        equipment: "🔭 8-inch Dobsonian",
        equipmentType: "telescope",
        rating: 4.2,
        constellations: [
            {
                name: "Jupiter & Saturn",
                visibilityWindow: "19:00 - 23:00",
                direction: "South-West 220°",
                brightness: "Very Bright"
            },
            {
                name: "Lyra (The Harp)",
                visibilityWindow: "21:00 - 01:00",
                direction: "East 90°",
                brightness: "Good"
            }
        ]
    },
    {
        id: 4,
        name: "Desert Sky Observatory",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        distance: "78 km",
        lightPollution: "Bortle 1 (Pristine)",
        equipment: "🔭 16-inch Ritchey-Chrétien",
        equipmentType: "telescope",
        rating: 5.0,
        constellations: [
            {
                name: "Milky Way Core",
                visibilityWindow: "23:00 - 04:00",
                direction: "South 180°",
                brightness: "Spectacular"
            },
            {
                name: "Scorpius (The Scorpion)",
                visibilityWindow: "22:00 - 03:00",
                direction: "South-East 150°",
                brightness: "Excellent"
            }
        ]
    },
    {
        id: 5,
        name: "Lakeside Viewing Platform",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        distance: "18 km",
        lightPollution: "Bortle 4 (Rural)",
        equipment: "👓 Public Binoculars",
        equipmentType: "binoculars",
        rating: 4.5,
        constellations: [
            {
                name: "Pleiades (Seven Sisters)",
                visibilityWindow: "20:00 - 02:00",
                direction: "East 85°",
                brightness: "Very Good"
            },
            {
                name: "Taurus (The Bull)",
                visibilityWindow: "21:00 - 03:00",
                direction: "East-South-East 110°",
                brightness: "Good"
            }
        ]
    },
    {
        id: 6,
        name: "Mountain Peak Observatory",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
        distance: "92 km",
        lightPollution: "Bortle 2 (Dark Sky)",
        equipment: "🔭 20-inch Reflector + Binoculars",
        equipmentType: "both",
        rating: 4.9,
        constellations: [
            {
                name: "Cygnus (The Swan)",
                visibilityWindow: "21:00 - 04:00",
                direction: "North-East 60°",
                brightness: "Excellent"
            },
            {
                name: "Aquila (The Eagle)",
                visibilityWindow: "22:00 - 02:00",
                direction: "South 175°",
                brightness: "Very Good"
            }
        ]
    }
];

// ===================================
// MAIN COMPONENT
// ===================================

const StargazingFinder = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);

    // Filter options
    const filters = [
        { id: 'telescope', label: 'Telescope Available', icon: '🔭' },
        { id: 'binoculars', label: 'Binoculars', icon: '👓' },
        { id: 'darksky', label: 'Dark Sky Zone', icon: '🌌' }
    ];

    // Toggle filter
    const toggleFilter = (filterId) => {
        setActiveFilters(prev =>
            prev.includes(filterId)
                ? prev.filter(f => f !== filterId)
                : [...prev, filterId]
        );
    };

    // Filter spots based on search and active filters
    const filteredSpots = mockSpots.filter(spot => {
        // Search filter
        const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spot.equipment.toLowerCase().includes(searchQuery.toLowerCase());

        // Equipment filters
        const matchesFilters = activeFilters.length === 0 || activeFilters.every(filter => {
            if (filter === 'telescope') return spot.equipmentType === 'telescope' || spot.equipmentType === 'both';
            if (filter === 'binoculars') return spot.equipmentType === 'binoculars' || spot.equipmentType === 'both';
            if (filter === 'darksky') return spot.lightPollution.includes('Bortle 1') || spot.lightPollution.includes('Bortle 2');
            return true;
        });

        return matchesSearch && matchesFilters;
    });

    return (
        <div className="w-full h-full bg-[#0B0D17] text-white overflow-y-auto">
            {/* Header Section */}
            <div className="sticky top-0 z-10 bg-[#0B0D17]/95 backdrop-blur-sm border-b border-cyan-500/20">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    {/* Title */}
                    <div className="flex items-center gap-3 mb-6">
                        <Telescope className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            STARGAZING FINDER
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                        <input
                            type="text"
                            placeholder="Find observatories, dark sky parks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-cyan-500/30 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-3">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => toggleFilter(filter.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeFilters.includes(filter.id)
                                        ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300'
                                        : 'bg-white/5 border border-cyan-500/30 text-gray-400 hover:border-cyan-400/50 hover:text-cyan-300'
                                    }`}
                            >
                                <span>{filter.icon}</span>
                                <span>{filter.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content - Location Cards Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {filteredSpots.length === 0 ? (
                    <div className="text-center py-20">
                        <Star className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No stargazing spots found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSpots.map(spot => (
                            <LocationCard key={spot.id} spot={spot} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ===================================
// LOCATION CARD COMPONENT
// ===================================

const LocationCard = ({ spot }) => {
    return (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-cyan-500/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-transparent to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-white">{spot.rating}</span>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-5">
                {/* Spot Name & Distance */}
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {spot.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            <span>{spot.distance}</span>
                        </div>
                        <div className="px-2 py-1 bg-cyan-500/10 rounded text-cyan-300 text-xs font-medium">
                            {spot.lightPollution}
                        </div>
                    </div>
                </div>

                {/* Equipment Badge */}
                <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Telescope className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-300">{spot.equipment}</span>
                    </div>
                </div>

                {/* CONSTELLATION FORECAST SECTION (CRITICAL) */}
                <div className="border-t border-cyan-500/20 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                            Visible Tonight
                        </h4>
                    </div>

                    {/* Constellation List */}
                    <div className="space-y-3">
                        {spot.constellations.map((constellation, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 border border-cyan-500/20 rounded-lg p-3 hover:bg-white/10 transition-colors"
                            >
                                {/* Constellation Name */}
                                <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-semibold text-white text-sm flex items-center gap-2">
                                        <span className="text-cyan-400">★</span>
                                        {constellation.name}
                                    </h5>
                                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                                        {constellation.brightness}
                                    </span>
                                </div>

                                {/* Visibility Window */}
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="font-medium text-cyan-300">Best View:</span>
                                    <span>{constellation.visibilityWindow}</span>
                                </div>

                                {/* Direction */}
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="font-medium text-cyan-300">Look:</span>
                                    <span>{constellation.direction}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Get Directions</span>
                </button>
            </div>
        </div>
    );
};

export default StargazingFinder;
