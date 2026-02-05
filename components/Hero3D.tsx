// @ts-nocheck
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ViewState, AuthMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceAssistant from './VoiceAssistant';

const TEXTURES = {
  map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  specular: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  normal: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
};

const Earth = () => {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [colorMap, specularMap, cloudMap, normalMap] = useLoader(THREE.TextureLoader, [
    TEXTURES.map, TEXTURES.specular, TEXTURES.clouds, TEXTURES.normal
  ]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = t * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y = t * 0.07;
  });

  return (
    <group ref={earthRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial map={colorMap} specularMap={specularMap} normalMap={normalMap} specular={new THREE.Color(0x333333)} shininess={15} />
      </mesh>
      <mesh ref={cloudsRef} scale={[1.015, 1.015, 1.015]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial map={cloudMap} transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Scene = ({ isZooming }: { isZooming: boolean }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6.5]} fov={45} />
      <ambientLight intensity={0.2} color="#2e1065" /> 
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" /> 
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />
      <Float speed={isZooming ? 0 : 0.5} rotationIntensity={isZooming ? 0 : 0.1} floatIntensity={isZooming ? 0 : 0.1}>
        <Earth />
      </Float>
    </>
  );
};

interface HeroProps {
  setView: (view: ViewState) => void;
  onVoiceRegister: (mode: AuthMode) => void;
}

const Hero3D: React.FC<HeroProps> = ({ setView, onVoiceRegister }) => {
  const [isZooming, setIsZooming] = useState(false);

  const handleStart = (mode: AuthMode = AuthMode.LOGIN) => {
    setIsZooming(true);
    // Visual zoom-in delay before navigation
    setTimeout(() => {
        onVoiceRegister(mode);
    }, 1200);
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-[#0B0D17] via-[#1a103c] to-[#0B0D17] overflow-hidden">
      <Canvas className="absolute inset-0 z-0" dpr={[1, 2]}> 
        <Scene isZooming={isZooming} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isZooming} autoRotateSpeed={0.5} enabled={!isZooming} />
      </Canvas>

      <VoiceAssistant active={!isZooming} onTriggerRegistration={() => handleStart(AuthMode.SIGNUP)} />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
        <AnimatePresence>
            {!isZooming && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 2, filter: "blur(10px)" }}
                className="flex flex-col items-center"
            >
                <h1 className="text-7xl md:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-purple-400 drop-shadow-[0_0_35px_rgba(139,92,246,0.4)] mb-2 tracking-tighter">
                    SPACESCOPE
                </h1>

                <p className="text-cyan-200 font-sans text-sm md:text-lg tracking-[0.3em] uppercase mb-12">
                    Cosmic Intelligence Platform
                </p>

                <div className="pointer-events-auto flex flex-col items-center gap-6">
                    <button
                        onClick={() => handleStart(AuthMode.LOGIN)}
                        className="group relative px-12 py-5 bg-black/20 overflow-hidden rounded-none border border-cyan-500/30 hover:border-cyan-400 transition-colors"
                        style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                    >
                        <span className="relative z-10 font-display font-bold text-white tracking-[0.2em] text-lg flex items-center gap-3">
                            INITIALIZE SYSTEM
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </span>
                    </button>

                    <button 
                        onClick={() => handleStart(AuthMode.SIGNUP)}
                        className="group text-xs font-mono text-cyan-500/80 hover:text-white transition-all uppercase tracking-[0.4em] flex flex-col items-center gap-3"
                    >
                        <span className="flex items-center gap-3 border-b border-cyan-500/20 pb-1 px-4 group-hover:border-cyan-400">
                           <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                           Manual Registration
                        </span>
                        <span className="text-[8px] opacity-40 lowercase tracking-widest italic group-hover:opacity-100 transition-opacity">Request New Credentials Bypass</span>
                    </button>

                    <div className="mt-4 text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] opacity-40">
                        Neural Voice Link Active • Say "New Account"
                    </div>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Hero3D;