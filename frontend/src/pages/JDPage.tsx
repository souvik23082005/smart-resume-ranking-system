import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { extractTextFromFile, parseJDText } from '../lib/fileParser';

type Mode = 'choose' | 'manual' | 'upload';

const EDUCATION_OPTIONS = [
  'Any', '10th / SSC', '12th / HSC', 'Diploma', 'B.A', 'B.Com', 'B.Sc', 'BCA', 'BBA',
  'B.Tech / B.E', 'MBA', 'M.Tech / M.E', 'M.Sc', 'MCA', 'PhD / Doctorate',
];

const INDUSTRY_OPTIONS = [
  'Information Technology', 'Software', 'Banking & Finance', 'Healthcare',
  'Pharmaceutical', 'Manufacturing', 'Retail / E-Commerce', 'Telecom',
  'Education', 'Consulting', 'Media & Advertising', 'Automotive',
  'FMCG', 'Real Estate', 'Hospitality', 'Logistics', 'Insurance',
  'Energy & Oil', 'Construction', 'Government', 'Other',
];

interface ManualJD {
  title: string;
  required_education: string;
  required_experience_years: string;
  required_location: string;
  industry: string;
  notice_period_days: string;
}

const DEFAULT_MANUAL: ManualJD = {
  title: '', required_education: 'Any', required_experience_years: '',
  required_location: '', industry: '', notice_period_days: '',
};

