import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { ParameterKey, PriorityItem } from '../types';
import { PRIORITY_WEIGHTS } from '../lib/rankingEngine';

const PARAM_META: Record<ParameterKey, { label: string; desc: string; icon: string }> = {
  experience: { label: 'Relevant Experience', desc: 'Years of relevant work experience', icon: 'work_history' },
  education: { label: 'Education Level', desc: 'Academic qualification level', icon: 'school' },
  location: { label: 'Location Match', desc: 'Geographic match with job location', icon: 'location_on' },
  industry: { label: 'Industry Background', desc: 'Sector / domain experience match', icon: 'factory' },
  notice_period: { label: 'Notice Period', desc: 'Availability / joining timeline', icon: 'event_available' },
};

const DEFAULT_ORDER: ParameterKey[] = ['experience', 'education', 'location', 'industry', 'notice_period'];

function buildItems(order: ParameterKey[]): PriorityItem[] {
  return order.map((key, idx) => ({ key, label: PARAM_META[key].label, priority: idx + 1 }));
}

export default function RankingConfigPage() {
  const { jd, resumes, setRankingConfig, setStep } = useApp();
  const [items, setItems] = useState<PriorityItem[]>(buildItems(DEFAULT_ORDER));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  function reorder(from: number, to: number) {
    const next = [...items];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    setItems(next.map((item, i) => ({ ...item, priority: i + 1 })));
  }

  async function handleSaveAndRun() {
    if (!jd) return;
    setSaving(true);
    setError(null);
    const payload = {
      jd_id: jd.id,
      experience_priority: items.find((i) => i.key === 'experience')!.priority,
      education_priority: items.find((i) => i.key === 'education')!.priority,
      location_priority: items.find((i) => i.key === 'location')!.priority,
      industry_priority: items.find((i) => i.key === 'industry')!.priority,
      notice_period_priority: items.find((i) => i.key === 'notice_period')!.priority,
    };
    try {
      const data = await api.createRankingConfig(payload);
      setRankingConfig(data as any);
      setStep('results');
    } catch (err: any) {
      setError(err.message ?? 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full flex flex-col p-6 md:p-10 relative overflow-hidden">
      {/* Animated background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,transparent_70%)] pointer-events-none animate-pulse" style={{animationDuration: '4s'}} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(76,215,246,0.06)_0%,transparent_70%)] pointer-events-none animate-pulse" style={{animationDuration: '6s'}} />

      {/* Page Header */}
      <header className="mb-10 shrink-0 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
          </div>
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Set <span className="bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] bg-clip-text text-transparent">Priorities</span>
            </h2>
          </div>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl ml-[52px]">Define the parameters for your next candidate evaluation. Weight the ranking criteria.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl border backdrop-blur-sm relative z-10 bg-error-container/50 border-error/30 text-error flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="font-body-md">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="hover:bg-white/10 rounded-full p-1 transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      {/* Step Progress Indicators */}
      <div className="flex items-center gap-0 mb-8 relative z-10 ml-[52px]">
        {[
          { num: 1, label: 'Job Description', active: true },
          { num: 2, label: 'Upload Resumes', active: true },
          { num: 3, label: 'Set Priorities', active: true },
          { num: 4, label: 'View Results', active: false },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${s.active ? '' : 'opacity-30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                s.num === 3 // Current step highlight
                  ? 'bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                  : s.active
                    ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/50'
                    : 'bg-white/5 text-on-surface-variant border border-white/10'
              }`}>
                {s.active && s.num !== 3 ? <span className="material-symbols-outlined text-sm">check</span> : s.num}
              </div>
              <span className={`hidden md:inline font-label-sm text-label-sm whitespace-nowrap ${s.num === 3 ? 'text-on-surface' : 'text-on-surface-variant'}`}>{s.label}</span>
            </div>
            {i < 3 && <div className={`w-8 md:w-16 h-px mx-2 ${s.active ? 'bg-gradient-to-r from-[#7C3AED]/50 to-white/10' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[500px] relative z-10">
        {/* Left Column: Flow Summary */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="relative rounded-2xl">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/10 to-white/5 opacity-50" />
            <div className="relative bg-[#0f0f18]/60 backdrop-blur-xl rounded-2xl p-7 flex flex-col shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-on-surface/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">description</span>
                  </div>
                  Target Profile
                </h3>
                <span className="material-symbols-outlined text-[#4CD7F6] drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]">check_circle</span>
              </div>
              {jd ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                   <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">work</span> Title
                   </div>
                   <div className="font-semibold text-base text-primary truncate" title={jd.title}>{jd.title}</div>
                </div>
              ) : (
                <div className="text-on-surface-variant text-sm py-2">No JD loaded.</div>
              )}
              <button onClick={() => setStep('jd')} className="mt-5 w-full py-2.5 flex justify-center items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-xs font-semibold text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">edit</span> Edit
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/10 to-white/5 opacity-50" />
            <div className="relative bg-[#0f0f18]/60 backdrop-blur-xl rounded-2xl p-7 flex flex-col shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-on-surface/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">group_add</span>
                  </div>
                  Candidates
                </h3>
                <span className="material-symbols-outlined text-[#4CD7F6] drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]">check_circle</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED]">
                      <span className="material-symbols-outlined text-[20px]">groups</span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">Uploaded</div>
                      <div className="font-semibold text-base text-on-surface">{resumes.length} Resumes Ready</div>
                    </div>
                 </div>
              </div>
              <button onClick={() => setStep('resumes')} className="mt-5 w-full py-2.5 flex justify-center items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-xs font-semibold text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">edit</span> Edit
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ranking Logic */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="relative group/main rounded-2xl flex-1 flex flex-col">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#4CD7F6] to-[#7C3AED] opacity-30 group-hover/main:opacity-50 transition-opacity duration-700 blur-[1px]" style={{backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite'}} />
            
            <div className="relative bg-[#0f0f18]/90 backdrop-blur-2xl rounded-2xl p-7 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-[80px] pointer-events-none" />
              
              <header className="mb-6 border-b border-white/10 pb-5 shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center border border-[#7C3AED]/20 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                      <span className="material-symbols-outlined text-[#7C3AED] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                    </div>
                    Ranking Configuration
                  </h3>
                  <p className="text-sm text-on-surface-variant ml-14">Drag to reorder priorities. Higher ranks carry more weight.</p>
                </div>
              </header>

              <div className="mb-6 px-1">
                 <div className="flex h-2.5 rounded-full overflow-hidden w-full bg-black/40 border border-white/5">
                   {items.map((item, idx) => {
                      const colors = ['bg-gradient-to-r from-[#7C3AED] to-[#9D4EDD]', 'bg-gradient-to-r from-[#4CD7F6] to-[#0ea5e9]', 'bg-[#10b981]', 'bg-[#f59e0b]', 'bg-[#64748b]'];
                      return (
                        <div key={item.key} style={{ width: `${PRIORITY_WEIGHTS[item.priority]}%` }} className={`${colors[idx]} transition-all duration-300 relative group/bar`} title={`${item.label}: ${PRIORITY_WEIGHTS[item.priority]}%`}>
                           <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                        </div>
                      )
                   })}
                 </div>
                 <div className="flex justify-between mt-2.5">
                   <span className="text-[10px] text-[#7C3AED] font-bold uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> High Impact</span>
                   <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1">Low Impact <span className="material-symbols-outlined text-[14px]">arrow_downward</span></span>
                 </div>
              </div>

              {/* Draggable List */}
              <div className="flex-1 flex flex-col gap-3 relative z-10">
                {items.map((item, idx) => {
                  const meta = PARAM_META[item.key];
                  const isTop = idx === 0;
                  const isSecond = idx === 1;
                  
                  let borderClass = 'border-white/5';
                  let bgClass = 'bg-white/[0.02]';
                  let textClass = 'text-on-surface';
                  let iconClass = 'text-on-surface-variant';
                  let weightBg = 'bg-black/20 border-white/5';
                  let weightText = 'text-on-surface';
                  let numClass = 'bg-black/20 border-white/5 text-on-surface-variant';

                  if (isTop) {
                    borderClass = 'border-[#7C3AED]/40 shadow-[0_0_20px_rgba(124,58,237,0.15)]';
                    bgClass = 'bg-[#7C3AED]/10';
                    textClass = 'text-white';
                    iconClass = 'text-[#7C3AED]';
                    weightBg = 'bg-[#7C3AED]/20 border-[#7C3AED]/30';
                    weightText = 'text-[#e9d5ff] font-bold';
                    numClass = 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]';
                  } else if (isSecond) {
                    borderClass = 'border-[#4CD7F6]/30';
                    bgClass = 'bg-[#4CD7F6]/5';
                    iconClass = 'text-[#4CD7F6]';
                    weightBg = 'bg-[#4CD7F6]/10 border-[#4CD7F6]/20';
                    weightText = 'text-[#cffafe] font-semibold';
                    numClass = 'bg-[#4CD7F6]/20 border-[#4CD7F6]/30 text-[#4CD7F6]';
                  }

                  return (
                    <div
                      key={item.key}
                      draggable
                      onDragStart={() => setDragIdx(idx)}
                      onDragEnter={() => setDragOverIdx(idx)}
                      onDragEnd={() => { if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) reorder(dragIdx, dragOverIdx); setDragIdx(null); setDragOverIdx(null); }}
                      onDragOver={(e) => e.preventDefault()}
                      className={`drag-item border rounded-xl p-3.5 flex items-center gap-4 cursor-grab group transition-all duration-300
                        ${bgClass} ${borderClass} hover:border-white/30 hover:bg-white/[0.05]
                        ${dragIdx === idx ? 'opacity-40 scale-[0.98] shadow-inner' : dragOverIdx === idx && dragIdx !== idx ? 'bg-white/10 border-white/40 scale-[1.02]' : ''}`}
                    >
                      <div className="text-on-surface-variant/30 flex items-center justify-center group-hover:text-white/70 transition-colors px-1 cursor-grab active:cursor-grabbing">
                        <span className="material-symbols-outlined">drag_indicator</span>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${numClass} transition-colors`}>
                        {item.priority}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <span className={`text-sm font-semibold block flex items-center gap-2 ${textClass} transition-colors`}>
                          <span className={`material-symbols-outlined text-[18px] ${iconClass}`}>{meta.icon}</span>
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-on-surface-variant mt-0.5 ml-6">{meta.desc}</span>
                      </div>
                      
                      <div className={`px-4 py-1.5 rounded-lg flex flex-col items-end border ${weightBg} transition-colors`}>
                        <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">Weight</span>
                        <span className={`text-base font-mono-data leading-none ${weightText}`}>{PRIORITY_WEIGHTS[item.priority]}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Action */}
              <div className="mt-8 pt-6 border-t border-white/10 shrink-0 relative z-10">
                <button onClick={handleSaveAndRun} disabled={saving} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] hover:from-[#6D28D9] hover:to-[#0284c7] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all text-base font-bold tracking-wide flex items-center justify-center gap-3 group disabled:opacity-50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {saving ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <>
                      <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-700 ease-in-out relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>memory</span>
                      <span className="relative z-10">Run Comparison Engine</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-on-surface-variant mt-3 opacity-60 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Requires valid JD and minimum 2 resumes to execute.
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
