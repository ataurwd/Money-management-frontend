import { Transaction } from './api';

export const exportTransactionsToCsv = (transactions: Transaction[], currency: string) => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }

  const headers = [
    'Date Recorded',
    'Contact Name',
    'Phone',
    'Type',
    `Total Amount (${currency})`,
    `Remaining Balance (${currency})`,
    'Status',
    'Category',
    'Due Date',
    'Installments Paid Count',
    'Notes',
  ];

  const rows = transactions.map((t) => {
    const isLent = t.type === 'LENT';
    const typeLabel = isLent ? "You'll Get (Lent)" : "You'll Give (Borrowed)";
    const dueDateStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A';
    const createdStr = new Date(t.createdAt).toLocaleDateString();

    return [
      `"${createdStr}"`,
      `"${t.contactName.replace(/"/g, '""')}"`,
      `"${(t.contactPhone || '').replace(/"/g, '""')}"`,
      `"${typeLabel}"`,
      t.totalAmount,
      t.remainingAmount,
      `"${t.status}"`,
      `"${t.category || 'General'}"`,
      `"${dueDateStr}"`,
      t.payments?.length || 0,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `lendflow_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
