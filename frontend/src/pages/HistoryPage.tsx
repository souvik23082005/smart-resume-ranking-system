import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

interface HistoryRecord {
  id: string;
  created_at: string;
  title: string;
  required_education: string;
  required_experience_years: number;
  industry: string;
  resume_count: number;
  resumes: {
    id: string;
    candidate_name: string;
  }[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('http://localhost:5000/api/history');
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-margin-mobile md:p-margin-desktop w-full max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <p className="text-on-surface-variant animate-pulse">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-margin-mobile md:p-margin-desktop w-full max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <p className="text-error bg-error/10 px-4 py-2 rounded-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-7xl mx-auto animate-fade-in pb-20">
      <header className="mb-8 md:mb-12">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Recruit History</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">View past assessments and candidate pools.</p>
      </header>

      {history.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-surface-container/30">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-4 block">history</span>
          <p className="text-on-surface-variant">No recruitment history found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {history.map((record) => (
            <div key={record.id} className="card p-6 flex flex-col group hover:-translate-y-1 transition-all duration-300 border border-white/5 bg-surface-container/50">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline-md text-lg text-on-surface font-bold group-hover:text-primary transition-colors">{record.title}</h3>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {new Date(record.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-secondary-container/30 px-3 py-1 rounded-full border border-secondary/20 shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-secondary">mail</span>
                  <span className="text-xs text-on-secondary-container font-medium">admin@recruitrank.com</span>
                </div>
              </div>

              {/* JD Summary */}
              <div className="bg-surface-container-highest/30 rounded-lg p-4 mb-4 text-sm text-on-surface-variant grid grid-cols-2 gap-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] opacity-70">school</span>
                  <span className="truncate">{record.required_education || 'Any Degree'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] opacity-70">work</span>
                  <span>{record.required_experience_years}+ Years</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <span className="material-symbols-outlined text-[16px] opacity-70">domain</span>
                  <span className="truncate">{record.industry || 'Any Industry'}</span>
                </div>
              </div>

              {/* Resumes List */}
              <div className="mt-auto">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Candidates Evaluated ({record.resume_count})
                </h4>
                {record.resume_count === 0 ? (
                  <p className="text-sm text-on-surface-variant/50 italic">No candidates uploaded.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {record.resumes.map(resume => (
                      <div key={resume.id} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-sm text-on-surface hover:bg-white/10 transition-colors cursor-default" title={resume.candidate_name}>
                        <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                        <span className="truncate max-w-[120px]">{resume.candidate_name || 'Unknown'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
