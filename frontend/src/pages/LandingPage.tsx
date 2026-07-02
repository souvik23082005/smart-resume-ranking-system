import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FloatingObjectsBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* 3D Resume 1 */}
      <div 
        className="absolute top-[15%] left-[10%] w-24 sm:w-32 h-32 sm:h-40 bg-surface-container/40 backdrop-blur-md rounded-lg border border-white/10 shadow-[0_10px_30px_rgba(124,58,237,0.2)] animate-float"
        style={{ transform: 'rotate(-15deg) rotateX(20deg) rotateY(-10deg)', animationDuration: '7s' }}
      >
        <div className="w-1/2 h-2 bg-white/20 rounded mx-auto mt-4 mb-2"></div>
        <div className="w-3/4 h-1 bg-white/10 rounded mx-auto mb-1"></div>
        <div className="w-2/3 h-1 bg-white/10 rounded mx-auto mb-4"></div>
        <div className="w-4/5 h-12 sm:h-16 bg-white/5 rounded mx-auto mt-2"></div>
      </div>

      {/* 3D Resume 2 (blurred out of focus) */}
      <div 
        className="absolute bottom-[20%] right-[10%] sm:right-[15%] w-32 sm:w-40 h-40 sm:h-52 bg-secondary/10 backdrop-blur-xl rounded-lg border border-white/5 shadow-[0_10px_40px_rgba(76,215,246,0.1)] animate-float blur-[2px]"
        style={{ transform: 'rotate(25deg) rotateX(15deg) rotateY(20deg)', animationDuration: '9s', animationDelay: '2s' }}
      >
         <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-white/10 mx-auto mt-6 mb-4"></div>
         <div className="w-3/4 h-2 bg-white/20 rounded mx-auto mb-2"></div>
         <div className="w-1/2 h-2 bg-white/10 rounded mx-auto mb-1"></div>
      </div>

      {/* 3D Resume 3 (distant) */}
      <div 
        className="absolute top-[25%] right-[5%] sm:right-[10%] w-20 h-28 bg-white/5 backdrop-blur-sm rounded border border-white/5 shadow-lg animate-float blur-[3px]"
        style={{ transform: 'rotate(-5deg) rotateX(40deg) rotateY(30deg)', animationDuration: '11s', animationDelay: '4s' }}
      ></div>

      {/* Sphere / Data Node 1 */}
      <div 
        className="absolute top-[30%] right-[25%] w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-tertiary/40 to-transparent backdrop-blur-md animate-float"
        style={{ animationDuration: '5s', animationDelay: '1s' }}
      ></div>

      {/* Sphere / Data Node 2 */}
      <div 
        className="absolute bottom-[30%] left-[20%] w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-secondary/40 to-transparent backdrop-blur-md animate-float blur-sm"
        style={{ animationDuration: '6s', animationDelay: '3s' }}
      ></div>
      
      {/* Abstract geometric shape 1 */}
      <div 
        className="absolute top-[60%] left-[5%] w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-tr from-primary/20 to-transparent backdrop-blur-sm animate-float blur-[1px]"
        style={{ transform: 'rotate(45deg) skew(15deg, 15deg)', animationDuration: '8s', animationDelay: '4s', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
      ></div>

      {/* Abstract geometric shape 2 */}
      <div 
        className="absolute top-[10%] right-[30%] w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-tl from-white/10 to-transparent backdrop-blur-md animate-float blur-sm"
        style={{ transform: 'rotate(60deg)', animationDuration: '10s', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
      ></div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);

  function handleGetStarted() {
    setTransitioning(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  }

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.fade-in-up').forEach((el) => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md overflow-x-hidden selection:bg-secondary-container selection:text-white" style={{ perspective: '1200px' }}>
      
      {/* 3D Warp Portal Overlay */}
      {transitioning && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
          {/* Expanding glow rings */}
          <div className="absolute w-[100px] h-[100px] rounded-full bg-[#7C3AED] animate-portal-ring-1 opacity-0" />
          <div className="absolute w-[100px] h-[100px] rounded-full bg-[#4CD7F6] animate-portal-ring-2 opacity-0" />
          <div className="absolute w-[100px] h-[100px] rounded-full bg-[#7C3AED]/50 animate-portal-ring-3 opacity-0" />
          {/* Center flash */}
          <div className="absolute w-4 h-4 rounded-full bg-white animate-portal-flash opacity-0" />
          {/* Full screen white flash at end */}
          <div className="absolute inset-0 bg-white animate-portal-whiteout opacity-0" />
        </div>
      )}

      <div className={transitioning ? 'animate-page-warp-out' : ''}>
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/5 dark:bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-none">
        <div className="flex justify-between items-center px-margin-desktop py-4 w-full max-w-container-max mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-on-surface">RecruitRank</div>
          <div className="hidden md:flex gap-8 items-center">
            <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" href="#">Platform</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md hover:bg-white/10 px-2 py-1 rounded" href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
          </div>
          <div className="flex gap-4">
            <button className="btn-primary" onClick={handleGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden pt-20">
        <FloatingObjectsBackground />
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80 flex items-center justify-center">
            <div className="absolute w-[600px] h-[600px] rounded-full border border-secondary/20 animate-pulse-ring"></div>
            <div className="absolute w-[400px] h-[400px] rounded-full border border-tertiary/20 animate-pulse-ring" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto fade-in-up">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-6 drop-shadow-lg">
            Elevate Your Hiring Pipeline with <span className="text-tertiary">Kinetic Precision</span>.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl drop-shadow-md">
            Experience the future of recruitment where AI-driven rankings meet immersive data visualization.
          </p>
          <button onClick={handleGetStarted} className="btn-primary px-8 py-4 rounded-lg font-body-md text-body-md shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-transform duration-300">
            Get Started
          </button>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce opacity-60">
          <span className="font-label-sm text-label-sm text-on-surface-variant mb-2 tracking-widest uppercase">Scroll to Explore</span>
          <span className="material-symbols-outlined text-on-surface-variant">keyboard_arrow_down</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest relative z-10">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-24 fade-in-up">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Intelligent Processing Workflow</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">Streamline your talent acquisition with military-grade precision and data density.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="glass-panel p-8 rounded-xl fade-in-up hover:border-tertiary/50 transition-colors duration-500 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tertiary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-6 border border-white/10 text-tertiary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sort</span>
              </div>
              <h3 className="font-body-lg text-body-lg text-on-surface mb-3 font-semibold">Automated Ranking</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Algorithmic sorting assigns precise kinetic scores to candidates based on raw potential and historical performance data.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-xl fade-in-up hover:border-secondary-container/50 transition-colors duration-500 relative overflow-hidden group" style={{ transitionDelay: '100ms' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-6 border border-white/10 text-[#7C3AED]">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <h3 className="font-body-lg text-body-lg text-on-surface mb-3 font-semibold">Multi-Resume Processing</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Simultaneously parse thousands of unstructured documents into structured, queryable data nodes instantly.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-xl fade-in-up hover:border-tertiary-fixed-dim/50 transition-colors duration-500 relative overflow-hidden group" style={{ transitionDelay: '200ms' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tertiary-fixed-dim to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-6 border border-white/10 text-tertiary-fixed-dim">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>join_inner</span>
              </div>
              <h3 className="font-body-lg text-body-lg text-on-surface mb-3 font-semibold">Job Description Alignment</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Neural matching validates candidate skills against exact technical requirements, filtering out noise with high confidence.</p>
            </div>
          </div>
          
          <div className="mt-32 glass-panel rounded-xl overflow-hidden border border-white/10 fade-in-up p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Command Center</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">Real-time candidate telemetry. Monitor pipeline health and scoring distributions at a glance.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-white/5">
                    <span className="font-body-md text-body-md text-on-surface">Top Candidates</span>
                    <span className="font-mono-data text-mono-data text-tertiary bg-tertiary-container px-2 py-1 rounded">142</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-white/5">
                    <span className="font-body-md text-body-md text-on-surface">Processing Queue</span>
                    <span className="font-mono-data text-mono-data text-on-surface-variant bg-surface-container px-2 py-1 rounded">0</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3 h-64 rounded-lg bg-surface-container border border-white/5 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(124,58,237,0.1) 0%, transparent 70%)' }}></div>
                <div className="font-mono-data text-mono-data text-on-surface-variant opacity-50 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl">analytics</span>
                  <span>Data Visualization Module Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full py-12 border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop w-full max-w-container-max mx-auto gap-gutter">
          <div className="font-headline-md text-headline-md font-bold text-on-surface">RecruitRank</div>
          <div className="flex gap-6">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Security</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Status</a>
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant">
            © 2026 RecruitRank. Kinetic Precision in Talent Acquisition.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
