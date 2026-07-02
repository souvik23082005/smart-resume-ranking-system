import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IntroStage } from './IntroCanvas';
import gsap from 'gsap';

interface PaperPlaneProps {
  stage: IntroStage;
  onPositionUpdate: (pos: THREE.Vector3) => void;
}

export default function PaperPlane({ stage, onPositionUpdate }: PaperPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Create a cinematic flight path using CatmullRomCurve3
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-15, -5, -20),
      new THREE.Vector3(-10, 5, -10),
      new THREE.Vector3(8, 8, -5),
      new THREE.Vector3(12, -2, 0),
      new THREE.Vector3(5, -6, 5),
      new THREE.Vector3(-5, 2, 8),
      new THREE.Vector3(0, 0, 0), // End at center
    ]);
  }, []);

  // Procedural paper plane geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Simple paper plane vertices
    const vertices = new Float32Array([
      // Right wing
      0, 0, 2,     // Nose
      1, -0.2, -1, // Right tip
      0, 0, -1,    // Center back
      
      // Left wing
      0, 0, 2,     // Nose
      0, 0, -1,    // Center back
      -1, -0.2, -1,// Left tip
      
      // Bottom keel (right)
      0, 0, 2,
      0, 0, -1,
      0, -0.5, -1,
      
      // Bottom keel (left)
      0, 0, 2,
      0, -0.5, -1,
      0, 0, -1,
    ]);

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const progress = useRef({ value: 0 });
  const hoverAnim = useRef({ y: 0, rotX: 0, rotZ: 0 });

  useEffect(() => {
    if (stage === 'FLIGHT') {
      gsap.to(progress.current, {
        value: 1,
        duration: 6,
        ease: 'power2.inOut',
      });
    } else if (stage === 'HOVER') {
      // Gentle hover animation
      gsap.to(hoverAnim.current, {
        y: 0.2,
        rotX: 0.05,
        rotZ: 0.05,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    } else if (stage === 'TRANSFORM') {
      // Unfold/shatter animation
      if (meshRef.current && materialRef.current) {
        gsap.to(meshRef.current.scale, {
          x: 0, y: 0, z: 0,
          duration: 1.5,
          ease: 'power3.in'
        });
        gsap.to(materialRef.current, {
          opacity: 0,
          emissiveIntensity: 5,
          duration: 1.5,
          ease: 'power2.in'
        });
      }
    }
  }, [stage]);

  useFrame(() => {
    if (!meshRef.current) return;

    if (stage === 'FLIGHT') {
      // Get position along curve
      const pos = curve.getPoint(progress.current.value);
      meshRef.current.position.copy(pos);
      
      // Look forward along the curve
      if (progress.current.value < 0.99) {
        const nextPos = curve.getPoint(progress.current.value + 0.01);
        meshRef.current.lookAt(nextPos);
        
        // Add banking based on turn
        const tangent = curve.getTangent(progress.current.value);
        const nextTangent = curve.getTangent(progress.current.value + 0.01);
        const cross = new THREE.Vector3().crossVectors(tangent, nextTangent);
        meshRef.current.rotateZ(cross.y * 50); // Bank into turns
      }
      
      onPositionUpdate(pos);
    } 
    else if (stage === 'HOVER') {
      meshRef.current.position.y = hoverAnim.current.y;
      meshRef.current.rotation.x = hoverAnim.current.rotX;
      meshRef.current.rotation.z = hoverAnim.current.rotZ;
      onPositionUpdate(meshRef.current.position);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        ref={materialRef}
        color="#ffffff" 
        emissive="#ffffff" // Pure white glow
        emissiveIntensity={3} // Much brighter
        side={THREE.DoubleSide}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
