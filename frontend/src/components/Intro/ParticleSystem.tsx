import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IntroStage } from './IntroCanvas';
import gsap from 'gsap';

interface ParticleSystemProps {
  stage: IntroStage;
  planePosition: THREE.Vector3;
}

export default function ParticleSystem({ stage, planePosition }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  // Create static ambient dust
  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useEffect(() => {
    if (stage === 'TRANSITION' && materialRef.current) {
      // Explode the dust outwards and brighten it
      gsap.to(materialRef.current, {
        size: 0.2,
        opacity: 0,
        duration: 2,
        ease: 'power3.in'
      });
      
      if (pointsRef.current) {
         gsap.to(pointsRef.current.scale, {
           x: 3, y: 3, z: 3,
           duration: 2,
           ease: 'power2.in'
         });
      }
    }
  }, [stage]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Slow rotation of the ambient dust
    pointsRef.current.rotation.y += 0.0005;
    pointsRef.current.rotation.x += 0.0002;
    
    if (stage === 'FLIGHT') {
      // We could dynamically move points to follow the plane for a trail effect, 
      // but rotating ambient dust is visually pleasing and high performance.
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial 
        ref={materialRef}
        size={0.06} // Larger particles
        color="#4CD7F6" // Brighter cyan instead of dark purple
        transparent
        opacity={0.8} // More opaque
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
