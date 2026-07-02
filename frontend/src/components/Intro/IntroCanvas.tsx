import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import PaperPlane from './PaperPlane';
import ResumeObject from './ResumeObject';
import CameraRig from './CameraRig';
import ParticleSystem from './ParticleSystem';
import * as THREE from 'three';
import gsap from 'gsap';

export type IntroStage = 'FLIGHT' | 'HOVER' | 'TRANSFORM' | 'RESUME_IDLE' | 'INTERACT' | 'TRANSITION';

export default function IntroCanvas({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<IntroStage>('FLIGHT');
  const [planePosition, setPlanePosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  
  useEffect(() => {
    // Flight duration
    const flightTimer = setTimeout(() => {
      setStage('HOVER');
      
      // Transform after hover
      setTimeout(() => {
        setStage('TRANSFORM');
        
        // Idle after transform
        setTimeout(() => {
          setStage('RESUME_IDLE');
        }, 2000); // transform duration
      }, 2000); // hover duration
    }, 6000); // flight duration

    return () => {
      clearTimeout(flightTimer);
    };
  }, []);

  const handleResumeClick = () => {
    if (stage !== 'RESUME_IDLE' && stage !== 'INTERACT') return;
    setStage('TRANSITION');
    
    // Call onComplete after transition animation finishes
    setTimeout(() => {
      onComplete();
    }, 2500); // transition duration
  };

  return (
    <div className="w-full h-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }}
        dpr={[1, 2]} // High quality pixel ratio
      >
        <color attach="background" args={['#05020a']} /> {/* Slightly deep purple instead of pure black for richness */}
        
        {/* Lights - much brighter and more dramatic */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 10]} intensity={3} color="#ffffff" castShadow />
        <pointLight position={[-10, 0, -10]} intensity={5} color="#7C3AED" />
        <pointLight position={[10, -10, 10]} intensity={3} color="#4CD7F6" />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={1.5} />
          
          <Stars radius={100} depth={50} count={4000} factor={5} saturation={1} fade speed={1.5} />
          
          <CameraRig stage={stage} targetPosition={planePosition} />
          
          {/* Paper Plane - visible during flight, hover, starts fading during transform */}
          {(stage === 'FLIGHT' || stage === 'HOVER' || stage === 'TRANSFORM') && (
            <PaperPlane 
              stage={stage} 
              onPositionUpdate={(pos) => setPlanePosition(pos.clone())} 
            />
          )}

          {/* Resume - appears during transform, stays for idle and interact */}
          {(stage === 'TRANSFORM' || stage === 'RESUME_IDLE' || stage === 'INTERACT' || stage === 'TRANSITION') && (
            <ResumeObject 
              stage={stage} 
              onClick={handleResumeClick}
              onHoverStart={() => stage === 'RESUME_IDLE' && setStage('INTERACT')}
              onHoverEnd={() => stage === 'INTERACT' && setStage('RESUME_IDLE')}
            />
          )}

          <ParticleSystem stage={stage} planePosition={planePosition} />

          {/* Post Processing - Aggressive neon bloom */}
          <EffectComposer multisampling={4}>
            <Bloom 
              luminanceThreshold={0.4} 
              luminanceSmoothing={0.9} 
              mipmapBlur 
              intensity={2.5} 
            />
            <DepthOfField target={[0, 0, 0]} focalLength={0.03} bokehScale={3} height={480} />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
