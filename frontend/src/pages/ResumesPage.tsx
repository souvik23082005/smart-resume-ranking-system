import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { extractTextFromFile, parseResumeText } from '../lib/fileParser';
import { Resume } from '../types';

const EDUCATION_OPTIONS = [
  '', '10th / SSC', '12th / HSC', 'Diploma', 'B.A', 'B.Com', 'B.Sc', 'BCA', 'BBA',
  'B.Tech / B.E', 'MBA', 'M.Tech / M.E', 'M.Sc', 'MCA', 'PhD / Doctorate',
];

const INDUSTRY_OPTIONS = [
  '', 'Information Technology', 'Software', 'Banking & Finance', 'Healthcare',
  'Pharmaceutical', 'Manufacturing', 'Retail / E-Commerce', 'Telecom',
  'Education', 'Consulting', 'Media & Advertising', 'Automotive',
  'FMCG', 'Real Estate', 'Hospitality', 'Logistics', 'Insurance',
  'Energy & Oil', 'Construction', 'Government', 'Other',
];

export default function ResumesPage() {
  const { jd, resumes, setResumes, setStep } = useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function refreshResumes() {
    if (!jd) return;
    try {
      const data = await api.listResumes(jd.id);
      setResumes(data as Resume[]);
    } catch {}
  }

  useEffect(() => { refreshResumes(); }, []);

  async function handleFiles(files: FileList) {
    if (!jd) return;
    setUploading(true);
    setUploadError(null);
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
        setUploadError(`"${file.name}" is not supported (PDF, DOCX, TXT only).`);
        continue;
      }
      try {
        const text = await extractTextFromFile(file);
        const parsed = await parseResumeText(text);
        await api.createResume({
          jd_id: jd.id,
          candidate_name: parsed.candidate_name || file.name.replace(/\.[^.]+$/, ''),
          education: parsed.education || null,
          experience_years: parsed.experience_years,
          location: parsed.location || null,
          industry: parsed.industry || null,
          notice_period_days: parsed.notice_period_days,
          raw_text: text,
          filename: file.name,
        });
      } catch (err: any) {
        setUploadError(`Error parsing "${file.name}": ${err.message}`);
      }
    }
    setUploading(false);
    await refreshResumes();
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this resume?')) return;
    await api.deleteResume(id);
    await refreshResumes();
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
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Upload <span className="bg-gradient-to-r from-[#7C3AED] to-[#4CD7F6] bg-clip-text text-transparent">Candidates</span>
            </h2>
          </div>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl ml-[52px]">Upload at least 2 candidate resumes to rank against the Job Description.</p>
      </header>

      {uploadError && (
        <div className="mb-6 p-4 rounded-xl border backdrop-blur-sm relative z-10 bg-error-container/50 border-error/30 text-error flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="font-body-md">{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="hover:bg-white/10 rounded-full p-1 transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      {/* Step Progress Indicators */}
      <div className="flex items-center gap-0 mb-8 relative z-10 ml-[52px]">
        {[
          { num: 1, label: 'Job Description', active: true },
          { num: 2, label: 'Upload Resumes', active: true },
          { num: 3, label: 'Set Priorities', active: false },
          { num: 4, label: 'View Results', active: false },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${s.active ? '' : 'opacity-30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                s.num === 2 // Current step highlight
                  ? 'bg-gradient-to-br from-[#7C3AED] to-[#4CD7F6] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                  : s.active
                    ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/50'
                    : 'bg-white/5 text-on-surface-variant border border-white/10'
              }`}>
                {s.active && s.num !== 2 ? <span className="material-symbols-outlined text-sm">check</span> : s.num}
              </div>
              <span className={`hidden md:inline font-label-sm text-label-sm whitespace-nowrap ${s.num === 2 ? 'text-on-surface' : 'text-on-surface-variant'}`}>{s.label}</span>
            </div>
            {i < 3 && <div className={`w-8 md:w-16 h-px mx-2 ${s.active ? 'bg-gradient-to-r from-[#7C3AED]/50 to-white/10' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[500px] relative z-10">
        
        {/* Left Column: JD Summary */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="relative rounded-2xl flex-1">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/10 to-white/5 opacity-50" />
            <div className="relative bg-[#0f0f18]/60 backdrop-blur-xl rounded-2xl p-7 flex flex-col flex-1 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-on-surface/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">description</span>
                  </div>
                  Target Profile
                </h3>
                <span className="material-symbols-outlined text-[#4CD7F6] drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]">check_circle</span>
              </div>
              
              {jd ? (
                <div className="space-y-5 font-body-md text-on-surface">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5">Title</div>
                    <div className="font-semibold text-lg text-primary truncate" title={jd.title}>{jd.title}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">work_history</span> Experience
                      </div>
                      <div className="font-medium">{jd.required_experience_years ? `${jd.required_experience_years}+ yrs` : 'Any'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> Location
                      </div>
                      <div className="font-medium truncate" title={jd.required_location || 'Any'}>{jd.required_location || 'Any'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-on-surface-variant opacity-50 py-10">
                  <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
                  <p>No JD loaded.</p>
                </div>
              )}
              
              <button onClick={() => setStep('jd')} className="mt-auto pt-6 w-full py-3 flex justify-center items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-sm font-semibold text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Job Description
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Resumes */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="relative group/main rounded-2xl flex-1 flex flex-col">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#4CD7F6] to-[#7C3AED] opacity-30 group-hover/main:opacity-50 transition-opacity duration-700 blur-[1px]" style={{backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite'}} />
            
            <div className="relative bg-[#0f0f18]/90 backdrop-blur-2xl rounded-2xl p-7 flex flex-col flex-1 shadow-2xl min-h-[450px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-on-surface flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center border border-[#7C3AED]/20">
                    <span className="material-symbols-outlined text-[#7C3AED] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
                  </div>
                  Candidate Resumes
                </h3>
                <span className={`text-[10px] uppercase tracking-widest border px-3 py-1.5 rounded-full font-bold ${resumes.length >= 2 ? 'text-success bg-success/10 border-success/30' : 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20'}`}>
                  {resumes.length >= 2 ? 'Requirements Met' : 'Min 2 Required'}
                </span>
              </div>

              {/* Upload Zone */}
              <div 
                className={`mb-6 p-8 border-2 border-dashed rounded-2xl transition-all duration-500 cursor-pointer relative overflow-hidden group/upload flex flex-col items-center justify-center text-center ${
                  dragOver 
                    ? 'border-[#4CD7F6] bg-[#4CD7F6]/5 shadow-[inset_0_0_30px_rgba(76,215,246,0.1)]' 
                    : 'border-white/10 hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5 hover:shadow-[inset_0_0_30px_rgba(124,58,237,0.05)]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#7C3AED]/10 animate-ping opacity-30 pointer-events-none" style={{animationDuration: '2.5s'}} />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover/upload:scale-110 group-hover/upload:border-[#7C3AED]/30 transition-transform duration-500 shadow-lg">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover/upload:text-[#4CD7F6] transition-colors duration-500">folder_open</span>
                  </div>
                  <p className="font-semibold text-on-surface mb-1 text-base">Drop Multiple Resumes</p>
                  <p className="text-xs text-on-surface-variant mb-4">Supports PDF, DOCX, TXT</p>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#7C3AED]/30 text-on-surface px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Select Files
                    <input type="file" accept=".pdf,.docx,.doc,.txt" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                  </label>
                  {uploading && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
                      <span className="text-xs text-[#7C3AED]">Parsing and saving...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumes List */}
              {resumes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant border border-dashed border-white/5 rounded-xl bg-white/[0.01] py-10 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
                   <span className="material-symbols-outlined text-4xl mb-3 opacity-30">inventory_2</span>
                   <p className="relative z-10 text-sm">No resumes uploaded yet.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {resumes.map((resume) =>
                    editId === resume.id ? (
                      <ResumeEditCard key={resume.id} resume={resume}
                        onSave={async (updated) => { await api.updateResume(resume.id, updated); await refreshResumes(); setEditId(null); }}
                        onCancel={() => setEditId(null)} />
                    ) : (
                      <ResumeViewCard key={resume.id} resume={resume} onEdit={() => setEditId(resume.id)} onDelete={() => handleDelete(resume.id)} />
                    )
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center">
                <div>
                  {resumes.length > 0 && resumes.length < 2 && (
                    <span className="text-warning text-xs font-semibold flex items-center gap-1.5 bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/20">
                      <span className="material-symbols-outlined text-[16px]">warning</span> 
                      Upload at least 1 more resume
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setStep('config')} 
                  disabled={resumes.length < 2}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:hover:shadow-none"
                >
                  Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeViewCard({ resume, onEdit, onDelete }: { resume: Resume; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="relative group rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7C3AED] to-[#4CD7F6] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-sm group-hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-shadow">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors">person</span>
            </div>
            <div className="min-w-0">
              <p className="font-body-md font-semibold text-on-surface truncate group-hover:text-[#4CD7F6] transition-colors">{resume.candidate_name || 'Unknown Candidate'}</p>
              <p className="font-mono-data text-[11px] text-on-surface-variant mt-0.5 truncate">{resume.filename}</p>
            </div>
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
            <button onClick={onEdit} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-[#7C3AED]/20 text-on-surface-variant hover:text-[#7C3AED] border border-transparent hover:border-[#7C3AED]/30 transition-all shadow-sm" title="Edit extracted data">
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-error/20 text-on-surface-variant hover:text-error border border-transparent hover:border-error/30 transition-all shadow-sm" title="Remove resume">
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
          <FieldBadge label="Education" icon="school" value={resume.education} />
          <FieldBadge label="Experience" icon="work_history" value={resume.experience_years != null ? `${resume.experience_years} yrs` : null} />
          <FieldBadge label="Location" icon="location_on" value={resume.location} />
          <FieldBadge label="Industry" icon="factory" value={resume.industry} />
          <FieldBadge label="Notice" icon="event_available" value={resume.notice_period_days != null ? `${resume.notice_period_days} days` : null} />
        </div>
      </div>
    </div>
  );
}

function FieldBadge({ label, icon, value }: { label: string; icon: string; value: string | null | undefined }) {
  return (
    <div className="bg-white/[0.02] rounded-lg px-2.5 py-2 border border-white/5 group-hover:border-white/10 transition-colors">
      <p className="flex items-center gap-1 font-label-sm text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-70">
        <span className="material-symbols-outlined text-[10px]">{icon}</span> {label}
      </p>
      <p className="font-mono-data text-[11px] font-medium text-on-surface truncate">
        {value || <span className="opacity-40 italic">N/A</span>}
      </p>
    </div>
  );
}

function ResumeEditCard({ resume, onSave, onCancel }: { resume: Resume; onSave: (updated: Partial<Resume>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    candidate_name: resume.candidate_name ?? '',
    education: resume.education ?? '',
    experience_years: resume.experience_years != null ? String(resume.experience_years) : '',
    location: resume.location ?? '',
    industry: resume.industry ?? '',
    notice_period_days: resume.notice_period_days != null ? String(resume.notice_period_days) : '',
  });

  return (
    <div className="relative rounded-xl p-5 border border-[#7C3AED]/40 bg-[#7C3AED]/5 shadow-[inset_0_0_20px_rgba(124,58,237,0.05)] overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/10 blur-2xl rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <p className="font-label-sm text-[11px] font-bold text-[#4CD7F6] uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">edit_note</span> Editing Data
          </p>
          <span className="font-mono-data text-[10px] text-on-surface-variant bg-white/5 px-2 py-1 rounded border border-white/10 truncate max-w-[150px]">{resume.filename}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-5">
          <EF label="Candidate Name"><input value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:bg-black/40 transition-colors" placeholder="Full name" /></EF>
          <EF label="Education">
            <select value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:bg-black/40 transition-colors">
              {EDUCATION_OPTIONS.map((o) => <option className="text-[#8A2BE2] bg-[#0f0f18]" key={o} value={o}>{o || '— Not specified —'}</option>)}
            </select>
          </EF>
          <EF label="Experience (Yrs)"><input type="number" min="0" step="0.5" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:bg-black/40 transition-colors" placeholder="e.g. 4" /></EF>
          <EF label="Location"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:bg-black/40 transition-colors" placeholder="City" /></EF>
          <EF label="Industry">
            <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:bg-black/40 transition-colors">
              {INDUSTRY_OPTIONS.map((o) => <option className="text-[#8A2BE2] bg-[#0f0f18]" key={o} value={o}>{o || '— Not specified —'}</option>)}
            </select>
          </EF>
          <EF label="Notice Period (Days)"><input type="number" min="0" value={form.notice_period_days} onChange={(e) => setForm({ ...form, notice_period_days: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-[#7C3AED]/50 focus:bg-black/40 transition-colors" placeholder="e.g. 30" /></EF>
        </div>
        
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant border border-white/10 hover:bg-white/5 hover:text-white transition-colors">Cancel</button>
          <button onClick={() => onSave({ candidate_name: form.candidate_name || null, education: form.education || null, experience_years: form.experience_years ? Number(form.experience_years) : null, location: form.location || null, industry: form.industry || null, notice_period_days: form.notice_period_days ? Number(form.notice_period_days) : null })} className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function EF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 px-1">{label}</label>{children}</div>;
}
