'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '../lib/api';
import { X, ArrowDownLeft, ArrowUpRight, Calendar, User, Phone, Tag, FileText } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  initialType?: 'LENT' | 'BORROWED';
  existingTransaction?: Transaction | null;
  knownContacts?: string[];
  currencySymbol: string;
}

const CATEGORIES = [
  'General',
  'Personal Loan',
  'Friend & Family',
  'Business',
  'Food & Dining',
  'Emergency',
  'Shopping',
  'Rent & Bills',
  'Travel',
  'Other',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialType = 'LENT',
  existingTransaction = null,
  knownContacts = [],
  currencySymbol,
}) => {
  const [type, setType] = useState<'LENT' | 'BORROWED'>(initialType);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [initialPayment, setInitialPayment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingTransaction) {
      setType(existingTransaction.type);
      setContactName(existingTransaction.contactName);
      setContactPhone(existingTransaction.contactPhone || '');
      setTotalAmount(existingTransaction.totalAmount.toString());
      setCategory(existingTransaction.category || 'General');
      setDueDate(
        existingTransaction.dueDate
          ? new Date(existingTransaction.dueDate).toISOString().split('T')[0]
          : ''
      );
      setNotes(existingTransaction.notes || '');
      setInitialPayment('');
    } else {
      setType(initialType);
      setContactName('');
      setContactPhone('');
      setTotalAmount('');
      setCategory('General');
      setDueDate('');
      setNotes('');
      setInitialPayment('');
    }
    setError(null);
  }, [existingTransaction, initialType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contactName.trim()) {
      setError('Please enter the person or contact name');
      return;
    }

    const amt = parseFloat(totalAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        type,
        totalAmount: amt,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        notes: notes.trim(),
        initialPayment: initialPayment ? parseFloat(initialPayment) : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPresetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '1.75rem' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: type === 'LENT' ? 'var(--get-bg)' : 'var(--give-bg)',
                color: type === 'LENT' ? 'var(--get-primary)' : 'var(--give-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {type === 'LENT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {existingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
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

        <form onSubmit={handleSubmit}>
          {/* Type Switcher */}
          {!existingTransaction && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="form-label" style={{ marginBottom: '0.4rem' }}>
                TRANSACTION TYPE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setType('LENT')}
                  className="btn"
                  style={{
                    background: type === 'LENT' ? 'var(--get-bg)' : 'var(--bg-input)',
                    border: `2px solid ${
                      type === 'LENT' ? 'var(--get-primary)' : 'var(--border-subtle)'
                    }`,
                    color: type === 'LENT' ? 'var(--get-primary)' : 'var(--text-secondary)',
                    padding: '0.75rem',
                  }}
                >
                  <ArrowDownLeft size={16} />
                  You'll Get (Lent)
                </button>

                <button
                  type="button"
                  onClick={() => setType('BORROWED')}
                  className="btn"
                  style={{
                    background: type === 'BORROWED' ? 'var(--give-bg)' : 'var(--bg-input)',
                    border: `2px solid ${
                      type === 'BORROWED' ? 'var(--give-primary)' : 'var(--border-subtle)'
                    }`,
                    color: type === 'BORROWED' ? 'var(--give-primary)' : 'var(--text-secondary)',
                    padding: '0.75rem',
                  }}
                >
                  <ArrowUpRight size={16} />
                  You'll Give (Borrowed)
                </button>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">
              <span>TOTAL AMOUNT ({currencySymbol}) *</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: type === 'LENT' ? 'var(--get-primary)' : 'var(--give-primary)',
                }}
              >
                {currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="form-input"
                style={{
                  paddingLeft: '2.5rem',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              />
            </div>
          </div>

          {/* Contact Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">
                <span>PERSON / CONTACT NAME *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  list="known-contacts-list"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. John Doe, Rafiq"
                  className="form-input"
                />
                <datalist id="known-contacts-list">
                  {knownContacts.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PHONE / CONTACT INFO</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+8801... or note"
                className="form-input"
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Presets */}
          <div className="form-group">
            <div className="form-label">
              <span>EXPECTED DUE DATE</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setPresetDate(7)}
                  className="btn btn-ghost"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem' }}
                >
                  +7d
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(15)}
                  className="btn btn-ghost"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem' }}
                >
                  +15d
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(30)}
                  className="btn btn-ghost"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem' }}
                >
                  +1m
                </button>
              </div>
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Initial Payment (if creating new) */}
          {!existingTransaction && (
            <div className="form-group">
              <label className="form-label">
                <span>INITIAL PARTIAL PAYMENT (OPTIONAL)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  If partly paid right away
                </span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={initialPayment}
                onChange={(e) => setInitialPayment(e.target.value)}
                placeholder="0.00"
                className="form-input"
              />
            </div>
          )}

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">MEMO / DESCRIPTION</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Loan for laptop purchase, to return after salary"
              className="form-textarea"
            />
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${type === 'LENT' ? 'btn-get' : 'btn-give'}`}
              disabled={isSubmitting}
              style={{ minWidth: '130px' }}
            >
              {isSubmitting
                ? 'Saving...'
                : existingTransaction
                ? 'Save Changes'
                : type === 'LENT'
                ? '+ Record Lent'
                : '- Record Borrowed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
