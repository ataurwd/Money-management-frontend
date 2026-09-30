export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

export const formatCurrency = (amount: number, currencyCode: string = 'BDT'): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency.symbol} ${formattedNumber}`;
};
