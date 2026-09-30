import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LendFlow - Personal Debt & Lending Ledger',
  description: 'Smart and simple money tracker: Track who owes you (Receivable) and who you owe (Payable) with real-time balance and payment settlement.',
  keywords: ['debt tracker', 'money lending ledger', 'who owes me', 'loan manager', 'personal finance'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
