
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CelestialEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const EVENTS: CelestialEvent[] = [
  { 
    id: '1', 
    name: 'ISS Zenith Pass', 
    date: '2025-05-15', 
    type: 'ISS Pass', 
    visibility: 'High', 
    explanation: 'The International Space Station zooms across the sky faster than a jet. It looks like a bright, steady star moving in a straight line without blinking.',
    peakTime: '21:48 UTC',
    significance: 'Watching the ISS helps us appreciate humans living and working in space 250 miles above Earth.',
    timeWindow: '21:45 - 21:51 (6m)',
    conditionSummary: 'Clear sky required. Visible even with city lights.',
    coordinates: [45, -73],
    position: { top: '28%', left: '29%' },
    targetDate: '2025-05-15T21:48:00Z',
    locationName: 'North America Zenith',
    coordinatesText: 'LAT 45.0° N | LON 73.0° W'
  },
  { 
    id: '2', 
    name: 'Perseids Peak', 
    date: '2025-08-12', 
    type: 'Meteor Shower', 
    visibility: 'High', 
    explanation: 'Earth is traveling through a trail of dust left by a comet. These tiny space pebbles burn up in our air, creating "shooting stars" we call meteors.',
    peakTime: '02:00 UTC',
    significance: 'Helps scientists track the path and decay of ancient comets in our solar system.',
    timeWindow: '22:00 - 04:00 (6h Window)',
    conditionSummary: 'Dark location away from city lights recommended.',
    coordinates: [30, 10],
    position: { top: '38%', left: '53%' },
    targetDate: '2025-08-12T02:00:00Z',
    locationName: 'Northern Hemisphere',
    coordinatesText: 'LAT 30.0° N | LON 10.0° E'
  },
  { 
    id: '3', 
    name: 'Mars Opposition', 
    date: '2025-12-08', 
    type: 'Conjunction', 
    visibility: 'Medium', 
    explanation: 'Earth is passing right between the Sun and Mars. This makes the Red Planet look much bigger and brighter than usual, like a glowing orange ember.',
    peakTime: 'Midnight UTC',
    significance: 'Provides the best opportunity for telescopes to see volcanoes and ice caps on Mars.',
    timeWindow: '18:00 - 05:00 (All Night)',
    conditionSummary: 'Minimal haze needed for high-power viewing.',
    coordinates: [-20, 130],
    position: { top: '65%', left: '85%' },
    targetDate: '2025-12-08T00:00:00Z',
    locationName: 'Australian Outback',
    coordinatesText: 'LAT 20.0° S | LON 130.0° E'
  }
];

const CelestialMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<CelestialEvent | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<CelestialEvent | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00', finished: false });

  const activeEvent = hoveredEvent || selectedEvent;

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
        if(svgRef.current?.parentElement) {
            setDimensions({
                width: svgRef.current.parentElement.clientWidth,
                height: svgRef.current.parentElement.clientHeight
            });
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Map Drawing (D3)
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous D3 renders

    const { width, height } = dimensions;

    const projection = d3.geoEquirectangular()
      .scale(width / 6.3)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((data: any) => {
      svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator as any)
        .attr("fill", "#0f172a") 
        .attr("stroke", "#00F0FF") 
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.3);
    });
    
  }, [dimensions]);

  // Countdown Logic
  useEffect(() => {
    if (!activeEvent) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(activeEvent.targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        return { d: '00', h: '00', m: '00', s: '00', finished: true };
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');

      return { d, h, m, s, finished: false };
    };

    // Initial Set
    setTimeLeft(calculateTime());

    const timerInterval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [activeEvent]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-6">
      {/* Left Column: Events List Sidebar */}
      <div className="w-full lg:w-1/3 bg-space-800/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold text-white tracking-widest uppercase">Target Events</h2>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f0ff]" />
        </div>
        
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {EVENTS.map(event => (
                <motion.div 
                    layout
                    key={event.id}
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedEvent?.id === event.id ? 'bg-cyan-900/30 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-black/20 border-white/5 hover:border-cyan-500/30'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-display font-bold text-white tracking-wide uppercase text-sm">{event.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${event.visibility === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {event.visibility}
                        </span>
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedEvent?.id === event.id ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <p className="text-xs text-gray-200 mt-2 mb-3 leading-relaxed border-l-2 border-cyan-500 pl-3">
                                    {event.explanation}
                                </p>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-black/40 p-2 rounded">
                                        <div className="text-[9px] text-cyan-500 uppercase font-mono font-bold">Event Date</div>
                                        <div className="text-xs text-white font-bold">{event.date}</div>
                                    </div>
                                    <div className="bg-black/40 p-2 rounded">
                                        <div className="text-[9px] text-cyan-500 uppercase font-mono font-bold">Peak Visibility</div>
                                        <div className="text-xs text-white font-bold">{event.peakTime}</div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-white/70 italic bg-white/5 p-2 rounded border border-white/10">
                                    <span className="text-cyan-400 font-bold uppercase mr-1">Significance:</span>
                                    {event.significance}
                                </div>
                            </motion.div>
                        ) : (
                            <p className="text-[11px] text-gray-400 line-clamp-2">{event.explanation}</p>
                        )}
                    </AnimatePresence>

                    {!selectedEvent && (
                        <div className="text-[9px] text-cyan-500/60 font-mono mt-2 uppercase tracking-widest">Select for detailed intel</div>
                    )}
                </motion.div>
            ))}
        </div>
      </div>

      {/* Right Column: Global Visibility Tracker Map */}
      <div className="w-full lg:w-2/3 h-[400px] lg:h-auto bg-space-900/80 rounded-2xl border border-white/10 relative overflow-hidden group">
        
        {/* Map Header */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <h3 className="text-lg font-display font-bold text-white tracking-widest uppercase">Visibility Tracker</h3>
            <p className="text-[10px] text-cyan-400 font-mono mt-1 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${activeEvent ? 'bg-cyan-400 animate-pulse shadow-[0_0_5px_#00f0ff]' : 'bg-gray-600'}`}></span>
                ACTIVE SCAN: {activeEvent ? activeEvent.name.toUpperCase() : 'GLOBAL MONITORING'}
            </p>
        </div>

        {/* React-Based Map Markers (Absolute Positioning) */}
        {EVENTS.map((event) => {
            const isActive = selectedEvent?.id === event.id;
            const isDimmed = selectedEvent !== null && !isActive;

            return (
                <div
                    key={event.id}
                    className={`absolute rounded-full cursor-pointer transition-all duration-500 ease-out flex items-center justify-center
                        ${isActive 
                            ? 'w-6 h-6 bg-cyan-400 border-2 border-white shadow-[0_0_20px_rgba(0,240,255,0.8)] z-20 scale-125 opacity-100' 
                            : isDimmed
                                ? 'w-3 h-3 bg-gray-500 border border-white/20 opacity-20 blur-[1px] scale-90 z-0'
                                : 'w-4 h-4 bg-cyan-500/50 border border-cyan-300 hover:scale-110 hover:bg-cyan-400 z-10 opacity-80'
                        }
                    `}
                    style={{ 
                        top: event.position?.top || '50%', 
                        left: event.position?.left || '50%',
                        transform: 'translate(-50%, -50%)' 
                    }}
                    onClick={() => setSelectedEvent(isActive ? null : event)}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                >
                    {isActive && (
                        <div className="absolute inset-[-10px] rounded-full border border-cyan-500/50 animate-ping opacity-75" />
                    )}
                    <div className={`absolute top-[-30px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-2 py-1 rounded text-[10px] text-white border border-white/20 transition-opacity duration-300 pointer-events-none ${isActive || hoveredEvent?.id === event.id ? 'opacity-100' : 'opacity-0'}`}>
                        {event.name}
                    </div>
                </div>
            );
        })}

        {/* HUD Telemetry Overlay (Countdown + Location) */}
        <AnimatePresence>
            {activeEvent && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute bottom-6 right-6 z-20 bg-black/80 backdrop-blur-md border border-cyan-500/30 p-5 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] w-80 pointer-events-none"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                         <div>
                             <div className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1 font-bold">Target Locked</div>
                             <div className="text-sm font-display font-bold text-white uppercase leading-none">{activeEvent.name}</div>
                         </div>
                         <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${activeEvent.visibility === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {activeEvent.visibility}
                         </span>
                    </div>

                    {/* Countdown Timer */}
                    <div className="mb-5">
                         <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${timeLeft.finished ? 'bg-red-500' : 'bg-cyan-400 animate-pulse'}`} />
                             Mission Countdown
                         </div>
                         {timeLeft.finished ? (
                             <div className="bg-red-500/10 border border-red-500/30 text-red-400 font-display font-bold text-center py-2 rounded tracking-widest text-lg">
                                 MISSION COMPLETED
                             </div>
                         ) : (
                             <div className="grid grid-cols-4 gap-2 text-center">
                                 {['DAYS', 'HRS', 'MIN', 'SEC'].map((label, i) => (
                                     <div key={label} className="bg-space-900/80 border border-white/10 rounded p-1">
                                         <div className="font-mono text-xl text-cyan-400 font-bold leading-none">
                                             {i === 0 ? timeLeft.d : i === 1 ? timeLeft.h : i === 2 ? timeLeft.m : timeLeft.s}
                                         </div>
                                         <div className="text-[8px] text-gray-600 font-bold mt-1">{label}</div>
                                     </div>
                                 ))}
                             </div>
                         )}
                    </div>

                    {/* Location Telemetry */}
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider mb-1">Target Coordinates</div>
                        <div className="text-xs font-bold text-white mb-0.5">{activeEvent.locationName}</div>
                        <div className="text-[10px] font-mono text-cyan-300/80">{activeEvent.coordinatesText}</div>
                    </div>

                    <div className="mt-4 h-0.5 w-full bg-cyan-900/50 overflow-hidden rounded-full">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="h-full bg-cyan-400 shadow-[0_0_10px_#00F0FF]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <svg ref={svgRef} className="w-full h-full absolute inset-0 z-0 pointer-events-none" />
        
        {/* Aesthetic HUD Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-white/5 rounded-tr-2xl pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-white/5 rounded-bl-2xl pointer-events-none z-10" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] z-0" />
      </div>
    </div>
  );
};

export default CelestialMap;
