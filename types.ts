
export enum AccountType {
  ASSET = 'أصول',
  LIABILITY = 'التزامات',
  EQUITY = 'حقوق ملكية',
  INCOME = 'إيرادات',
  EXPENSE = 'مصروفات'
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  items: JournalItem[];
}

export interface JournalItem {
  accountId: string;
  debit: number;
  credit: number;
}

export interface FinancialInsight {
  title: string;
  content: string;
  type: 'warning' | 'success' | 'info';
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

export interface AppSettings {
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  currency: 'SAR' | 'EGP';
  companyName: string;
}
