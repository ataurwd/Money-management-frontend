'use client';

import React from 'react';
import { DashboardSummary } from '../lib/api';
import { formatCurrency } from '../lib/currencies';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface HeroBalanceProps {
  data: DashboardSummary | null;
  currency: string;
  onOpenLentModal: () => void;
  onOpenBorrowedModal: () => void;
  onFilterOverdue?: () => void;
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({
  data,
  currency,
  onOpenLentModal,
  onOpenBorrowedModal,
  onFilterOverdue,
}) => {
  if (!data) return null;

  const { summary, alerts } = data;
  const net = summary.netBalance;

  const isSurplus = net > 0;
  const isDeficit = net < 0;

  const totalOwedToYou = summary.lent.totalPending;
  const totalYouOwe = summary.borrowed.totalPending;
  const grandTotal = totalOwedToYou + totalYouOwe;
  const getPercentage = grandTotal > 0 ? (totalOwedToYou / grandTotal) * 100 : 50;

  return (
    <div className="glass-card hero-balance-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Left: Net Balance Numbers */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            <Scale size={16} />
            <span>NET FINANCIAL POSITION</span>
          </div>

          <div
            className="net-amount"
            style={{
              color: isSurplus
                ? 'var(--get-primary)'
                : isDeficit
                ? 'var(--give-primary)'
                : 'var(--text-primary)',
            }}
          >
            {isSurplus ? '+' : ''}
            {formatCurrency(net, currency)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              className={`badge ${
                isSurplus ? 'badge-get' : isDeficit ? 'badge-give' : 'badge-settled'
              }`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              {isSurplus && <TrendingUp size={13} />}
              {isDeficit && <TrendingDown size={13} />}
              {isSurplus
                ? 'Net Surplus (You are owed more)'
                : isDeficit
                ? 'Net Deficit (You owe more)'
                : 'Balanced & Settled'}
            </span>

            {/* Overdue alert pill */}
            {alerts.overdueCount > 0 && (
              <button
                onClick={onFilterOverdue}
                className="badge badge-overdue"
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                }}
                title="Click to view overdue transactions"
              >
                <AlertTriangle size={13} />
                {alerts.overdueCount} Overdue
              </button>
            )}

            {alerts.upcomingCount > 0 && (
              <span
                className="badge badge-pending"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                <Clock size={13} />
                {alerts.upcomingCount} Due This Week
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Action CTAs */}
        <div className="hero-actions-container">
          <div
            style={{
              fontSize: '0.725rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              marginBottom: '0.4rem',
              letterSpacing: '0.04em',
            }}
          >
            QUICK TRANSACTION ENTRY
          </div>
          <div className="hero-quick-buttons" style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={onOpenLentModal}
              className="btn btn-get"
              style={{ padding: '0.65rem 1rem' }}
            >
              <ArrowDownLeft size={16} />
              <span>+ Lent Money</span>
            </button>

            <button
              onClick={onOpenBorrowedModal}
              className="btn btn-give"
              style={{ padding: '0.65rem 1rem' }}
            >
              <ArrowUpRight size={16} />
              <span>- Borrowed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Proportion Bar */}
      {grandTotal > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.35rem',
              flexWrap: 'wrap',
              gap: '0.3rem',
            }}
          >
            <span style={{ color: 'var(--get-primary)' }}>
              You'll Get: {formatCurrency(totalOwedToYou, currency)} ({Math.round(getPercentage)}%)
            </span>
            <span style={{ color: 'var(--give-primary)' }}>
              You'll Give: {formatCurrency(totalYouOwe, currency)} ({Math.round(100 - getPercentage)}%)
            </span>
          </div>
          <div
            style={{
              height: '7px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--give-primary)',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: `${getPercentage}%`,
                background: 'var(--get-primary)',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
