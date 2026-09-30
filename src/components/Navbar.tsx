'use client';

import React from 'react';
import { User } from '../lib/api';
import { CURRENCIES, CurrencyOption } from '../lib/currencies';
import {
  Wallet,
  LogOut,
  Sun,
  Moon,
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
          <div className="logo-icon" style={{ width: '34px', height: '34px', flexShrink: 0 }}>
            <Wallet size={19} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1, fontSize: '1.2rem', fontWeight: 800 }}>LendFlow</div>
            <div
              className="logo-subtitle"
              style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}
            >
              Smart Debt & Lending Ledger
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="btn btn-ghost"
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Refresh Ledger Data"
          >
            <RefreshCw
              size={16}
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
              padding: '0.35rem 0.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              width: 'auto',
              minWidth: '65px',
              height: '34px',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
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
            style={{
              padding: '0.45rem',
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
          </button>

          {/* User profile / Logout */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.5rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  height: '34px',
                }}
                title={user.name}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--brand-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span
                  className="user-name-text"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    maxWidth: '100px',
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
                style={{
                  padding: '0.45rem',
                  color: 'var(--give-primary)',
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Logout"
              >
                <LogOut size={16} />
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
