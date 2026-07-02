import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Stars, Environment, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
 * IntroOverlay
 * 
 * A full-screen overlay that renders a floating 
 * neon 3D resume. Clicking the resume triggers
 * a spectacular transition into the landing page.
 * Only plays once per session (sessionStorage).
 * ──────────────────────────────────────────── */

interface IntroOverlayProps {
  children: React.ReactNode;
}

export default function IntroOverlay({ children }: IntroOverlayProps) {
  const [showIntro, setShowIntro] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('rr_intro_played');
    if (!hasPlayed) {
      setShowIntro(true);
    }
    setMounted(true);
  }, []);

  const handleResumeClick = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    // Wait for the exit animation to finish
    setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem('rr_intro_played', 'true');
    }, 1800);
  }, [transitioning]);

  const handleSkip = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem('rr_intro_played', 'true');
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* The actual app renders underneath at all times */}
      <div
        style={{
          opacity: showIntro ? 0 : 1,
          pointerEvents: showIntro ? 'none' : 'auto',
          transition: 'opacity 1.2s ease-in-out',
          position: showIntro ? 'fixed' : 'relative',
          inset: 0,
          overflow: showIntro ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#000',
            }}
          >
            {/* 3D Canvas */}
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.8,
                powerPreference: 'high-performance',
              }}
              dpr={[1, 2]}
            >
              <color attach="background" args={['#030108']} />
              <fog attach="fog" args={['#030108', 8, 25]} />

              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 10, 7]} intensity={2} color="#ffffff" />
              <pointLight position={[-5, 3, 2]} intensity={8} color="#7C3AED" distance={15} decay={2} />
              <pointLight position={[5, -3, 2]} intensity={6} color="#4CD7F6" distance={15} decay={2} />
              <pointLight position={[0, 0, 5]} intensity={3} color="#a78bfa" distance={10} decay={2} />

              <Stars radius={60} depth={40} count={2500} factor={4} saturation={0.8} fade speed={1.2} />
              <Environment preset="night" environmentIntensity={0.5} />

              {/* Camera parallax */}
              <CameraParallax />

              {/* The floating resume */}
              <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4} floatingRange={[-0.15, 0.15]}>
                <NeonResume onClick={handleResumeClick} transitioning={transitioning} />
              </Float>

              {/* Orbiting particles */}
              <OrbitingParticles />

              {/* Post-processing */}
              <EffectComposer multisampling={4}>
                <Bloom
                  luminanceThreshold={0.3}
                  luminanceSmoothing={0.9}
                  mipmapBlur
                  intensity={2.2}
                />
                <Vignette eskil={false} offset={0.15} darkness={0.9} />
              </EffectComposer>
            </Canvas>

            {/* "Click the Resume" hint text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
              style={{
                position: 'absolute',
                bottom: '12%',
                left: 0,
                right: 0,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                Click the Resume to Enter
              </p>
            </motion.div>

            {/* Skip button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              onClick={handleSkip}
              style={{
                position: 'absolute',
                bottom: '32px',
                right: '32px',
                color: 'rgba(255,255,255,0.35)',
                fontSize: '11px',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 600,
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              Skip Intro
            </motion.button>

            {/* Transition flash overlay */}
            <AnimatePresence>
              {transitioning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeIn' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(124,58,237,0.4) 0%, rgba(0,0,0,0.95) 70%)',
                    pointerEvents: 'none',
                    zIndex: 5,
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


/* ─────────────────────────────────────────────
 * NeonResume — The hero 3D object
 * ──────────────────────────────────────────── */

function NeonResume({ onClick, transitioning }: { onClick: () => void; transitioning: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const borderRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  // Hover effect
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer';
      if (borderRef.current) {
        gsap.to(borderRef.current, { emissiveIntensity: 4, duration: 0.3 });
      }
      if (groupRef.current) {
        gsap.to(groupRef.current.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.4, ease: 'power2.out' });
      }
    } else {
      document.body.style.cursor = 'auto';
      if (borderRef.current) {
        gsap.to(borderRef.current, { emissiveIntensity: 2, duration: 0.4 });
      }
      if (groupRef.current) {
        gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
      }
    }
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  // Click transition animation
  useEffect(() => {
    if (transitioning && groupRef.current && glassRef.current && borderRef.current) {
      // Spin, scale up, and dissolve
      gsap.to(groupRef.current.rotation, {
        y: Math.PI * 4,
        duration: 1.5,
        ease: 'power3.in',
      });
      gsap.to(groupRef.current.scale, {
        x: 6, y: 6, z: 6,
        duration: 1.5,
        ease: 'power3.in',
      });
      gsap.to(borderRef.current, {
        emissiveIntensity: 15,
        duration: 0.8,
        ease: 'power2.in',
      });
      gsap.to([glassRef.current, borderRef.current], {
        opacity: 0,
        duration: 1.2,
        delay: 0.3,
        ease: 'power2.in',
      });
    }
  }, [transitioning]);

  // Subtle idle glow pulse
  useFrame(({ clock }) => {
    if (borderRef.current && !transitioning) {
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.3 + 2;
      borderRef.current.emissiveIntensity = hovered ? 4 : pulse;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Glass body */}
      <RoundedBox args={[2.2, 3.1, 0.06]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          ref={glassRef}
          color="#0d0520"
          emissive="#1a0640"
          emissiveIntensity={0.3}
          transparent
          opacity={0.85}
          roughness={0.05}
          metalness={0.15}
          transmission={0.92}
          thickness={0.8}
          ior={1.55}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={2}
        />
      </RoundedBox>

      {/* Neon border */}
      <RoundedBox args={[2.24, 3.14, 0.03]} radius={0.07} smoothness={4}>
        <meshStandardMaterial
          ref={borderRef}
          color="#7C3AED"
          emissive="#b388ff"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </RoundedBox>

      {/* ── Resume content lines ── */}
      {/* Header / Name placeholder */}
      <mesh position={[0, 1.1, 0.035]}>
        <planeGeometry args={[1.4, 0.18]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>

      {/* Cyan accent bar */}
      <mesh position={[-0.2, 0.8, 0.035]}>
        <planeGeometry args={[1.0, 0.04]} />
        <meshStandardMaterial color="#4CD7F6" emissive="#4CD7F6" emissiveIntensity={3} transparent opacity={1} />
      </mesh>

      {/* Text lines */}
      {[0.5, 0.3, 0.1, -0.1, -0.3, -0.5, -0.7, -0.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0.035]}>
          <planeGeometry args={[1.5 - (i % 3) * 0.2, 0.025]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.6}
            transparent
            opacity={0.35 - i * 0.02}
          />
        </mesh>
      ))}

      {/* Purple accent block (simulating a section header) */}
      <mesh position={[-0.3, -1.1, 0.035]}>
        <planeGeometry args={[0.8, 0.04]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}


/* ─────────────────────────────────────────────
 * CameraParallax — subtle mouse follow
 * ──────────────────────────────────────────── */

function CameraParallax() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    camera.position.x += (pointer.x * 0.4 - camera.position.x) * 0.03;
    camera.position.y += (pointer.y * 0.3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}


/* ─────────────────────────────────────────────
 * OrbitingParticles — small glowing dots that 
 * slowly orbit around the resume
 * ──────────────────────────────────────────── */

function OrbitingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0006;
      pointsRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color="#7C3AED"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