export default function JDPage() {
  const { setJd, setStep } = useApp();
  const [mode, setMode] = useState<Mode>('choose');
  const [form, setForm] = useState<ManualJD>(DEFAULT_MANUAL);
  const [errors, setErrors] = useState<Partial<ManualJD>>({});
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileRawText, setFileRawText] = useState('');
  const [fileName, setFileName] = useState('');

  function validate(): boolean {
    const e: Partial<ManualJD> = {};
    if (!form.title.trim()) e.title = 'Job title is required';
    if (form.required_experience_years && isNaN(Number(form.required_experience_years)))
      e.required_experience_years = 'Must be a number';
    if (form.notice_period_days && isNaN(Number(form.notice_period_days)))
      e.notice_period_days = 'Must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveJD(isUpload: boolean) {
    if (!validate()) return;
    setUploading(true);
    setFeedback(null);
    const payload = {
      title: form.title.trim(),
      required_education: form.required_education === 'Any' ? null : form.required_education,
      required_experience_years: form.required_experience_years ? Number(form.required_experience_years) : null,
      required_location: form.required_location.trim() || null,
      industry: form.industry || null,
      notice_period_days: form.notice_period_days ? Number(form.notice_period_days) : null,
      raw_text: isUpload ? fileRawText : null,
      source: isUpload ? 'upload' : 'manual',
    };
    try {
      const data = await api.createJD(payload);
      setJd(data as any);
      setFeedback({ type: 'success', msg: 'Job description saved.' });
      setTimeout(() => setStep('resumes'), 700);
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message ?? 'Failed to save.' });
    } finally {
      setUploading(false);
    }
  }

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      setFeedback({ type: 'error', msg: 'Only PDF, DOCX, or TXT files are supported.' });
      return;
    }
    setUploading(true);
    setFeedback(null);
    try {
      const text = await extractTextFromFile(file);
      const parsed = await parseJDText(text);
      setFileRawText(text);
      setFileName(file.name);
      setForm({
        title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        required_education: parsed.required_education ?? 'Any',
        required_experience_years: parsed.required_experience_years != null ? String(parsed.required_experience_years) : '',
        required_location: parsed.required_location ?? '',
        industry: parsed.industry ?? '',
        notice_period_days: parsed.notice_period_days != null ? String(parsed.notice_period_days) : '',
      });
      setMode('manual');
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message ?? 'Failed to parse file.' });
    } finally {
      setUploading(false);
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
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
          </div>
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Configure <span className="bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] bg-clip-text text-transparent">Assessment</span>
            </h2>
          </div>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl ml-[52px]">Define the parameters for your next candidate evaluation.</p>
      </header>

      {feedback && (
        <div className={`mb-6 p-4 rounded-xl border backdrop-blur-sm relative z-10 ${feedback.type === 'success' ? 'bg-tertiary-container/50 border-tertiary/30 text-tertiary' : 'bg-error-container/50 border-error/30 text-error'} flex justify-between items-center shadow-lg`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
            <span className="font-body-md">{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:bg-white/10 rounded-full p-1 transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      {/* Step Progress Indicators */}
      <div className="flex items-center gap-0 mb-8 relative z-10 ml-[52px]">
        {[
          { num: 1, label: 'Job Description', active: true },
          { num: 2, label: 'Upload Resumes', active: false },
          { num: 3, label: 'Set Priorities', active: false },
          { num: 4, label: 'View Results', active: false },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${s.active ? '' : 'opacity-30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                s.active 
                  ? 'bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                  : 'bg-white/5 text-on-surface-variant border border-white/10'
              }`}>
                {s.num}
              </div>
              <span className="hidden md:inline font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{s.label}</span>
            </div>
            {i < 3 && <div className={`w-8 md:w-16 h-px mx-2 ${i === 0 ? 'bg-gradient-to-r from-[#7C3AED]/50 to-white/10' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[500px] relative z-10">
        {/* Left Column: Job Description Setup */}
        <div className="w-full lg:w-3/5 flex flex-col gap-6">
          {/* Animated gradient border card */}
          <div className="relative group rounded-2xl flex-1">
            {/* Animated gradient border */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#4CD7F6] to-[#7C3AED] opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-[1px]" style={{backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite'}} />
            
            <div className="relative bg-[#0f0f18]/90 backdrop-blur-2xl rounded-2xl p-7 flex flex-col flex-1 min-h-[450px] shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-on-surface flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center border border-[#7C3AED]/20">
                    <span className="material-symbols-outlined text-[#7C3AED] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                  </div>
                  Target Profile
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-3 py-1.5 rounded-full font-bold">Required</span>
              </div>

              {mode === 'choose' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                  {/* Upload Zone */}
                  <div 
                    className={`w-full p-10 border-2 border-dashed rounded-2xl transition-all duration-500 cursor-pointer relative overflow-hidden group/upload ${
                      dragOver 
                        ? 'border-[#4CD7F6] bg-[#4CD7F6]/5 shadow-[inset_0_0_30px_rgba(76,215,246,0.1)]' 
                        : 'border-white/10 hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5 hover:shadow-[inset_0_0_30px_rgba(124,58,237,0.05)]'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  >
                    {/* Animated glow ring behind icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#7C3AED]/10 animate-ping opacity-30 pointer-events-none" style={{animationDuration: '2s'}} />
                    
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#4CD7F6]/20 flex items-center justify-center mx-auto mb-5 border border-white/10 group-hover/upload:scale-110 transition-transform duration-500 shadow-lg">
                        <span className="material-symbols-outlined text-3xl text-[#7C3AED] group-hover/upload:text-[#4CD7F6] transition-colors duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                      </div>
                      <p className="font-semibold text-on-surface mb-1.5 text-base">Drag & Drop JD File Here</p>
                      <p className="text-xs text-on-surface-variant mb-5">Supports PDF, DOCX, TXT</p>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#7C3AED]/30 text-on-surface px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                        <span className="material-symbols-outlined text-sm text-[#7C3AED]">folder_open</span>
                        Browse Files
                        <input type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                      </label>
                      {uploading && (
                        <div className="mt-5 flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
                          <span className="text-xs text-[#7C3AED]">Extracting parameters...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="flex items-center w-full gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10">or</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  </div>
                  
                  {/* Manual Entry Button */}
                  <button onClick={() => setMode('manual')} className="w-full py-4 flex justify-center items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-[#7C3AED]/5 hover:border-[#7C3AED]/30 transition-all duration-500 group/manual hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]">
                    <span className="material-symbols-outlined text-lg text-on-surface-variant group-hover/manual:text-[#7C3AED] transition-colors duration-300">edit_note</span>
                    <span className="font-semibold text-sm text-on-surface-variant group-hover/manual:text-on-surface transition-colors duration-300">Enter Details Manually</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); saveJD(fileName !== ''); }} className="flex-1 flex flex-col gap-5">
                  {fileName && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-tertiary-container/20 border border-tertiary/20 text-tertiary text-xs">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Extracted from <strong>{fileName}</strong>. Please review.
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">Job Title *</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Senior Software Engineer" className={`w-full bg-white/[0.03] border ${errors.title ? 'border-error' : 'border-white/10 focus:border-[#7C3AED]/50'} rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all duration-300`} />
                    {errors.title && <span className="text-xs text-error px-1">{errors.title}</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">Industry</label>
                      <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all duration-300">
                        <option className="text-[#8A2BE2] bg-[#0f0f18]" value="">— Select —</option>
                        {INDUSTRY_OPTIONS.map(o => <option className="text-[#8A2BE2] bg-[#0f0f18]" key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">Location</label>
                      <input type="text" value={form.required_location} onChange={(e) => setForm({ ...form, required_location: e.target.value })} placeholder="e.g., Remote, NY" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all duration-300" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">Min. Experience</label>
                      <input type="number" step="0.5" min="0" value={form.required_experience_years} onChange={(e) => setForm({ ...form, required_experience_years: e.target.value })} placeholder="Years" className={`w-full bg-white/[0.03] border ${errors.required_experience_years ? 'border-error' : 'border-white/10 focus:border-[#7C3AED]/50'} rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all duration-300`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">Notice Period (Days)</label>
                      <input type="number" min="0" value={form.notice_period_days} onChange={(e) => setForm({ ...form, notice_period_days: e.target.value })} placeholder="e.g., 30" className={`w-full bg-white/[0.03] border ${errors.notice_period_days ? 'border-error' : 'border-white/10 focus:border-[#7C3AED]/50'} rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all duration-300`} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">Education</label>
                    <select value={form.required_education} onChange={(e) => setForm({ ...form, required_education: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all duration-300">
                      {EDUCATION_OPTIONS.map(o => <option className="text-[#8A2BE2] bg-[#0f0f18]" key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  
                  <div className="mt-auto pt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => { setMode('choose'); setFileName(''); setForm(DEFAULT_MANUAL); }} className="px-5 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                      Cancel
                    </button>
                    <button type="submit" disabled={uploading} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300 flex items-center gap-2 disabled:opacity-50">
                      {uploading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                      ) : (
                        <>Save & Continue <span className="material-symbols-outlined text-sm">arrow_forward</span></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Next Steps Preview */}
        <div className="w-full lg:w-2/5 flex flex-col gap-6">
          <div className="relative rounded-2xl flex-1">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/5 to-white/5 opacity-50" />
            <div className="relative bg-[#0f0f18]/60 backdrop-blur-xl rounded-2xl p-7 flex flex-col flex-1 min-h-[450px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-on-surface/40 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">group_add</span>
                  </div>
                  Up Next
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 font-bold">Step 2</span>
              </div>
              
              <div className="flex-1 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                {/* Subtle animated pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #7C3AED 1px, transparent 1px), radial-gradient(circle at 80% 20%, #4CD7F6 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5 border border-white/5">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">lock</span>
                  </div>
                  <p className="font-semibold text-on-surface/30 mb-2">Complete Step 1 First</p>
                  <p className="text-xs text-on-surface-variant/30 max-w-[200px] mx-auto leading-relaxed">Save your Job Description to unlock the resume upload step.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
