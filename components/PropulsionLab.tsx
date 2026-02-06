import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTechPortProjects, fetchSpaceXLatest } from '../services/apiService';

// --- 3D Engine Component ---
const EngineVisual = ({ thrust, isp }: { thrust: number, isp: number }) => {
    // Thrust affects particle speed/count. ISP affects Color/Spread.
    // ISP 0 (Chemical) -> Orange, Wide spread.
    // ISP 100 (Ion) -> Blue, Narrow beam.

    return (
        <group rotation={[0, 0, Math.PI / 2]}> {/* Pointing right */}
            {/* Nozzle */}
            <mesh position={[-1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 1.2, 2, 32, 1, true]} />
                <meshStandardMaterial color="#333" side={THREE.DoubleSide} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-2.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Exhaust Particles */}
            <ExhaustPlume thrust={thrust} isp={isp} />

            {/* Glow Light */}
            <pointLight position={[0, 0, 0]} distance={5} intensity={thrust * 2} color={isp > 50 ? "#00ffff" : "#ffaa00"} />
        </group>
    );
};

const ExhaustPlume = ({ thrust, isp }: { thrust: number, isp: number }) => {
    const count = 500;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            t: Math.random() * 100, // time offset
            speed: 0.1 + Math.random() * 0.5,
            angle: Math.random() * Math.PI * 2,
            radius: Math.random() * 0.5
        }));
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        const isIon = isp > 50;
        // Logic: active thrust = higher speed
        // active isp = blue color vs orange

        const spreadFactor = isIon ? 0.2 : 0.8;
        const speedFactor = (thrust / 100) * 0.5;

        particles.forEach((p, i) => {
            p.t += speedFactor + 0.05;
            if (p.t > 10) p.t = 0; // reset

            // Position
            const forward = p.t * 2; // Move along X axis (since group is rotated)

            // Cone spread
            const r = p.radius * (1 + forward * spreadFactor);
            const y = Math.cos(p.angle) * r;
            const z = Math.sin(p.angle) * r;

            dummy.position.set(forward, y, z); // forward is +X relative to group (which is rotated to point right? Actually group rot matches parent. Let's assume +X is exhaust direction)

            // Scale shrinks as it fades
            const s = Math.max(0, 1 - p.t / 10) * 0.2;
            dummy.scale.set(s, s, s);

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    const color = isp > 50 ? new THREE.Color("#00ffff") : new THREE.Color("#ffaa00");

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0, 0, 0]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
};


const PropulsionLab: React.FC = () => {
    const [thrust, setThrust] = useState(50); // 0-100
    const [isp, setIsp] = useState(10); // 0-100 (Representation of Chemical <-> Ion)

    const [data, setData] = useState<any>({ techport: [], spacex: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [tp, sx] = await Promise.all([fetchTechPortProjects(), fetchSpaceXLatest()]);
            // TechPort filtering: handle nested structure safely
            const rawList = tp.projects || [];
            const projects = Array.isArray(rawList) ? rawList : (rawList.projects || []);

            setData({
                techport: projects.slice(0, 4),
                spacex: sx
            });
            setLoading(false);
        };
        load();
    }, []);

    const isIon = isp > 50;

    return (
        <div className="flex flex-col gap-6 relative pb-12">
            {/* 3D Viewport */}
            <div className="relative w-full h-[400px] bg-black/60 rounded-3xl border border-white/10 overflow-hidden shrink-0">
                <div className="absolute top-4 left-4 z-10">
                    <h3 className="text-sm font-mono text-cyan-500 uppercase tracking-widest bg-black/50 px-3 py-1 rounded border border-cyan-500/30">
                        Vessel Dynamics Simulation // {isIon ? 'ION PROPULSION' : 'CHEMICAL PROPULSION'}
                    </h3>
                </div>

                <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    <OrbitControls maxPolarAngle={Math.PI / 1.5} minDistance={3} maxDistance={10} enableZoom={false} />

                    <EngineVisual thrust={thrust} isp={isp} />

                    <gridHelper args={[20, 20, 0x222222, 0x111111]} position={[0, -2, 0]} />
                </Canvas>

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur border border-white/10 p-4 rounded-xl flex gap-8 items-center">
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase font-mono">
                            <span>Thrust output (N)</span>
                            <span className="text-white">{thrust}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={thrust} onChange={(e) => setThrust(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase font-mono">
                            <span>Specific Impulse (s) // Type</span>
                            <span className={isIon ? "text-cyan-400" : "text-orange-400"}>{isIon ? 'Electric / Ion' : 'Chemical'}</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={isp} onChange={(e) => setIsp(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Data Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                {/* NASA TechPort Column */}
                <div className="bg-space-800/20 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30 font-bold text-xs">NASA</div>
                        <div>
                            <h4 className="text-white font-bold font-display uppercase tracking-wider">Propulsion R&D</h4>
                            <p className="text-[10px] text-gray-500">Live techport.nasa.gov feed</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-xs text-gray-500 font-mono animate-pulse">Querying NASA Mainframe...</div>
                    ) : (data.techport && data.techport.length > 0) ? (
                        <div className="space-y-3">
                            {data.techport.map((p: any) => (
                                <div key={p.id} className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-red-500/30 transition-colors group">
                                    <div className="text-xs text-red-400 font-mono mb-1 line-clamp-1">{p.id} // {p.status}</div>
                                    <div className="text-sm text-gray-200 font-bold mb-2 line-clamp-2 group-hover:text-white">{p.title || "Classified Project"}</div>
                                    <div className="text-[10px] text-gray-500 line-clamp-3 leading-relaxed">{p.description || "No public description available."}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500">No active propulsion references found in current sector.</div>
                    )}
                </div>

                {/* SpaceX & Physics Column */}
                <div className="space-y-6">
                    {/* SpaceX Stats */}
                    <div className="bg-space-800/20 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 grayscale"><img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/SpaceX_Logo_Black.png" className="w-20" alt="" /></div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-xs">X</div>
                            <div>
                                <h4 className="text-white font-bold font-display uppercase tracking-wider">Latest Launch Telemetry</h4>
                                <p className="text-[10px] text-gray-500">api.spacexdata.com/v4</p>
                            </div>
                        </div>

                        {data.spacex && !data.spacex.error ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase">Mission</div>
                                    <div className="text-sm font-bold text-white truncate">{data.spacex.name}</div>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase">Rocket</div>
                                    <div className="text-sm font-bold text-white">Falcon 9 Block 5</div>
                                </div>
                                <div className="col-span-2 bg-black/40 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Success Probability</div>
                                    <div className="w-full h-1 bg-gray-800 rounded-full mb-1"><div className="w-full h-full bg-green-500 shadow-[0_0_10px_lime]" /></div>
                                    <div className="text-right text-[10px] text-green-500 font-mono">100% NOMINAL</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-500">Telemetry Link Offline.</div>
                        )}
                    </div>

                    {/* Physics Fact */}
                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-cyan-500/20 rounded-2xl p-6">
                        <h4 className="text-cyan-400 font-bold font-mono text-xs uppercase mb-3">Physics Core // Tsiolkovsky Equation</h4>
                        <div className="text-2xl text-white font-serif italic mb-2">Δv = ve · ln(m0 / mf)</div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            The rocket equation governs all vessel dynamics.
                            <span className="text-cyan-300"> ve (Exit Velocity)</span> is typically determined by your ISP (Specific Impulse).
                            Higher ISP (Ion Drives) means far greater efficiency (Δv) for the same fuel mass, but typically lower thrust.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PropulsionLab;
