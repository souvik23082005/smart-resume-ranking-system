import { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { runRankingEngine } from '../lib/rankingEngine';
import { RankingResult } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

type EnrichedResult = RankingResult & { resume_name: string; originalResume: any };

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#7C3AED', '#06B6D4', '#3B82F6'];

export default function ResultsPage() {
  const { jd, resumes, rankingConfig, setRankingResults, setStep } = useApp();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'bar' | 'radar'>('list');
  const [enriched, setEnriched] = useState<EnrichedResult[]>([]);

  useEffect(() => { if (jd && resumes.length >= 2 && rankingConfig) runAndSave(); }, [rankingConfig]);

  async function runAndSave() {
    if (!jd || !rankingConfig) return;
    setRunning(true);
    setError(null);
    try {
      await api.deleteRankingResults(rankingConfig.id);
    } catch {}
    
    // Simulate processing time for cool UI effect
    setTimeout(() => {
      const scores = runRankingEngine(jd, resumes, rankingConfig);
      const rows = scores.map((s) => ({
        config_id: rankingConfig.id, resume_id: s.resume_id, jd_id: jd.id,
        experience_score: s.experience_score, education_score: s.education_score,
        location_score: s.location_score, industry_score: s.industry_score,
        notice_period_score: s.notice_period_score, total_score: s.total_score, rank: s.rank,
      }));
      
      api.createRankingResults(rows).then(data => {
        setRankingResults(data as RankingResult[]);
        setEnriched(
          (data as RankingResult[])
            .sort((a, b) => a.rank - b.rank)
            .map((r) => ({ 
              ...r, 
              resume_name: resumes.find((res) => res.id === r.resume_id)?.candidate_name ?? 'Unknown',
              originalResume: resumes.find((res) => res.id === r.resume_id)
            }))
        );
        setRunning(false);
      }).catch(err => {
        setError(err.message ?? 'Failed to save results.');
        setRunning(false);
      });
    }, 1500); // 1.5s simulated processing
  }

  if (running) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background during processing */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,transparent_50%)] animate-pulse" style={{animationDuration: '2s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[1px] border-[#7C3AED]/20 rounded-full animate-ping" style={{animationDuration: '3s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[1px] border-[#4CD7F6]/20 rounded-full animate-ping" style={{animationDuration: '2.5s', animationDelay: '0.5s'}} />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 relative mb-6">
            <div className="absolute inset-0 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" style={{animationDuration: '1.5s'}} />
            <div className="absolute inset-2 border-4 border-[#4CD7F6]/20 border-b-[#4CD7F6] rounded-full animate-spin" style={{animationDuration: '1s', animationDirection: 'reverse'}} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#7C3AED] animate-pulse">memory</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] bg-clip-text text-transparent mb-2">Analyzing Candidates</h2>
          <p className="text-on-surface-variant text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4CD7F6] rounded-full animate-ping" />
            Computing match scores via multi-parameter engine...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(239,68,68,0.05)_0%,transparent_60%)]" />
        <div className="relative z-10 bg-error-container/20 border border-error/30 p-8 rounded-2xl backdrop-blur-md max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4 border border-error/20">
            <span className="material-symbols-outlined text-4xl text-error">error</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Analysis Failed</h2>
          <p className="text-sm text-error/80 mb-6">{error}</p>
          <button onClick={runAndSave} className="w-full py-3 rounded-xl bg-error/20 text-error font-semibold hover:bg-error/30 transition-colors">Retry Analysis</button>
        </div>
      </div>
    );
  }

  if (enriched.length === 0) return null;

  return (
    <div className="h-full flex flex-col p-6 md:p-10 relative overflow-hidden pb-20">
      {/* Animated background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(76,215,246,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="mb-10 shrink-0 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            </div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Ranking <span className="bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] bg-clip-text text-transparent">Results</span>
            </h2>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant flex items-center gap-2 ml-[52px]">
            <span className="material-symbols-outlined text-[16px] text-success">task_alt</span>
            Processed {enriched.length} candidates against <strong>{jd?.title}</strong>
          </p>
        </div>
        
        <button onClick={() => setStep('config')} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-[#7C3AED]/30 transition-all duration-300 text-sm font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]">
          <span className="material-symbols-outlined text-[18px]">tune</span> Adjust Configuration
        </button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Podium for top 3 */}
        {enriched.length >= 3 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-8 justify-center">
              <span className="material-symbols-outlined text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">workspace_premium</span>
              <h2 className="text-xl font-bold text-on-surface tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Top Matches</h2>
              <div className="h-[1px] w-24 bg-gradient-to-r from-white/20 to-transparent ml-2" />
              <div className="h-[1px] w-24 bg-gradient-to-l from-white/20 to-transparent mr-2 order-first" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto px-4">
              <PodiumCard result={enriched[1]} position={2} />
              <PodiumCard result={enriched[0]} position={1} />
              <PodiumCard result={enriched[2]} position={3} />
            </div>
          </section>
        )}

        {/* Data Visualization Area */}
        <div className="relative group/main rounded-2xl flex-1 flex flex-col mb-10">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#4CD7F6] to-[#7C3AED] opacity-20 group-hover/main:opacity-40 transition-opacity duration-700 blur-[1px]" style={{backgroundSize: '200% 100%', animation: 'gradientShift 6s ease infinite'}} />
          
          <div className="relative bg-[#0f0f18]/90 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col flex-1 overflow-hidden border border-white/5">
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-white/[0.01]">
              {([
                { key: 'list', label: 'Detailed Ranking', icon: 'format_list_numbered' },
                { key: 'bar', label: 'Score Breakdown', icon: 'bar_chart' },
                { key: 'radar', label: 'Comparison Matrix', icon: 'radar' },
              ] as const).map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center justify-center gap-2 flex-1 py-4 text-sm font-semibold transition-all relative overflow-hidden
                    ${activeTab === tab.key ? 'text-white' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}>
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] shadow-[0_0_10px_rgba(76,215,246,0.5)]" />
                  )}
                  {activeTab === tab.key && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#7C3AED]/10 to-transparent pointer-events-none" />
                  )}
                  <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.key ? 'text-[#4CD7F6]' : ''}`}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'list' && <CandidateList enriched={enriched} />}
              {activeTab === 'bar' && <BarChartView enriched={enriched} />}
              {activeTab === 'radar' && <RadarChartView enriched={enriched} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ result, position }: { result: EnrichedResult; position: number }) {
  if (!result) return null;

  const isFirst = position === 1;
  const isSecond = position === 2;
  const colorHex = isFirst ? '#FFD700' : isSecond ? '#C0C0C0' : '#CD7F32';
  const label = isFirst ? '1ST PLACE' : isSecond ? '2ND PLACE' : '3RD PLACE';
  
  return (
    <div className={`relative rounded-2xl flex flex-col items-center text-center transition-all duration-500
      ${isFirst ? 'p-8 md:-translate-y-6 z-20 shadow-[0_0_40px_rgba(255,215,0,0.15)] bg-gradient-to-b from-white/[0.05] to-[#0f0f18] border-t-[3px]' : 'p-6 opacity-90 hover:opacity-100 bg-gradient-to-b from-white/[0.02] to-[#0f0f18] border-t-2 z-10'}`} 
      style={{ borderTopColor: colorHex }}>
        
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 blur-[40px] pointer-events-none" style={{ background: `${colorHex}15` }} />
        
      <div className={`absolute ${isFirst ? '-top-5 px-5 py-1.5' : '-top-4 px-4 py-1'} text-black text-[10px] uppercase tracking-widest rounded-full font-black shadow-lg flex items-center gap-1.5`} style={{ background: colorHex, boxShadow: `0 4px 15px ${colorHex}40` }}>
        {isFirst && <span className="material-symbols-outlined text-[14px]">stars</span>} {label}
      </div>
      
      <div className={`${isFirst ? 'w-24 h-24 border-[3px]' : 'w-20 h-20 border-2'} rounded-full overflow-hidden mb-4 mt-3 relative flex items-center justify-center bg-black/40`} style={{ borderColor: `${colorHex}60` }}>
         {/* Inner glow */}
         <div className="absolute inset-0 blur-md opacity-30" style={{ background: colorHex }} />
         <span className="material-symbols-outlined text-[48px] text-white/70 relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
      </div>
      
      <h3 className={`font-bold text-white mb-1 truncate w-full px-2 ${isFirst ? 'text-2xl' : 'text-xl'}`} title={result.resume_name}>{result.resume_name}</h3>
      <p className="text-on-surface-variant font-medium text-xs mb-5 truncate w-full px-4 flex items-center justify-center gap-1 opacity-70">
        <span className="material-symbols-outlined text-[14px]">work_history</span>
        {result.originalResume?.experience_years ? `${result.originalResume.experience_years} yrs exp` : 'No experience specified'}
      </p>
      
      <div className={`${isFirst ? 'text-5xl' : 'text-4xl'} font-mono-data font-black text-transparent bg-clip-text mb-1 drop-shadow-sm`} style={{ backgroundImage: `linear-gradient(135deg, #fff, ${colorHex})` }}>
        {result.total_score}%
      </div>
      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-60">Overall Match</p>
    </div>
  );
}

