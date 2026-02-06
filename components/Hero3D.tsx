// @ts-nocheck
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ViewState, AuthMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const TEXTURES = {
  map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  specular: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  normal: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
};

const Earth = () => {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  const [colorMap, specularMap, cloudMap, normalMap] = useLoader(THREE.TextureLoader, [
    TEXTURES.map, TEXTURES.specular, TEXTURES.clouds, TEXTURES.normal
  ]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = t * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y = t * 0.07;

    // Wireframe Animation (Pulsating & Counter-Rotation)
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = -t * 0.02; // Slow counter-rotation for tech effect

      const targetOpacity = hovered ? 0.3 : 0.05;
      const targetColor = hovered ? new THREE.Color("#00F0FF") : new THREE.Color("#3b0764"); // Cyan vs Deep Purple

      // Pulse effect
      const pulse = hovered ? Math.sin(t * 8) * 0.1 + 0.3 : 0.05;

      // Lerp values
      (wireframeRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (wireframeRef.current.material as THREE.MeshBasicMaterial).opacity,
        pulse,
        0.1
      );
      (wireframeRef.current.material as THREE.MeshBasicMaterial).color.lerp(targetColor, 0.1);
    }
  });

  return (
    <group ref={earthRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial map={colorMap} specularMap={specularMap} normalMap={normalMap} specular={new THREE.Color(0x333333)} shininess={15} />
      </mesh>
      <mesh
        ref={wireframeRef}
        scale={[1.01, 1.01, 1.01]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[2.02, 24, 24]} />
        <meshBasicMaterial
          color="#3b0764"
          wireframe
          transparent
          opacity={0.05}
        />
      </mesh>
      <mesh ref={cloudsRef} scale={[1.015, 1.015, 1.015]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial map={cloudMap} transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
};

const SatelliteSystem = () => {
  const groupRef = useRef<THREE.Group>(null);
  const satRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.2;
    if (satRef.current) {
      // Circular orbit logic
      const radius = 3.6;
      satRef.current.position.x = Math.cos(t) * radius;
      satRef.current.position.z = Math.sin(t) * radius;
      satRef.current.rotation.y = -t; // Orient towards flight direction roughly
    }
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0.3]}>
      {/* Orbital Path Line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.58, 3.62, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* The Satellite */}
      <group ref={satRef}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.4]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.3]} />
          <meshStandardMaterial color="#1e3a8a" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.3]} />
          <meshStandardMaterial color="#1e3a8a" metalness={1} roughness={0.1} />
        </mesh>
        <pointLight position={[0, 0, 0.3]} color="#00F0FF" distance={1.5} intensity={3} />
      </group>
    </group>
  );
};

const SpaceDebris = () => {
  const debrisCount = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const debrisData = useMemo(() => {
    return new Array(debrisCount).fill(0).map(() => ({
      radius: 2.8 + Math.random() * 2.5,
      speed: (0.1 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1),
      inclination: Math.random() * Math.PI,
      phase: Math.random() * Math.PI * 2,
      rotSpeed: Math.random() * 2
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    debrisData.forEach((d, i) => {
      const angle = t * d.speed + d.phase;
      const x = Math.cos(angle) * d.radius;
      const z = Math.sin(angle) * d.radius;

      dummy.position.set(
        x,
        z * Math.sin(d.inclination),
        z * Math.cos(d.inclination)
      );

      dummy.rotation.set(t * d.rotSpeed, t * d.rotSpeed, 0);
      dummy.scale.setScalar(0.03 + Math.random() * 0.02);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, debrisCount]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#64748b" roughness={0.8} />
    </instancedMesh>
  );
};

// --- Camera Controller for Warp Effect ---
const CameraController = ({ isZooming }: { isZooming: boolean }) => {
  const { camera } = useThree();
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    if (isZooming) {
      // Smoothly interpolate position towards Earth
      // Target position: [0, 0, 2.5] (Close to surface)
      state.camera.position.lerp(vec.set(0, 0, 2.5), delta * 2.5);

      // Look at center to ensure alignment
      state.camera.lookAt(0, 0, 0);
    } else {
      // Gentle idle float is handled by <Float> in parent, but we ensure base position
      state.camera.position.lerp(vec.set(0, 0, 6.5), delta * 0.5);
    }
  });

  return null;
}

const Scene = ({ isZooming }: { isZooming: boolean }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6.5]} fov={45} />
      <CameraController isZooming={isZooming} />
      <ambientLight intensity={0.2} color="#2e1065" />
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />
      <Float speed={isZooming ? 0 : 0.5} rotationIntensity={isZooming ? 0 : 0.1} floatIntensity={isZooming ? 0 : 0.1}>
        <Earth />
        <SatelliteSystem />
        <SpaceDebris />
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
      setView(ViewState.DASHBOARD);
    }, 1500);
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

      <AnimatePresence>
        {!isZooming && (
          <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
            {/* Top Bar */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="flex justify-between items-start"
            >
              <div className="text-[10px] font-mono text-cyan-500/60 tracking-[0.3em] uppercase">
                System: Online<br />Coords: 12.33.91
              </div>
              <div className="flex gap-2">
                <div className="w-20 h-0.5 bg-cyan-500/30"></div>
                <div className="w-4 h-0.5 bg-cyan-500/80"></div>
              </div>
            </motion.div>

            {/* Bottom Bar */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="flex justify-between items-end"
            >
              <div className="w-32 h-32 border-l border-b border-cyan-500/20 rounded-bl-3xl"></div>
              <div className="w-32 h-32 border-r border-b border-cyan-500/20 rounded-br-3xl"></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
        <AnimatePresence>
          {!isZooming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 2, filter: "blur(10px)" }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative"
              >

                <div className="absolute -inset-10 bg-cyan-500/10 blur-3xl rounded-full"></div>
                <h1 className="text-7xl md:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-purple-400 drop-shadow-[0_0_35px_rgba(139,92,246,0.4)] mb-2 tracking-tighter">
                  SPACESCOPE
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="flex items-center gap-4 mb-12"
              >
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-400"></div>
                <p className="text-cyan-200 font-sans text-sm md:text-lg tracking-[0.3em] uppercase mb-12">
                  Cosmic Intelligence Platform
                </p>
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-400"></div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="pointer-events-auto"
              >
                <div className="pointer-events-auto flex flex-col items-center gap-6">
                  <button
                    onClick={() => handleStart(AuthMode.LOGIN)}
                    className="group relative px-12 py-5 bg-black/20 overflow-hidden rounded-none border border-cyan-500/30 hover:border-cyan-400 transition-colors"
                    style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-900/40 to-cyan-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-scanline" />
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Hero3D;