'use client';

import React from 'react';
import { User } from '../lib/api';
import { CURRENCIES, CurrencyOption } from '../lib/currencies';
import {
  Wallet,
  LogOut,
  Sun,
  Moon,
  User as UserIcon,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  currentCurrency: string;
  onCurrencyChange: (curr: string) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentCurrency,
  onCurrencyChange,
  onLogout,
  theme,
  onToggleTheme,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="app-header">
      <div className="container header-content">
        {/* Brand */}
        <div className="logo-badge" onClick={onRefresh} title="Click to refresh data">
          <div className="logo-icon">
            <Wallet size={20} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1, fontSize: '1.25rem', fontWeight: 800 }}>LendFlow</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Smart Debt & Lending Ledger
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="btn btn-ghost"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            title="Refresh Ledger Data"
          >
            <RefreshCw
              size={18}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>

          {/* Currency Switcher */}
          <select
            value={currentCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="form-select"
            style={{
              padding: '0.4rem 0.6rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              width: 'auto',
              cursor: 'pointer',
            }}
            title="Change Display Currency"
          >
            {CURRENCIES.map((curr: CurrencyOption) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} ({curr.code})
              </option>
            ))}
          </select>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.6rem' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {/* User profile / Logout */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--brand-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="btn btn-ghost"
                style={{ padding: '0.5rem', color: 'var(--give-primary)' }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
};
