import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IntroCanvas from './IntroCanvas';

export default function IntroManager({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if intro has played this session
    const hasPlayed = sessionStorage.getItem('rr_intro_played');
    if (!hasPlayed) {
      setShowIntro(true);
      // We don't mark it played immediately in case they refresh before seeing it
    }
    setMounted(true);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('rr_intro_played', 'true');
  };

  const handleSkip = () => {
    handleIntroComplete();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Background App renders regardless to prevent loading shift after intro */}
      <div className={`transition-opacity duration-1000 ${showIntro ? 'opacity-0 pointer-events-none fixed inset-0 overflow-hidden' : 'opacity-100'}`}>
        {children}
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-black"
          >
            <IntroCanvas onComplete={handleIntroComplete} />
            
            {/* Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              onClick={handleSkip}
              className="absolute bottom-8 right-8 text-white/50 hover:text-white font-mono-data text-xs uppercase tracking-[0.2em] px-4 py-2 border border-white/10 hover:border-white/30 rounded-full bg-white/5 backdrop-blur-md transition-all z-10"
            >
              Skip Intro
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
