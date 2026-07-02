import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { JobDescription, Resume, RankingConfig, RankingResult, AppStep } from '../types';
import { api } from '../lib/api';

interface AppContextValue {
  step: AppStep;
  setStep: (s: AppStep) => void;
  jd: JobDescription | null;
  setJd: (jd: JobDescription | null) => void;
  resumes: Resume[];
  setResumes: (r: Resume[]) => void;
  refreshResumes: () => Promise<void>;
  rankingConfig: RankingConfig | null;
  setRankingConfig: (c: RankingConfig | null) => void;
  rankingResults: RankingResult[];
  setRankingResults: (r: RankingResult[]) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<AppStep>('jd');
  const [jd, setJd] = useState<JobDescription | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [rankingConfig, setRankingConfig] = useState<RankingConfig | null>(null);
  const [rankingResults, setRankingResults] = useState<RankingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshResumes = useCallback(async () => {
    if (!jd) return;
    try {
      const data = await api.listResumes(jd.id);
      setResumes(data as Resume[]);
    } catch {}
  }, [jd]);

  return (
    <AppContext.Provider value={{
      step, setStep, jd, setJd,
      resumes, setResumes, refreshResumes,
      rankingConfig, setRankingConfig,
      rankingResults, setRankingResults,
      loading, setLoading, error, setError,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
