import { useEffect, useRef } from 'react';

/**
 * CustomCursor
 * 
 * Renders a glowing trailing cursor effect across the entire app.
 * Features:
 * - A small bright dot that follows the mouse exactly
 * - A larger soft glow ring that trails behind with spring easing
 * - Both elements pulse/react when clicking
 * - Purple/cyan color scheme matching the brand
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const clicking = useRef(false);
  const visible = useRef(false);

  useEffect(() => {
    // Don't render custom cursor on touch devices
    if ('ontouchstart' in window) return;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!visible.current) {
        visible.current = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
    };

    const onMouseDown = () => {
      clicking.current = true;
      if (ringRef.current) {
        ringRef.current.style.transform = 'translate(-50%, -50%) scale(0.75)';
        ringRef.current.style.borderColor = 'rgba(76, 215, 246, 0.6)';
      }
      if (dotRef.current) {
        dotRef.current.style.transform = 'translate(-50%, -50%) scale(1.8)';
        dotRef.current.style.background = '#4CD7F6';
      }
    };

    const onMouseUp = () => {
      clicking.current = false;
      if (ringRef.current) {
        ringRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
        ringRef.current.style.borderColor = 'rgba(124, 58, 237, 0.4)';
      }
      if (dotRef.current) {
        dotRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
        dotRef.current.style.background = '#7C3AED';
      }
    };

    const onMouseLeave = () => {
      visible.current = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    // Smooth animation loop for the trailing ring
    let raf: number;
    const animate = () => {
      // Lerp the ring position towards the mouse
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.left = `${mouse.current.x}px`;
        dotRef.current.style.top = `${mouse.current.y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }

      raf = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          background: '#7C3AED',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%) scale(1)',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0,
          transition: 'transform 0.15s ease, background 0.2s ease, opacity 0.3s ease',
          boxShadow: '0 0 12px 3px rgba(124, 58, 237, 0.6)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Outer trailing ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          border: '1.5px solid rgba(124, 58, 237, 0.4)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%) scale(1)',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0,
          transition: 'transform 0.25s ease, border-color 0.3s ease, opacity 0.3s ease',
          boxShadow: '0 0 20px 4px rgba(124, 58, 237, 0.1)',
        }}
      />
    </>
  );
}
