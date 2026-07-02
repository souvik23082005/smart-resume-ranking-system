import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Failed to sign up');
      } else {
        localStorage.setItem('rr_auth', 'true');
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-deep-black flex">
      {/* Left: Branded panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-neon-cyan/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-brand-purple/20 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-purple to-neon-cyan flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-geist text-2xl font-bold text-text-primary tracking-tight">
              Recruit<span className="gradient-text">Rank</span>
            </span>
          </div>

          <h2 className="font-geist text-4xl font-bold text-text-primary leading-tight mb-4">
            Start Your <span className="gradient-text">Journey</span>
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8">
            Create your account and begin ranking candidates with precision in under 2 minutes.
          </p>

          <div className="space-y-4">
            {['Upload resumes in batch', 'Configure ranking weights', 'Visual analytics dashboard'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-purple/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-purple" />
                </div>
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Signup form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-purple to-neon-cyan flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-geist text-xl font-bold text-text-primary">
              Recruit<span className="gradient-text">Rank</span>
            </span>
          </div>

          <h1 className="font-geist text-3xl font-bold text-text-primary mb-2">Create account</h1>
          <p className="text-text-secondary mb-8">Set up your recruiter profile.</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-glass pl-10" placeholder="John Doe" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Work Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-glass pl-10" placeholder="you@company.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-glass pl-10 pr-10" placeholder="Create a strong password" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-60">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-purple hover:text-brand-purple-light font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
