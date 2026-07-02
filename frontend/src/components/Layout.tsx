import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppStep } from '../types';

const STEPS: { key: AppStep; label: string; icon: string }[] = [
  { key: 'jd', label: 'Job Description', icon: 'description' },
  { key: 'resumes', label: 'Candidate Resumes', icon: 'groups' },
  { key: 'config', label: 'Ranking Parameters', icon: 'tune' },
  { key: 'results', label: 'Ranking Results', icon: 'analytics' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { step, setStep, jd, resumes } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);

  function canNavigateTo(key: AppStep): boolean {
    if (key === 'jd') return true;
    if (key === 'resumes') return !!jd;
    if (key === 'config') return !!jd && resumes.length >= 2;
    if (key === 'results') return !!jd && resumes.length >= 2;
    return false;
  }

  function handleLogout() {
    localStorage.removeItem('rr_auth');
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#08080C] text-on-background font-body-md overflow-x-hidden selection:bg-[#7C3AED]/30 selection:text-white">
      {/* TopNavBar (Mobile) */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0f0f18]/80 backdrop-blur-xl border-b border-white/5 shadow-lg md:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenu(!mobileMenu)} className="text-on-surface hover:text-[#4CD7F6] transition-colors p-1">
            <span className="material-symbols-outlined">{mobileMenu ? 'close' : 'menu'}</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
          </div>
          <span className="font-headline-md text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tight">RecruitRank</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-white transition-colors relative">
             <span className="material-symbols-outlined text-[22px]">notifications</span>
             <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4CD7F6] rounded-full border-2 border-[#0f0f18]"></span>
          </button>
        </div>
      </header>

      {/* SideNavBar (Desktop + Mobile overlay) */}
      <nav className={`fixed left-0 top-0 bottom-0 w-[280px] z-40 bg-[#0A0A0F]/95 backdrop-blur-3xl border-r border-white/[0.05] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:flex flex-col h-screen ${mobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Subtle ambient glow behind nav */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div onClick={() => navigate('/')} className="px-7 pt-10 pb-8 flex items-center gap-3 cursor-pointer group relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all duration-300">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">RecruitRank</h1>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold bg-gradient-to-r from-[#4CD7F6] to-[#7C3AED] bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">AI Powered</p>
          </div>
        </div>

        <div className="flex-1 px-3 space-y-1.5 relative z-10">
          <div className="px-4 pb-2 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-bold">Workflow</div>
          {STEPS.map((s, idx) => {
            const active = step === s.key;
            const enabled = canNavigateTo(s.key);
            
            return (
              <button
                key={s.key}
                onClick={() => { if (enabled) { setStep(s.key); setMobileMenu(false); } }}
                disabled={!enabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out text-left relative overflow-hidden group ${
                  active 
                    ? 'bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-white border border-[#7C3AED]/30 shadow-[inset_0_0_15px_rgba(124,58,237,0.1)]' 
                    : enabled 
                      ? 'text-on-surface-variant hover:bg-white/5 hover:text-white border border-transparent' 
                      : 'text-on-surface-variant/30 cursor-not-allowed border border-transparent'
                }`}
              >
                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7C3AED] to-[#4CD7F6]" />}
                
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active ? 'bg-[#7C3AED]/20 text-[#4CD7F6]' : enabled ? 'bg-white/5 text-on-surface-variant group-hover:bg-white/10 group-hover:text-white' : 'bg-transparent text-on-surface-variant/30'
                }`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{s.icon}</span>
                </div>
                
                <span className={`text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>
                  {s.label}
                </span>
                
                {enabled && !active && <span className="material-symbols-outlined text-[14px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">chevron_right</span>}
              </button>
            )
          })}
        </div>
        
        {/* Session Status Widget */}
        <div className="px-5 mb-6 relative z-10">
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3 flex items-center gap-1.5">
               <span className="material-symbols-outlined text-[14px]">data_usage</span> Session State
             </div>
             <div className="space-y-2">
               <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/[0.02]">
                 <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">description</span> Target</span>
                 <span className={`font-mono-data text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${jd ? 'bg-success/10 text-success border border-success/20' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>
                   {jd ? <><span className="material-symbols-outlined text-[12px]">check</span> Set</> : 'Pending'}
                 </span>
               </div>
               <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/[0.02]">
                 <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">group</span> Resumes</span>
                 <span className={`font-mono-data text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${resumes.length >= 2 ? 'bg-success/10 text-success border border-success/20' : resumes.length === 1 ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>
                   {resumes.length}/2+ 
                   {resumes.length >= 2 && <span className="material-symbols-outlined text-[12px]">check</span>}
                 </span>
               </div>
             </div>
          </div>
        </div>

        <div className="px-5 pb-6 pt-4 relative z-10">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-on-surface-variant hover:text-error px-4 py-3 bg-white/[0.02] border border-white/5 hover:border-error/30 hover:bg-error/10 rounded-xl transition-all duration-300">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="text-sm font-semibold tracking-wide">Exit Session</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pt-[72px] md:pt-0 md:ml-[280px] w-full relative z-0">
        {children}
      </main>
    </div>
  );
}
