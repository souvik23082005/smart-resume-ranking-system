import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { IntroStage } from './IntroCanvas';
import gsap from 'gsap';

interface ResumeObjectProps {
  stage: IntroStage;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export default function ResumeObject({ stage, onClick, onHoverStart, onHoverEnd }: ResumeObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const borderMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Initial state (invisible)
    if (groupRef.current && stage === 'TRANSFORM') {
      groupRef.current.scale.set(0, 0, 0);
      groupRef.current.rotation.set(0, Math.PI, 0);
      
      // Transform animation
      gsap.to(groupRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.5,
        delay: 0.2,
        ease: 'elastic.out(1, 0.7)'
      });
      gsap.to(groupRef.current.rotation, {
        y: 0,
        duration: 1.5,
        delay: 0.2,
        ease: 'power3.out'
      });
    }

    if (stage === 'TRANSITION') {
      // Shatter / expand effect
      if (groupRef.current && materialRef.current && borderMaterialRef.current) {
        gsap.to(groupRef.current.rotation, {
          y: Math.PI * 2,
          z: Math.PI / 4,
          duration: 2,
          ease: 'power2.in'
        });
        gsap.to(groupRef.current.scale, {
          x: 4, y: 4, z: 4,
          duration: 2,
          ease: 'power3.in'
        });
        gsap.to([materialRef.current, borderMaterialRef.current], {
          opacity: 0,
          duration: 1.5,
          delay: 0.5,
          ease: 'power2.in'
        });
        gsap.to(borderMaterialRef.current, {
          emissiveIntensity: 10,
          duration: 1,
          ease: 'power2.in'
        });
      }
    }
  }, [stage]);

  // Hover animations
  useEffect(() => {
    if (!groupRef.current || !borderMaterialRef.current) return;
    
    if (hovered && stage === 'INTERACT') {
      document.body.style.cursor = 'pointer';
      gsap.to(groupRef.current.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.3 });
      gsap.to(borderMaterialRef.current, { emissiveIntensity: 3, duration: 0.3 });
    } else if (!hovered && (stage === 'RESUME_IDLE' || stage === 'INTERACT')) {
      document.body.style.cursor = 'auto';
      gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      gsap.to(borderMaterialRef.current, { emissiveIntensity: 1.5, duration: 0.3 });
    }
    
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, stage]);

  useFrame(({ clock }) => {
    if (stage === 'RESUME_IDLE' || stage === 'INTERACT') {
      // Idle floating sine wave animation
      const t = clock.getElapsedTime();
      if (groupRef.current) {
        groupRef.current.position.y = Math.sin(t * 1.5) * 0.1;
        
        // Add subtle rotation if not hovered
        if (!hovered) {
          groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
          groupRef.current.rotation.x = Math.sin(t * 0.8) * 0.02;
        } else {
          // Tilt towards pointer could go here, but handled by camera parallax mostly
          gsap.to(groupRef.current.rotation, {
            x: 0.05,
            y: 0.1,
            duration: 0.5
          });
        }
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => { setHovered(true); onHoverStart(); }}
      onPointerOut={() => { setHovered(false); onHoverEnd(); }}
      onClick={onClick}
    >
      {/* Main Glass Resume Body */}
      <RoundedBox args={[2.1, 2.97, 0.05]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial 
          ref={materialRef}
          color="#1a0b2e"
          emissive="#2a1050"
          emissiveIntensity={0.2}
          transparent
          opacity={0.85}
          roughness={0.05} // Smoother glass
          metalness={0.2}
          transmission={0.95} // Higher transmission
          thickness={0.8} // Refraction thickness increased
          ior={1.6} // Slightly higher Index of Refraction for better distortion
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </RoundedBox>

      {/* Glowing Border Edge */}
      <RoundedBox args={[2.12, 2.99, 0.02]} radius={0.06} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial 
          ref={borderMaterialRef}
          color="#7C3AED"
          emissive="#b388ff" // Brighter emissive color
          emissiveIntensity={2.5} // Base intensity higher
          transparent
          opacity={0.9}
          wireframe={false}
        />
      </RoundedBox>
      
      {/* Decorative Resume Lines (simulating text/layout) */}
      <mesh position={[0, 1, 0.03]}>
        <planeGeometry args={[1.5, 0.2]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.25, 0.6, 0.03]}>
        <planeGeometry args={[1.0, 0.05]} />
        <meshStandardMaterial color="#4CD7F6" emissive="#4CD7F6" emissiveIntensity={2.5} transparent opacity={1} />
      </mesh>
      <mesh position={[0, 0.3, 0.03]}>
        <planeGeometry args={[1.5, 0.03]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0.03]}>
        <planeGeometry args={[1.5, 0.03]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, -0.1, 0.03]}>
        <planeGeometry args={[1.5, 0.03]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
