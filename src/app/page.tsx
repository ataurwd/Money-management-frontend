'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, User, Transaction, DashboardSummary, ContactSummary } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { HeroBalance } from '../components/HeroBalance';
import { PillarsView } from '../components/PillarsView';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionModal } from '../components/TransactionModal';
import { PaymentModal } from '../components/PaymentModal';
import { ContactsLedger } from '../components/ContactsLedger';
import { AuthModal } from '../components/AuthModal';
import { exportTransactionsToCsv } from '../lib/exportCsv';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Download,
  Users,
  ListFilter,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export default function HomePage() {
  // App state
  const [user, setUser] = useState<User | null>(null);
  const [currency, setCurrency] = useState<string>('BDT');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Data state
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<ContactSummary[]>([]);

  // Navigation & Filtering
  const [currentView, setCurrentView] = useState<'LEDGER' | 'CONTACTS'>('LEDGER');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LENT' | 'BORROWED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PARTIAL' | 'SETTLED'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [txModalType, setTxModalType] = useState<'LENT' | 'BORROWED'>('LENT');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [activePaymentTx, setActivePaymentTx] = useState<Transaction | null>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            setCurrency(res.user.currency || 'BDT');
          } else {
            setIsAuthOpen(true);
          }
        } else {
          setIsAuthOpen(true);
        }
      } catch (err) {
        console.warn('Session verification failed:', err);
        setIsAuthOpen(true);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fetch all core data
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsRefreshing(true);
      const [dashRes, txRes, contactsRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getTransactions({
          type: typeFilter === 'ALL' ? undefined : typeFilter,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: search.trim() || undefined,
          sortBy,
          order,
        }),
        api.getContactsSummary(),
      ]);

      setDashboardData(dashRes.data);
      setTransactions(txRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (err: any) {
      console.error('Failed to load ledger data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, typeFilter, statusFilter, search, sortBy, order]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Auth Handlers
  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser);
    setCurrency(authUser.currency || 'BDT');
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    api.removeToken();
    setUser(null);
    setDashboardData(null);
    setTransactions([]);
    setContacts([]);
    setIsAuthOpen(true);
  };

  const handleCurrencyChange = async (newCurr: string) => {
    setCurrency(newCurr);
    try {
      if (user) {
        await api.updateProfile({ currency: newCurr });
        setUser({ ...user, currency: newCurr });
      }
    } catch (e) {
      console.error('Failed to update currency profile', e);
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Transaction Modal Openers
  const openNewLentModal = () => {
    setTxModalType('LENT');
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const openNewBorrowedModal = () => {
    setTxModalType('BORROWED');
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxModalType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleOpenPayment = (tx: Transaction) => {
    setActivePaymentTx(tx);
    setIsPaymentModalOpen(true);
  };

  // Transaction Actions
  const handleSaveTransaction = async (payload: any) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction._id, payload);
    } else {
      await api.createTransaction(payload);
    }
    await fetchData();
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this debt record?')) {
      return;
    }
    await api.deleteTransaction(id);
    await fetchData();
  };

  // Payment Actions
  const handleAddPayment = async (id: string, payload: { amount: number; date?: string; note?: string }) => {
    const res = await api.addPayment(id, payload);
    setActivePaymentTx(res.data);
    await fetchData();
  };

  const handleDeletePayment = async (id: string, paymentId: string) => {
    const res = await api.deletePayment(id, paymentId);
    setActivePaymentTx(res.data);
    await fetchData();
  };

  const handleSettleInFull = async (id: string, note?: string) => {
    await api.settleInFull(id, note);
    await fetchData();
  };

  // Quick Seed Sample Data for Demo
  const handleLoadSampleData = async () => {
    if (!user) return;
    try {
      setIsRefreshing(true);
      await api.createTransaction({
        contactName: 'Tanvir Hossain',
        contactPhone: '+8801712345678',
        type: 'LENT',
        totalAmount: 15000,
        category: 'Personal Loan',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        notes: 'Loan for project equipment purchase',
      });

      await api.createTransaction({
        contactName: 'Rahim Khan',
        contactPhone: '+8801811223344',
        type: 'LENT',
        totalAmount: 5000,
        initialPayment: 2000,
        category: 'Friend & Family',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        notes: 'Emergency medical loan (2000 already returned)',
      });

      await api.createTransaction({
        contactName: 'Sumon Ahmed',
        contactPhone: '+8801999887766',
        type: 'BORROWED',
        totalAmount: 7500,
        category: 'Business',
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        notes: 'Borrowed for office supply restocking',
      });

      await api.createTransaction({
        contactName: 'Kamal Mia',
        contactPhone: '+8801555667788',
        type: 'BORROWED',
        totalAmount: 3000,
        category: 'Rent & Bills',
        dueDate: new Date(Date.now() - 2 * 86400000).toISOString(), // Overdue
        notes: 'Shared apartment electricity and internet bill',
      });

      await fetchData();
    } catch (err: any) {
      alert('Error loading sample records: ' + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Contact Selection Handler
  const handleSelectContactFromLedger = (contactName: string) => {
    setSearch(contactName);
    setCurrentView('LEDGER');
  };

  // Known contacts for auto-complete
  const knownContactNames = contacts.map((c) => c.name);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        user={user}
        currentCurrency={currency}
        onCurrencyChange={handleCurrencyChange}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      <main className="container" style={{ flex: 1, paddingBottom: '4rem' }}>
        {/* Hero Section */}
        {dashboardData && (
          <HeroBalance
            data={dashboardData}
            currency={currency}
            onOpenLentModal={openNewLentModal}
            onOpenBorrowedModal={openNewBorrowedModal}
            onFilterOverdue={() => {
              setCurrentView('LEDGER');
              setStatusFilter('PENDING');
            }}
          />
        )}

        {/* Two Core Pillars: "You'll Get" (Ami Taka Pai) vs "You'll Give" (Amr Kache Taka Pai) */}
        {dashboardData && (
          <PillarsView
            data={dashboardData}
            currency={currency}
            onOpenLentModal={openNewLentModal}
            onOpenBorrowedModal={openNewBorrowedModal}
            onSelectTab={(type) => {
              setCurrentView('LEDGER');
              setTypeFilter(type);
            }}
          />
        )}

        {/* Navigation Tabs (Transactions Ledger vs People Directory) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div className="tabs">
            <button
              onClick={() => setCurrentView('LEDGER')}
              className={`tab-btn ${currentView === 'LEDGER' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ListFilter size={16} />
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setCurrentView('CONTACTS')}
              className={`tab-btn ${currentView === 'CONTACTS' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Users size={16} />
              People Directory ({contacts.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => exportTransactionsToCsv(transactions, currency)}
              className="btn btn-secondary"
              title="Download CSV report"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* VIEW 1: TRANSACTIONS LEDGER */}
        {currentView === 'LEDGER' && (
          <>
            {/* Filter Bar */}
            <div className="glass-card filter-bar">
              {/* Type filter */}
              <div className="tabs">
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`tab-btn ${typeFilter === 'ALL' ? 'active' : ''}`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setTypeFilter('LENT')}
                  className={`tab-btn ${typeFilter === 'LENT' ? 'active' : ''}`}
                  style={{ color: typeFilter === 'LENT' ? 'var(--get-primary)' : 'inherit' }}
                >
                  🟢 You'll Get
                </button>
                <button
                  onClick={() => setTypeFilter('BORROWED')}
                  className={`tab-btn ${typeFilter === 'BORROWED' ? 'active' : ''}`}
                  style={{ color: typeFilter === 'BORROWED' ? 'var(--give-primary)' : 'inherit' }}
                >
                  🔴 You'll Give
                </button>
              </div>

              {/* Status filter */}
              <div className="tabs">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('PARTIAL')}
                  className={`tab-btn ${statusFilter === 'PARTIAL' ? 'active' : ''}`}
                >
                  Partial
                </button>
                <button
                  onClick={() => setStatusFilter('SETTLED')}
                  className={`tab-btn ${statusFilter === 'SETTLED' ? 'active' : ''}`}
                >
                  Settled
                </button>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
                <Search
                  size={15}
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
                  placeholder="Search contact, notes..."
                  className="form-input"
                  style={{ paddingLeft: '2.3rem', paddingRight: '0.85rem' }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Sorting */}
              <select
                value={`${sortBy}-${order}`}
                onChange={(e) => {
                  const [sb, ord] = e.target.value.split('-');
                  setSortBy(sb);
                  setOrder(ord as 'asc' | 'desc');
                }}
                className="form-select"
                style={{ width: 'auto', fontSize: '0.825rem' }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="remainingAmount-desc">Highest Balance Due</option>
                <option value="dueDate-asc">Due Date (Earliest)</option>
              </select>
            </div>

            {/* Transactions List */}
            {transactions.length === 0 ? (
              <div
                className="glass-card"
                style={{
                  padding: '3.5rem 1.5rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <FolderOpen size={48} style={{ opacity: 0.35, marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  No transaction records found
                </h3>
                <p style={{ fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  Start by recording money you lent to someone, money you borrowed, or populate with sample
                  records to test.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.85rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <button onClick={openNewLentModal} className="btn btn-get">
                    <ArrowDownLeft size={16} />
                    + Record Lent Money
                  </button>
                  <button onClick={openNewBorrowedModal} className="btn btn-give">
                    <ArrowUpRight size={16} />
                    - Record Borrowed Money
                  </button>
                  <button onClick={handleLoadSampleData} className="btn btn-secondary">
                    <Sparkles size={16} color="#f59e0b" />
                    Load Sample Records
                  </button>
                </div>
              </div>
            ) : (
              <div className="transaction-list">
                {transactions.map((t) => (
                  <TransactionCard
                    key={t._id}
                    transaction={t}
                    currency={currency}
                    onOpenPaymentModal={handleOpenPayment}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* VIEW 2: CONTACTS LEDGER */}
        {currentView === 'CONTACTS' && (
          <ContactsLedger
            contacts={contacts}
            currency={currency}
            onSelectContact={handleSelectContactFromLedger}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.5rem 0',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div className="container">
          LendFlow • Personal Debt & Lending Ledger System • Connected to MongoDB Atlas
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onSuccess={handleAuthSuccess} />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        initialType={txModalType}
        existingTransaction={editingTransaction}
        knownContacts={knownContactNames}
        currencySymbol={currency}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setActivePaymentTx(null);
        }}
        transaction={activePaymentTx}
        currency={currency}
        onAddPayment={handleAddPayment}
        onDeletePayment={handleDeletePayment}
        onSettleInFull={handleSettleInFull}
      />

      {/* Mobile Quick Add Chooser Sheet */}
      {isQuickAddOpen && (
        <div className="modal-overlay" onClick={() => setIsQuickAddOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '1.5rem', textAlign: 'center' }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Record Transaction
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Choose whether you gave or received money
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setIsQuickAddOpen(false);
                  openNewLentModal();
                }}
                className="btn btn-get"
                style={{ padding: '0.9rem', fontSize: '0.95rem' }}
              >
                <ArrowDownLeft size={20} />
                + I Lent Money (You'll Get)
              </button>

              <button
                onClick={() => {
                  setIsQuickAddOpen(false);
                  openNewBorrowedModal();
                }}
                className="btn btn-give"
                style={{ padding: '0.9rem', fontSize: '0.95rem' }}
              >
                <ArrowUpRight size={20} />
                - I Borrowed Money (You'll Give)
              </button>

              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem', marginTop: '0.5rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          onClick={() => setCurrentView('LEDGER')}
          className={`mobile-nav-item ${currentView === 'LEDGER' ? 'active' : ''}`}
        >
          <ListFilter size={20} />
          <span>Ledger</span>
        </button>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="mobile-nav-add-btn"
          title="Quick Record Transaction"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => setCurrentView('CONTACTS')}
          className={`mobile-nav-item ${currentView === 'CONTACTS' ? 'active' : ''}`}
        >
          <Users size={20} />
          <span>People</span>
        </button>

        <button
          onClick={() => exportTransactionsToCsv(transactions, currency)}
          className="mobile-nav-item"
        >
          <Download size={20} />
          <span>Export</span>
        </button>
      </nav>
    </div>
  );
}

