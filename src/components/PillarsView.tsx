'use client';

import React from 'react';
import { DashboardSummary } from '../lib/api';
import { formatCurrency } from '../lib/currencies';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Users,
  CheckCircle2,
  Hourglass,
} from 'lucide-react';

interface PillarsViewProps {
  data: DashboardSummary | null;
  currency: string;
  onOpenLentModal: () => void;
  onOpenBorrowedModal: () => void;
  onSelectTab: (type: 'LENT' | 'BORROWED') => void;
}

export const PillarsView: React.FC<PillarsViewProps> = ({
  data,
  currency,
  onOpenLentModal,
  onOpenBorrowedModal,
  onSelectTab,
}) => {
  if (!data) return null;

  const { lent, borrowed } = data.summary;

  return (
    <div className="pillars-grid">
      {/* 🟢 PILLAR 1: YOU'LL GET (Money You Lent / People Who Owe You / Ami Taka Pai) */}
      <div className="glass-card pillar-card pillar-get">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--get-bg)',
                border: '1px solid var(--get-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--get-primary)',
              }}
            >
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--get-primary)', fontWeight: 800 }}>
                You'll Get
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Money you lent (Who owes you)
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('LENT')}
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            View List →
          </button>
        </div>

        {/* Big Pending Balance */}
        <div style={{ margin: '1.25rem 0' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            CURRENT PENDING RECEIVABLE
          </div>
          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--get-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {formatCurrency(lent.totalPending, currency)}
          </div>
        </div>

        {/* Breakdown Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Lent</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatCurrency(lent.totalOriginal, currency)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Already Collected</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--get-primary)' }}>
              {formatCurrency(lent.totalCollected, currency)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Records</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {lent.count - lent.settledCount} pending
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fully Settled</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {lent.settledCount} records
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenLentModal}
          className="btn btn-get"
          style={{ width: '100%', padding: '0.75rem' }}
        >
          <Plus size={18} />
          Record Money You Lent (+ You'll Get)
        </button>
      </div>

      {/* 🔴 PILLAR 2: YOU'LL GIVE (Money You Borrowed / People You Owe / Amr Kache Taka Pai) */}
      <div className="glass-card pillar-card pillar-give">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--give-bg)',
                border: '1px solid var(--give-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--give-primary)',
              }}
            >
              <ArrowUpRight size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--give-primary)', fontWeight: 800 }}>
                You'll Give
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Money you borrowed (Who you owe)
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('BORROWED')}
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            View List →
          </button>
        </div>

        {/* Big Pending Balance */}
        <div style={{ margin: '1.25rem 0' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            CURRENT PENDING PAYABLE
          </div>
          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--give-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {formatCurrency(borrowed.totalPending, currency)}
          </div>
        </div>

        {/* Breakdown Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Borrowed</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatCurrency(borrowed.totalOriginal, currency)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Already Repaid</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--give-primary)' }}>
              {formatCurrency(borrowed.totalRepaid, currency)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Records</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {borrowed.count - borrowed.settledCount} pending
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fully Settled</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {borrowed.settledCount} records
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenBorrowedModal}
          className="btn btn-give"
          style={{ width: '100%', padding: '0.75rem' }}
        >
          <Plus size={18} />
          Record Money You Borrowed (- You'll Give)
        </button>
      </div>
    </div>
  );
};
