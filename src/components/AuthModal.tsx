'use client';

import React, { useState } from 'react';
import { api, User } from '../lib/api';
import { CURRENCIES, CurrencyOption } from '../lib/currencies';
import { Lock, Mail, User as UserIcon, Wallet, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        api.setToken(res.token);
        onSuccess(res.user);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
          currency,
        });
        api.setToken(res.token);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login
  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Try to login to demo account, if not exists, register demo
      const demoEmail = 'demo@lendflow.com';
      const demoPass = 'demo123456';
      try {
        const res = await api.login({ email: demoEmail, password: demoPass });
        api.setToken(res.token);
        onSuccess(res.user);
      } catch (e) {
        const res = await api.register({
          name: 'Demo User',
          email: demoEmail,
          password: demoPass,
          currency: 'BDT',
        });
        api.setToken(res.token);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError('Could not initialize demo account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          padding: '2.25rem',
          maxWidth: '460px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 0.85rem',
              boxShadow: 'var(--shadow-glow-brand)',
            }}
          >
            <Wallet size={28} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isLogin ? 'Welcome back to LendFlow' : 'Create Your Personal Ledger'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isLogin
              ? 'Sign in to access your personal debt & lending records'
              : 'Multi-user ledger: Track who owes you & who you owe in privacy'}
          </p>
        </div>

        {/* Tab switch */}
        <div
          className="tabs"
          style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            style={{ textAlign: 'center' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            style={{ textAlign: 'center' }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">YOUR FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ataur Rahman"
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">DEFAULT CURRENCY</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="form-select"
              >
                {CURRENCIES.map((c: CurrencyOption) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} - {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In to Ledger' : 'Create Free Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              margin: '1.25rem 0',
            }}
          >
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
            <span
              style={{
                position: 'absolute',
                top: '-0.7rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--bg-secondary)',
                padding: '0 0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              OR EXPLORE INSTANTLY
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <Sparkles size={16} color="#f59e0b" />
            Launch Instant Demo Account
          </button>
        </div>
      </div>
    </div>
  );
};
