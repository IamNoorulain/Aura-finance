
export type Currency = 'USD' | 'PKR';
export type Theme = 'dark' | 'light';

export interface AppSettings {
  currency: Currency;
  theme: Theme;
  usdToPkrRate: number;
  geminiApiKey?: string;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum AssetType {
  CASH = 'CASH',
  INVESTMENT = 'INVESTMENT',
  REAL_ESTATE = 'REAL_ESTATE',
  CRYPTO = 'CRYPTO',
  VEHICLE = 'VEHICLE',
}

export enum LiabilityType {
  MORTGAGE = 'MORTGAGE',
  LOAN = 'LOAN',
  CREDIT_CARD = 'CREDIT_CARD',
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  description: string;
  tags: string[];
  isRecurring: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  currency: string;
  lastUpdated: string;
  interestRate?: number; // APY
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  balance: number;
  interestRate: number; // APR
  minimumPayment: number;
  dueDateStr: string; 
}

// Replaces simple BudgetGoal
export interface Budget {
  id: string;
  name: string;
  type: 'CATEGORY' | 'GLOBAL'; // Limit specific category or total spend
  category?: string;
  limit: number;
  period: 'MONTHLY' | 'YEARLY';
  alertThreshold: number; // e.g., 85%
  isActive: boolean;
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO Date
  notes?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Store as ISO string for easier JSON handling
}
