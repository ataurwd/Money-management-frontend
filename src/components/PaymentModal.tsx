'use client';

import React, { useState } from 'react';
import { Transaction, Payment } from '../lib/api';
import { formatCurrency } from '../lib/currencies';
import {
  X,
  CheckCircle,
  PlusCircle,
  Trash2,
  Calendar,
  DollarSign,
  History,
  AlertCircle,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currency: string;
  onAddPayment: (id: string, payload: { amount: number; date?: string; note?: string }) => Promise<void>;
  onDeletePayment: (id: string, paymentId: string) => Promise<void>;
  onSettleInFull: (id: string, note?: string) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  transaction,
  currency,
  onAddPayment,
  onDeletePayment,
  onSettleInFull,
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const isLent = transaction.type === 'LENT';
  const remaining = transaction.remainingAmount;
  const isSettled = transaction.status === 'SETTLED' || remaining <= 0;

  const handlePartialPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmt > remaining) {
      setError(`Amount cannot exceed remaining balance of ${formatCurrency(remaining, currency)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddPayment(transaction._id, {
        amount: numAmt,
        date: date ? new Date(date).toISOString() : undefined,
        note: note.trim() || undefined,
      });
      setAmount('');
      setNote('');
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullSettlement = async () => {
    if (!window.confirm(`Mark entire remaining balance of ${formatCurrency(remaining, currency)} as settled?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSettleInFull(transaction._id, 'Full Settlement');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to settle in full');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePaymentEntry = async (paymentId: string) => {
    if (!window.confirm('Delete this installment payment record?')) return;
    try {
      setIsSubmitting(true);
      await onDeletePayment(transaction._id, paymentId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '1.75rem', maxWidth: '560px' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge ${isLent ? 'badge-get' : 'badge-give'}`}>
                {isLent ? "You'll Get" : "You'll Give"}
              </span>
              <span className={`badge badge-${transaction.status.toLowerCase()}`}>
                {transaction.status}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Settlement & Payments: {transaction.contactName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={20} />
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
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Original Total</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {formatCurrency(transaction.totalAmount, currency)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Due</div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: isSettled
                  ? 'var(--status-settled)'
                  : isLent
                  ? 'var(--get-primary)'
                  : 'var(--give-primary)',
              }}
            >
              {isSettled ? '0.00 (Settled)' : formatCurrency(remaining, currency)}
            </div>
          </div>
        </div>

        {/* 1-Click Settle In Full Action */}
        {!isSettled && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={handleFullSettlement}
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              <CheckCircle size={18} />
              1-Click Settle in Full ({formatCurrency(remaining, currency)})
            </button>
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.4rem',
              }}
            >
              Mark entire remaining balance as paid and complete
            </div>
          </div>
        )}

        {/* Partial Payment Form */}
        {!isSettled && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <PlusCircle size={16} color="var(--brand-primary)" />
              Record Partial Installment / Repayment
            </div>

            <form onSubmit={handlePartialPayment}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">PAYMENT AMOUNT *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    max={remaining}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PAYMENT DATE</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">NOTE (OPTIONAL)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Paid via bKash / Cash / Bank"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {isSubmitting ? 'Recording...' : '+ Add Payment Installment'}
              </button>
            </form>
          </div>
        )}

        {/* Payment History Timeline */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
            }}
          >
            <History size={16} />
            <span>PAYMENT INSTALLMENTS HISTORY ({transaction.payments.length})</span>
          </div>

          {transaction.payments.length === 0 ? (
            <div
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              No payment installments recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transaction.payments.map((p: Payment, index: number) => (
                <div
                  key={p._id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--get-primary)' }}>
                      + {formatCurrency(p.amount, currency)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(p.date).toLocaleDateString()}
                      {p.note && ` • ${p.note}`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePaymentEntry(p._id)}
                    className="btn btn-ghost"
                    style={{ padding: '0.35rem', color: 'var(--give-primary)' }}
                    title="Undo / Delete this payment entry"
                    disabled={isSubmitting}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