function CandidateList({ enriched }: { enriched: EnrichedResult[] }) {
  return (
    <div className="flex flex-col gap-3">
      {enriched.map((r) => {
        const isFirst = r.rank === 1;
        const isSecond = r.rank === 2;
        const isThird = r.rank === 3;
        const color = isFirst ? '#FFD700' : isSecond ? '#C0C0C0' : isThird ? '#CD7F32' : 'transparent';
        
        return (
          <div key={r.id} className="relative group/row rounded-xl overflow-hidden transition-all duration-300">
            {/* Border gradient effect */}
            <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-xl group-hover/row:border-white/20 transition-colors" />
            
            {/* Rank-specific left border */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300" style={{ background: color !== 'transparent' ? color : 'rgba(255,255,255,0.05)' }} />
            
            <div className="relative p-4 md:p-5 flex flex-col lg:flex-row items-center gap-6 pl-6">
              
              {/* Rank & Profile info */}
              <div className="flex items-center gap-5 lg:w-1/3 w-full">
                <div className="text-2xl font-black w-8 text-center drop-shadow-md" style={{ color: color !== 'transparent' ? color : 'rgba(255,255,255,0.2)' }}>
                  {isFirst ? <span className="material-symbols-outlined text-[32px]">military_tech</span> : r.rank}
                </div>
                
                <div className="w-12 h-12 rounded-xl overflow-hidden border bg-black/40 flex items-center justify-center shrink-0" style={{ borderColor: color !== 'transparent' ? `${color}40` : 'rgba(255,255,255,0.1)' }}>
                  <span className="material-symbols-outlined text-[24px] text-white/50" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-white truncate group-hover/row:text-[#4CD7F6] transition-colors">{r.resume_name}</h3>
                  <p className="text-on-surface-variant text-[11px] mt-0.5 truncate flex items-center gap-2">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">school</span> {r.originalResume?.education || 'No Edu'}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">work</span> {r.originalResume?.experience_years ? `${r.originalResume.experience_years} yrs` : 'No Exp'}</span>
                  </p>
                </div>
              </div>
              
              {/* Detailed Scores */}
              <div className="flex flex-wrap gap-2 flex-1 justify-center lg:justify-start w-full">
                <ScorePill label="Exp" score={r.experience_score} />
                <ScorePill label="Edu" score={r.education_score} />
                <ScorePill label="Loc" score={r.location_score} />
                <ScorePill label="Ind" score={r.industry_score} />
                <ScorePill label="Not" score={r.notice_period_score} />
              </div>
              
              {/* Total Score */}
              <div className="text-right flex-shrink-0 w-full lg:w-auto flex flex-row lg:flex-col items-center justify-between lg:items-end lg:justify-center border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0 mt-2 lg:mt-0">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-1 lg:hidden">Match</p>
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-mono-data font-black text-transparent bg-clip-text drop-shadow-md leading-none mb-1" style={{ backgroundImage: color !== 'transparent' ? `linear-gradient(135deg, #fff, ${color})` : `linear-gradient(135deg, #fff, #7C3AED)` }}>
                    {r.total_score}%
                  </div>
                  <p className="hidden lg:block text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-60">Match Score</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  // Color code based on score
  let colorClass = 'border-white/10 text-on-surface';
  let bgClass = 'bg-white/[0.03]';
  if (score >= 80) { colorClass = 'border-success/30 text-success'; bgClass = 'bg-success/10'; }
  else if (score >= 50) { colorClass = 'border-warning/30 text-warning'; bgClass = 'bg-warning/10'; }
  else if (score < 50) { colorClass = 'border-error/30 text-error'; bgClass = 'bg-error/10'; }
  
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${colorClass} ${bgClass} transition-colors`}>
      <span className="font-label-sm text-[9px] uppercase tracking-widest opacity-70">{label}</span>
      <span className="font-mono-data font-bold text-[11px]">{score}</span>
    </div>
  );
}

function BarChartView({ enriched }: { enriched: EnrichedResult[] }) {
  const names = enriched.map((r) => r.resume_name);
  const datasets = [
    { label: 'Experience', data: enriched.map((r) => r.experience_score), backgroundColor: 'rgba(124,58,237,0.7)', hoverBackgroundColor: 'rgba(124,58,237,1)', borderRadius: 4 },
    { label: 'Education', data: enriched.map((r) => r.education_score), backgroundColor: 'rgba(76,215,246,0.7)', hoverBackgroundColor: 'rgba(76,215,246,1)', borderRadius: 4 },
    { label: 'Location', data: enriched.map((r) => r.location_score), backgroundColor: 'rgba(16,185,129,0.7)', hoverBackgroundColor: 'rgba(16,185,129,1)', borderRadius: 4 },
    { label: 'Industry', data: enriched.map((r) => r.industry_score), backgroundColor: 'rgba(245,158,11,0.7)', hoverBackgroundColor: 'rgba(245,158,11,1)', borderRadius: 4 },
    { label: 'Notice', data: enriched.map((r) => r.notice_period_score), backgroundColor: 'rgba(236,72,153,0.7)', hoverBackgroundColor: 'rgba(236,72,153,1)', borderRadius: 4 },
  ];
  
  const commonOpts = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: 'bottom' as const, labels: { font: { size: 11, family: 'Inter' }, color: '#94A3B8', usePointStyle: true, padding: 20 } }, 
      tooltip: { mode: 'index' as const, backgroundColor: 'rgba(15,15,24,0.9)', titleColor: '#fff', bodyColor: '#cbd5e1', borderColor: 'rgba(124,58,237,0.3)', borderWidth: 1, padding: 10, cornerRadius: 8 } 
    }, 
    scales: { 
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { font: { size: 11, family: 'Inter', weight: 'bold' as const }, color: '#cbd5e1' } }, 
      y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 20, font: { size: 10, family: 'Inter' }, color: '#64748B' } } 
    } 
  };
  
  return (
    <div className="space-y-12">
      <div>
        <p className="text-[10px] font-bold text-[#4CD7F6] uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">stacked_bar_chart</span> Parameter Breakdown
        </p>
        <div className="h-[300px] w-full">
          <Bar data={{ labels: names, datasets }} options={commonOpts} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">leaderboard</span> Total Weighted Score
        </p>
        <div className="h-[250px] w-full">
          <Bar 
            data={{ 
              labels: names, 
              datasets: [{ 
                label: 'Total Score', 
                data: enriched.map((r) => r.total_score), 
                backgroundColor: enriched.map((_, i) => `${RANK_COLORS[i] ?? '#7C3AED'}99`),
                hoverBackgroundColor: enriched.map((_, i) => RANK_COLORS[i] ?? '#7C3AED'),
                borderColor: enriched.map((_, i) => RANK_COLORS[i] ?? '#7C3AED'),
                borderWidth: 1,
                borderRadius: 6
              }] 
            }}
            options={{ ...commonOpts, plugins: { ...commonOpts.plugins, legend: { display: false } } }} 
          />
        </div>
      </div>
    </div>
  );
}

function RadarChartView({ enriched }: { enriched: EnrichedResult[] }) {
  const colors = [
    { bg: 'rgba(124,58,237,0.2)', border: 'rgba(124,58,237,1)' },
    { bg: 'rgba(76,215,246,0.2)', border: 'rgba(76,215,246,1)' },
    { bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,1)' },
    { bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,1)' },
    { bg: 'rgba(236,72,153,0.2)', border: 'rgba(236,72,153,1)' },
  ];
  return (
    <div className="h-full flex flex-col items-center">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6 self-start flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">radar</span> Candidate Comparison Matrix
      </p>
      <div className="w-full max-w-2xl aspect-square max-h-[500px]">
        <Radar
          data={{
            labels: ['Experience', 'Education', 'Location', 'Industry', 'Notice Period'],
            datasets: enriched.map((r, i) => ({
              label: r.resume_name,
              data: [r.experience_score, r.education_score, r.location_score, r.industry_score, r.notice_period_score],
              backgroundColor: colors[i % colors.length].bg,
              borderColor: colors[i % colors.length].border,
              borderWidth: 2, 
              pointBackgroundColor: colors[i % colors.length].border,
              pointBorderColor: '#0f0f18',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: colors[i % colors.length].border,
              pointRadius: 4,
              pointHoverRadius: 6
            })),
          }}
          options={{ 
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { position: 'bottom', labels: { font: { size: 12, family: 'Inter', weight: 'bold' as const }, color: '#cbd5e1', usePointStyle: true, padding: 20 } },
              tooltip: { backgroundColor: 'rgba(15,15,24,0.9)', titleColor: '#fff', bodyColor: '#cbd5e1', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
            }, 
            scales: { 
              r: { 
                min: 0, max: 100, 
                grid: { color: 'rgba(255,255,255,0.1)', lineWidth: 1 }, 
                ticks: { stepSize: 20, font: { size: 10, family: 'Inter' }, color: 'rgba(255,255,255,0.4)', backdropColor: 'transparent' }, 
                pointLabels: { font: { size: 12, family: 'Inter', weight: 'bold' as const }, color: '#94A3B8' }, 
                angleLines: { color: 'rgba(255,255,255,0.1)' } 
              } 
            } 
          }}
        />
      </div>
    </div>
  );
}
