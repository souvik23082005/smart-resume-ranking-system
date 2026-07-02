import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Failed to send reset link');
      } else {
        setSent(true);
      }
    } catch (error) {
      alert('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-purple/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-neon-cyan/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-purple to-neon-cyan flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-geist text-xl font-bold text-text-primary">
            Recruit<span className="gradient-text">Rank</span>
          </span>
        </div>

        {sent ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h2 className="font-geist text-2xl font-bold text-text-primary mb-2">Check your email</h2>
            <p className="text-text-secondary mb-6">
              We sent a password reset link to <strong className="text-text-primary">{email}</strong>
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Back to Sign In <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <Link to="/login" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
            <h1 className="font-geist text-3xl font-bold text-text-primary mb-2">Forgot password?</h1>
            <p className="text-text-secondary mb-8">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-glass pl-10" placeholder="you@company.com" required />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-60">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
