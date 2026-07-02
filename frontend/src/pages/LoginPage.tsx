import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Invalid credentials');
      } else {
        localStorage.setItem('rr_auth', 'true');
        // Store user info if needed: localStorage.setItem('rr_user', JSON.stringify(data));
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-cyan/15 rounded-full blur-[100px]" />

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
            Precision <span className="gradient-text">Recruitment</span> at Scale
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Join hundreds of HR teams using AI-powered candidate ranking to find the perfect match, faster.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { val: '92%', label: 'Match Accuracy' },
              { val: '75%', label: 'Time Saved' },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className="text-2xl font-geist font-bold gradient-text">{s.val}</p>
                <p className="text-xs text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-purple to-neon-cyan flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-geist text-xl font-bold text-text-primary">
              Recruit<span className="gradient-text">Rank</span>
            </span>
          </div>

          <h1 className="font-geist text-3xl font-bold text-text-primary mb-2">Welcome back</h1>
          <p className="text-text-secondary mb-8">Sign in to your account to continue.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-glass pl-10"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-secondary">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-purple hover:text-brand-purple-light transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-glass pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-purple hover:text-brand-purple-light font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
