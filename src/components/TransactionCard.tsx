'use client';

import React from 'react';
import { Transaction } from '../lib/api';
import { formatCurrency } from '../lib/currencies';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  DollarSign,
  Phone,
} from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  currency: string;
  onOpenPaymentModal: (t: Transaction) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  currency,
  onOpenPaymentModal,
  onEdit,
  onDelete,
}) => {
  const isLent = transaction.type === 'LENT';
  const isSettled = transaction.status === 'SETTLED' || transaction.remainingAmount <= 0;
  const isPartial = transaction.status === 'PARTIAL';

  const paidAmount = transaction.totalAmount - transaction.remainingAmount;
  const progressPercent = Math.min(
    100,
    Math.round((paidAmount / transaction.totalAmount) * 100)
  );

  // Check if overdue
  const now = new Date();
  const isOverdue =
    !isSettled &&
    transaction.dueDate &&
    new Date(transaction.dueDate) < now;

  return (
    <div
      className="glass-card transaction-card"
      style={{
        borderLeft: `4px solid ${isLent ? 'var(--get-primary)' : 'var(--give-primary)'}`,
      }}
    >
      {/* Left Column: Contact info, Type, Category */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: isLent ? 'var(--get-bg)' : 'var(--give-bg)',
            border: `1px solid ${isLent ? 'var(--get-border)' : 'var(--give-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLent ? 'var(--get-primary)' : 'var(--give-primary)',
            flexShrink: 0,
          }}
        >
          {isLent ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {transaction.contactName}
            </span>

            <span className={`badge ${isLent ? 'badge-get' : 'badge-give'}`} style={{ fontSize: '0.65rem' }}>
              {isLent ? "You'll Get" : "You'll Give"}
            </span>

            <span className={`badge badge-${transaction.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
              {transaction.status}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.2rem',
              flexWrap: 'wrap',
            }}
          >
            <span>{transaction.category || 'General'}</span>

            {transaction.contactPhone && (
              <>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Phone size={12} /> {transaction.contactPhone}
                </span>
              </>
            )}

            {transaction.dueDate && (
              <>
                <span>•</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: isOverdue ? '#ef4444' : 'inherit',
                    fontWeight: isOverdue ? 700 : 'normal',
                  }}
                >
                  <Calendar size={12} />
                  {new Date(transaction.dueDate).toLocaleDateString()}
                  {isOverdue && ' (Overdue)'}
                </span>
              </>
            )}
          </div>

          {transaction.notes && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginTop: '0.25rem',
                fontStyle: 'italic',
              }}
            >
              "{transaction.notes}"
            </div>
          )}
        </div>
      </div>

      {/* Middle Column: Progress and Balance */}
      <div className="tx-middle-column" style={{ minWidth: '180px', textAlign: 'right' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {isSettled ? 'Settled Total' : 'Remaining Due'}
        </div>

        <div
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: isSettled
              ? 'var(--status-settled)'
              : isLent
              ? 'var(--get-primary)'
              : 'var(--give-primary)',
          }}
        >
          {isSettled
            ? formatCurrency(transaction.totalAmount, currency)
            : formatCurrency(transaction.remainingAmount, currency)}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          Total: {formatCurrency(transaction.totalAmount, currency)}
          {paidAmount > 0 && !isSettled && ` (${progressPercent}% paid)`}
        </div>

        {/* Mini progress bar if partial */}
        {transaction.totalAmount > 0 && !isSettled && paidAmount > 0 && (
          <div
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: 'var(--border-subtle)',
              marginTop: '0.4rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: isLent ? 'var(--get-primary)' : 'var(--give-primary)',
              }}
            />
          </div>
        )}
      </div>

      {/* Right Column: Actions */}
      <div className="tx-actions-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onOpenPaymentModal(transaction)}
          className={`btn ${isSettled ? 'btn-secondary' : isLent ? 'btn-get' : 'btn-give'}`}
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
          title={isSettled ? 'View Payment History' : 'Record Settlement / Payment'}
        >
          <DollarSign size={15} />
          {isSettled ? 'History' : 'Settle / Pay'}
        </button>

        <button
          onClick={() => onEdit(transaction)}
          className="btn btn-ghost"
          style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}
          title="Edit Details"
        >
          <Edit2 size={16} />
        </button>

        <button
          onClick={() => onDelete(transaction._id)}
          className="btn btn-ghost"
          style={{ padding: '0.5rem', color: '#ef4444' }}
          title="Delete Transaction"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
