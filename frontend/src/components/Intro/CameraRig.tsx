import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { IntroStage } from './IntroCanvas';
import gsap from 'gsap';

interface CameraRigProps {
  stage: IntroStage;
  targetPosition: THREE.Vector3;
}

export default function CameraRig({ stage, targetPosition }: CameraRigProps) {
  const { camera, pointer } = useThree();
  const currentLookAt = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  
  useEffect(() => {
    if (stage === 'HOVER') {
      // Move camera to a nice static viewing position for the center
      gsap.to(camera.position, {
        x: 2,
        y: 1,
        z: 6,
        duration: 2,
        ease: 'power2.out'
      });
    } else if (stage === 'TRANSITION') {
      // Massive zoom through the object
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: -2, // Fly past the origin (where the resume is)
        duration: 2,
        ease: 'power3.in'
      });
      // Look straight ahead
      gsap.to(targetLookAt.current, {
        x: 0,
        y: 0,
        z: -10,
        duration: 2,
        ease: 'power3.in'
      });
    }
  }, [stage, camera]);

  useFrame((state, delta) => {
    if (stage === 'FLIGHT') {
      // Follow the plane
      const idealOffset = new THREE.Vector3(-2, 1, -4);
      
      // Calculate where the plane is looking to position camera behind it
      // Since plane is at targetPosition, we can just use a simple offset for now
      // A more complex setup would use the plane's rotation matrix
      
      const targetCamPos = targetPosition.clone().add(new THREE.Vector3(2, 1, 4));
      
      // Smoothly interpolate camera position
      camera.position.lerp(targetCamPos, 0.05);
      
      // Look at plane
      targetLookAt.current.copy(targetPosition);
      currentLookAt.current.lerp(targetLookAt.current, 0.1);
      camera.lookAt(currentLookAt.current);
      
    } else if (stage === 'HOVER' || stage === 'TRANSFORM') {
      // Look at center
      targetLookAt.current.set(0, 0, 0);
      currentLookAt.current.lerp(targetLookAt.current, 0.05);
      camera.lookAt(currentLookAt.current);
      
    } else if (stage === 'RESUME_IDLE' || stage === 'INTERACT') {
      // Add subtle parallax based on mouse
      const targetX = (pointer.x * 0.5);
      const targetY = (pointer.y * 0.5);
      
      camera.position.x += (targetX - camera.position.x + 2) * 0.05;
      camera.position.y += (targetY - camera.position.y + 1) * 0.05;
      
      targetLookAt.current.set(0, 0, 0);
      currentLookAt.current.lerp(targetLookAt.current, 0.1);
      camera.lookAt(currentLookAt.current);
    } else if (stage === 'TRANSITION') {
      currentLookAt.current.lerp(targetLookAt.current, 0.1);
      camera.lookAt(currentLookAt.current);
    }
  });

  return null;
}
