'use client';

import React, { useState } from 'react';
import { ContactSummary } from '../lib/api';
import { formatCurrency } from '../lib/currencies';
import {
  Users,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  Calendar,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface ContactsLedgerProps {
  contacts: ContactSummary[];
  currency: string;
  onSelectContact: (contactName: string) => void;
}

export const ContactsLedger: React.FC<ContactsLedgerProps> = ({
  contacts,
  currency,
  onSelectContact,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'OWES_YOU' | 'YOU_OWE' | 'SETTLED'>('ALL');

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'OWES_YOU') return c.netBalance > 0;
    if (filterType === 'YOU_OWE') return c.netBalance < 0;
    if (filterType === 'SETTLED') return c.netBalance === 0;
    return true;
  });

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Search and Filter */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search person or phone..."
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div className="tabs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`tab-btn ${filterType === 'ALL' ? 'active' : ''}`}
          >
            All ({contacts.length})
          </button>
          <button
            onClick={() => setFilterType('OWES_YOU')}
            className={`tab-btn ${filterType === 'OWES_YOU' ? 'active' : ''}`}
          >
            Owes You
          </button>
          <button
            onClick={() => setFilterType('YOU_OWE')}
            className={`tab-btn ${filterType === 'YOU_OWE' ? 'active' : ''}`}
          >
            You Owe
          </button>
          <button
            onClick={() => setFilterType('SETTLED')}
            className={`tab-btn ${filterType === 'SETTLED' ? 'active' : ''}`}
          >
            Settled
          </button>
        </div>
      </div>

      {/* Grid of Contacts */}
      {filteredContacts.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <Users size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <h3>No contacts found</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Contacts are automatically indexed when you record a lent or borrowed transaction.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredContacts.map((contact, idx) => {
            const owesYou = contact.netBalance > 0;
            const youOwe = contact.netBalance < 0;
            const isSettled = contact.netBalance === 0;

            return (
              <div
                key={contact.name + idx}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${
                    owesYou
                      ? 'var(--get-primary)'
                      : youOwe
                      ? 'var(--give-primary)'
                      : 'var(--status-settled)'
                  }`,
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{contact.name}</h4>
                      {contact.phone && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.2rem',
                          }}
                        >
                          <Phone size={12} /> {contact.phone}
                        </div>
                      )}
                    </div>

                    <span
                      className={`badge ${
                        owesYou ? 'badge-get' : youOwe ? 'badge-give' : 'badge-settled'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {contact.statusLabel}
                    </span>
                  </div>

                  {/* Net Balance Details */}
                  <div
                    style={{
                      margin: '1rem 0',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Net Standing with {contact.name}:
                    </div>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: owesYou
                          ? 'var(--get-primary)'
                          : youOwe
                          ? 'var(--give-primary)'
                          : 'var(--status-settled)',
                      }}
                    >
                      {owesYou && '+ '}
                      {formatCurrency(contact.netBalance, currency)}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.2rem',
                      }}
                    >
                      {owesYou
                        ? `${contact.name} owes you`
                        : youOwe
                        ? `You owe ${contact.name}`
                        : 'All balances cleared'}
                    </div>
                  </div>

                  {/* Sub totals */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      Lent to them: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(contact.totalLent, currency)}</strong>
                    </div>
                    <div>
                      Borrowed: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(contact.totalBorrowed, currency)}</strong>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {contact.transactionCount} transaction{contact.transactionCount > 1 ? 's' : ''}
                  </span>

                  <button
                    onClick={() => onSelectContact(contact.name)}
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    <ExternalLink size={14} />
                    View Timeline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
