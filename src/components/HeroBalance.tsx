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
  const isBalanced = net === 0;

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
          gap: '1.5rem',
        }}
      >
        {/* Left: Net Balance Numbers */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <Scale size={18} />
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              className={`badge ${
                isSurplus ? 'badge-get' : isDeficit ? 'badge-give' : 'badge-settled'
              }`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              {isSurplus && <TrendingUp size={14} />}
              {isDeficit && <TrendingDown size={14} />}
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
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                }}
                title="Click to view overdue transactions"
              >
                <AlertTriangle size={14} />
                {alerts.overdueCount} Overdue Payment{alerts.overdueCount > 1 ? 's' : ''}
              </button>
            )}

            {alerts.upcomingCount > 0 && (
              <span
                className="badge badge-pending"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Clock size={14} />
                {alerts.upcomingCount} Due This Week
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Action CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            QUICK TRANSACTION ENTRY
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenLentModal}
              className="btn btn-get"
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <ArrowDownLeft size={18} />
              + Lent Money (You'll Get)
            </button>

            <button
              onClick={onOpenBorrowedModal}
              className="btn btn-give"
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <ArrowUpRight size={18} />
              - Borrowed (You'll Give)
            </button>
          </div>
        </div>
      </div>

      {/* Visual Proportion Bar */}
      {grandTotal > 0 && (
        <div style={{ marginTop: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
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
              height: '8px',
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
