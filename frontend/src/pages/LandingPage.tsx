import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────
 * Animated Particle Grid Background
 * Creates a matrix of softly glowing dots that
 * react to mouse proximity.
 * ──────────────────────────────────────────── */
function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const spacing = 50;
    const maxDist = 150;

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let x = spacing; x < w; x += spacing) {
        for (let y = spacing; y < h; y += spacing) {
          const dx = x - mouse.current.x;
          const dy = y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - dist / maxDist);

          const size = 1 + proximity * 3;
          const alpha = 0.06 + proximity * 0.5;

          // Purple base, cyan on proximity
          const r = Math.round(124 + proximity * (76 - 124));
          const g = Math.round(58 + proximity * (215 - 58));
          const b = Math.round(237 + proximity * (246 - 237));

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fill();

          // Draw connection lines to nearby mouse
          if (proximity > 0.3) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(mouse.current.x, mouse.current.y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${proximity * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ─────────────────────────────────────────────
 * Animated counter that counts up from 0
 * ──────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const step = target / 60;
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
 * Main Landing Page
 * ──────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  function handleGetStarted() {
    setTransitioning(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  }

  useEffect(() => {
    // Trigger hero animations on mount
    setTimeout(() => setHeroVisible(true), 100);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#05020a] text-on-background font-body-md overflow-x-hidden selection:bg-[#7C3AED]/30 selection:text-white"
      style={{ perspective: '1200px' }}
    >
      {/* 3D Warp Portal Overlay */}
      {transitioning && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
          <div className="absolute w-[100px] h-[100px] rounded-full bg-[#7C3AED] animate-portal-ring-1 opacity-0" />
          <div className="absolute w-[100px] h-[100px] rounded-full bg-[#4CD7F6] animate-portal-ring-2 opacity-0" />
          <div className="absolute w-[100px] h-[100px] rounded-full bg-[#7C3AED]/50 animate-portal-ring-3 opacity-0" />
          <div className="absolute w-4 h-4 rounded-full bg-white animate-portal-flash opacity-0" />
          <div className="absolute inset-0 bg-white animate-portal-whiteout opacity-0" />
        </div>
      )}

      <div className={transitioning ? 'animate-page-warp-out' : ''}>
        {/* ── Navigation ── */}
        <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <span
                  className="material-symbols-outlined text-white text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  radar
                </span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">RecruitRank</span>
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm text-white/50 hover:text-white transition-colors duration-300">
                Features
              </a>
              <a href="#stats" onClick={(e) => { e.preventDefault(); document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm text-white/50 hover:text-white transition-colors duration-300">
                Performance
              </a>
            </div>
            <button
              onClick={handleGetStarted}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white border border-white/10 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:scale-[1.03] transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* ── Hero Section ── */}
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <ParticleGrid />

          {/* Radial glow accents */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(124,58,237,0.12)_0%,transparent_70%)] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(76,215,246,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.06)_0%,transparent_70%)] pointer-events-none" />

          {/* ── Floating Blurred Resumes ── */}
          <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
            {/* Resume 1 — top left, tilted, blurred */}
            <div
              className="absolute animate-float"
              style={{
                top: '8%', left: '6%',
                width: '140px', height: '190px',
                transform: 'rotate(-18deg) rotateX(15deg) rotateY(-12deg)',
                animationDuration: '8s',
                filter: 'blur(2px)',
                opacity: 0.25,
              }}
            >
              <div className="w-full h-full rounded-lg bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] shadow-[0_8px_30px_rgba(124,58,237,0.15)] p-3 flex flex-col gap-2">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/20 self-center" />
                <div className="w-3/4 h-2 bg-white/15 rounded mx-auto" />
                <div className="w-1/2 h-1.5 bg-[#4CD7F6]/20 rounded mx-auto" />
                <div className="flex-1 mt-2 space-y-1.5">
                  <div className="w-full h-1 bg-white/8 rounded" />
                  <div className="w-5/6 h-1 bg-white/6 rounded" />
                  <div className="w-4/6 h-1 bg-white/5 rounded" />
                  <div className="w-full h-1 bg-white/8 rounded" />
                  <div className="w-3/4 h-1 bg-white/5 rounded" />
                </div>
              </div>
            </div>

            {/* Resume 2 — right side, tilted opposite */}
            <div
              className="absolute animate-float hidden md:block"
              style={{
                top: '12%', right: '8%',
                width: '160px', height: '210px',
                transform: 'rotate(12deg) rotateX(10deg) rotateY(18deg)',
                animationDuration: '10s',
                animationDelay: '1.5s',
                filter: 'blur(3px)',
                opacity: 0.18,
              }}
            >
              <div className="w-full h-full rounded-lg bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[0_8px_30px_rgba(76,215,246,0.1)] p-3 flex flex-col gap-2">
                <div className="w-3/4 h-2.5 bg-white/12 rounded" />
                <div className="w-1/2 h-1.5 bg-[#7C3AED]/15 rounded" />
                <div className="w-full h-[1px] bg-white/5 my-1" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-full h-1 bg-white/6 rounded" />
                  <div className="w-5/6 h-1 bg-white/5 rounded" />
                  <div className="w-3/4 h-1 bg-white/4 rounded" />
                  <div className="w-full h-1 bg-white/6 rounded" />
                  <div className="w-4/6 h-1 bg-white/4 rounded" />
                  <div className="w-5/6 h-1 bg-white/5 rounded" />
                </div>
              </div>
            </div>

            {/* Resume 3 — bottom left, subtle */}
            <div
              className="absolute animate-float hidden md:block"
              style={{
                bottom: '15%', left: '3%',
                width: '120px', height: '165px',
                transform: 'rotate(8deg) rotateX(-10deg) rotateY(15deg)',
                animationDuration: '9s',
                animationDelay: '3s',
                filter: 'blur(4px)',
                opacity: 0.12,
              }}
            >
              <div className="w-full h-full rounded-lg bg-[#7C3AED]/[0.04] border border-[#7C3AED]/[0.08] p-2.5 flex flex-col gap-1.5">
                <div className="w-2/3 h-2 bg-white/10 rounded" />
                <div className="w-1/3 h-1.5 bg-[#4CD7F6]/10 rounded" />
                <div className="flex-1 mt-1 space-y-1">
                  <div className="w-full h-1 bg-white/5 rounded" />
                  <div className="w-4/5 h-1 bg-white/4 rounded" />
                  <div className="w-3/5 h-1 bg-white/3 rounded" />
                </div>
              </div>
            </div>

            {/* Resume 4 — bottom right, larger, very blurred (depth) */}
            <div
              className="absolute animate-float hidden lg:block"
              style={{
                bottom: '20%', right: '5%',
                width: '180px', height: '240px',
                transform: 'rotate(-22deg) rotateX(20deg) rotateY(-15deg)',
                animationDuration: '12s',
                animationDelay: '2s',
                filter: 'blur(5px)',
                opacity: 0.1,
              }}
            >
              <div className="w-full h-full rounded-xl bg-white/[0.025] border border-white/[0.04] shadow-[0_10px_40px_rgba(124,58,237,0.08)] p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#7C3AED]/15" />
                  <div className="flex-1 space-y-1">
                    <div className="w-3/4 h-1.5 bg-white/10 rounded" />
                    <div className="w-1/2 h-1 bg-white/6 rounded" />
                  </div>
                </div>
                <div className="w-full h-[1px] bg-white/5" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-full h-1 bg-white/5 rounded" />
                  <div className="w-5/6 h-1 bg-white/4 rounded" />
                  <div className="w-4/6 h-1 bg-white/3 rounded" />
                  <div className="w-full h-1 bg-white/5 rounded" />
                  <div className="w-3/4 h-1 bg-white/4 rounded" />
                  <div className="w-5/6 h-1 bg-white/3 rounded" />
                  <div className="w-2/3 h-1 bg-white/3 rounded" />
                </div>
              </div>
            </div>

            {/* Resume 5 — mid-left, small, moderate blur */}
            <div
              className="absolute animate-float hidden md:block"
              style={{
                top: '55%', left: '12%',
                width: '100px', height: '135px',
                transform: 'rotate(25deg) rotateX(-8deg) rotateY(10deg)',
                animationDuration: '7s',
                animationDelay: '4s',
                filter: 'blur(3px)',
                opacity: 0.15,
              }}
            >
              <div className="w-full h-full rounded-md bg-[#4CD7F6]/[0.03] border border-[#4CD7F6]/[0.06] p-2 flex flex-col gap-1">
                <div className="w-1/2 h-1.5 bg-white/10 rounded" />
                <div className="w-1/3 h-1 bg-[#4CD7F6]/15 rounded" />
                <div className="flex-1 mt-1 space-y-1">
                  <div className="w-full h-[3px] bg-white/5 rounded" />
                  <div className="w-4/5 h-[3px] bg-white/4 rounded" />
                  <div className="w-3/5 h-[3px] bg-white/3 rounded" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
            {/* Badge */}
            <div
              className="transition-all duration-1000 ease-out"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-semibold tracking-[0.2em] uppercase text-[#4CD7F6] mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CD7F6] animate-pulse" />
                Next-Gen Recruitment Engine
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-8 tracking-tight transition-all duration-1000 ease-out delay-200"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              Hire with{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#a78bfa] to-[#4CD7F6] bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_4s_ease-in-out_infinite]">
                Precision
              </span>
              <br />
              <span className="text-white/40">Not Guesswork.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl leading-relaxed font-medium transition-all duration-1000 ease-out delay-500"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              Upload resumes. Define your criteria. Get instantly ranked candidates
              with multi-dimensional scoring and visual analytics.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 transition-all duration-1000 ease-out delay-700"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 rounded-xl text-base font-bold text-white overflow-hidden transition-all duration-300 hover:scale-[1.03]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-[1px] bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-[11px] group-hover:from-[#7C3AED] group-hover:to-[#4CD7F6] transition-all duration-500" />
                <span className="relative z-10 flex items-center gap-2">
                  Start Ranking
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </span>
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-xl text-base font-semibold text-white/60 border border-white/10 hover:border-white/30 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-[10px] text-white/25 tracking-[0.25em] uppercase font-semibold mb-3">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1.5">
              <div className="w-1 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </section>

        {/* ── Stats Section ── */}
        <section id="stats" className="relative py-24 border-y border-white/[0.04]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7C3AED]/[0.03] to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 fade-in-up">
            {[
              { value: 10000, suffix: '+', label: 'Resumes Ranked' },
              { value: 97, suffix: '%', label: 'Match Accuracy' },
              { value: 50, suffix: 'x', label: 'Faster Screening' },
              { value: 5, suffix: '', label: 'Ranking Parameters' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/30 uppercase tracking-[0.2em] font-semibold group-hover:text-white/50 transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="py-32 px-6 md:px-12 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.06)_0%,transparent_70%)] pointer-events-none" />

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 fade-in-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold tracking-[0.25em] uppercase text-[#7C3AED] mb-6">
                Core Capabilities
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
                Everything You Need
              </h2>
              <p className="text-base text-white/35 max-w-xl mx-auto leading-relaxed">
                A complete toolkit for intelligent resume screening and candidate evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: 'auto_awesome',
                  title: 'Smart Parsing',
                  desc: 'Extract experience, education, skills, and location from any PDF or DOCX resume automatically.',
                  color: '#4CD7F6',
                  delay: '0ms',
                },
                {
                  icon: 'tune',
                  title: 'Custom Weights',
                  desc: 'Drag-and-drop priority ranking to weight experience, education, location, industry, and notice period.',
                  color: '#7C3AED',
                  delay: '100ms',
                },
                {
                  icon: 'insights',
                  title: 'Visual Analytics',
                  desc: 'Bar charts, radar comparisons, and a podium view to instantly identify your top candidates.',
                  color: '#a78bfa',
                  delay: '200ms',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="fade-in-up group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden"
                  style={{ transitionDelay: feature.delay }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)` }}
                  />
                  {/* Background glow on hover */}
                  <div
                    className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[60px]"
                    style={{ background: feature.color }}
                  />

                  <div
                    className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/[0.06]"
                    style={{ background: `${feature.color}15` }}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ color: feature.color, fontVariationSettings: "'FILL' 1" }}
                    >
                      {feature.icon}
                    </span>
                  </div>

                  <h3 className="relative text-lg font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="relative text-sm text-white/35 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works Section ── */}
        <section className="py-32 px-6 md:px-12 relative border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 fade-in-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold tracking-[0.25em] uppercase text-[#4CD7F6] mb-6">
                Workflow
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
                Three Steps. Zero Effort.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-[1px] bg-gradient-to-r from-[#7C3AED]/30 via-[#4CD7F6]/30 to-[#7C3AED]/30" />

              {[
                { step: '01', title: 'Define the Role', desc: 'Upload or type the Job Description with desired qualifications.', icon: 'description' },
                { step: '02', title: 'Upload Resumes', desc: 'Drag & drop candidate resumes in PDF or DOCX format.', icon: 'upload_file' },
                { step: '03', title: 'Get Rankings', desc: 'Instantly see scored, ranked candidates with visual breakdowns.', icon: 'leaderboard' },
              ].map((item, i) => (
                <div key={item.step} className="fade-in-up text-center relative" style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#7C3AED]/10 to-transparent" />
                    <span className="material-symbols-outlined text-[32px] text-[#7C3AED]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#7C3AED] text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="py-32 px-6 md:px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7C3AED]/[0.06] to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,58,237,0.1)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center fade-in-up">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Ready to Transform <br />
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] bg-clip-text text-transparent">Your Hiring?</span>
            </h2>
            <p className="text-base text-white/35 mb-12 max-w-lg mx-auto leading-relaxed">
              Join the next generation of recruitment. No credit card required. Start ranking in seconds.
            </p>
            <button
              onClick={handleGetStarted}
              className="group relative px-10 py-5 rounded-2xl text-lg font-bold text-white overflow-hidden transition-all duration-300 hover:scale-[1.03]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-[2px] bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-[14px] group-hover:from-[#7C3AED] group-hover:to-[#4CD7F6] transition-all duration-500" />
              <span className="relative z-10 flex items-center gap-3">
                Launch RecruitRank
                <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">rocket_launch</span>
              </span>
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-12 border-t border-white/[0.04]">
          <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 max-w-6xl mx-auto gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
              </div>
              <span className="text-sm font-bold text-white/60">RecruitRank</span>
            </div>
            <div className="flex gap-6">
              <a className="text-xs text-white/25 hover:text-white/50 transition-colors" href="#">Privacy</a>
              <a className="text-xs text-white/25 hover:text-white/50 transition-colors" href="#">Terms</a>
              <a className="text-xs text-white/25 hover:text-white/50 transition-colors" href="#">Security</a>
            </div>
            <div className="text-xs text-white/20">© 2026 RecruitRank. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
