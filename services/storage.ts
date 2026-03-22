
import { Transaction, Asset, Liability, Budget, SavingsGoal, AppSettings, ChatMessage } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'aura_transactions',
  ASSETS: 'aura_assets',
  LIABILITIES: 'aura_liabilities',
  BUDGETS: 'aura_budgets_v2', // Versioned to avoid conflict with old format
  GOALS: 'aura_savings_goals',
  SETTINGS: 'aura_settings',
  CHAT_HISTORY: 'aura_chat_history',
};

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  theme: 'dark',
  usdToPkrRate: 278.72,
  geminiApiKey: localStorage.getItem('aura_gemini_api_key') || undefined,
};

const get = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

const save = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
};

export const StorageService = {
  getTransactions: (): Transaction[] => get(STORAGE_KEYS.TRANSACTIONS, []),
  saveTransactions: (data: Transaction[]) => save(STORAGE_KEYS.TRANSACTIONS, data),

  getAssets: (): Asset[] => get(STORAGE_KEYS.ASSETS, []),
  saveAssets: (data: Asset[]) => save(STORAGE_KEYS.ASSETS, data),

  getLiabilities: (): Liability[] => get(STORAGE_KEYS.LIABILITIES, []),
  saveLiabilities: (data: Liability[]) => save(STORAGE_KEYS.LIABILITIES, data),

  // Updated Budgeting Methods
  getBudgets: (): Budget[] => get(STORAGE_KEYS.BUDGETS, []),
  saveBudgets: (data: Budget[]) => save(STORAGE_KEYS.BUDGETS, data),

  getSavingsGoals: (): SavingsGoal[] => get(STORAGE_KEYS.GOALS, []),
  saveSavingsGoals: (data: SavingsGoal[]) => save(STORAGE_KEYS.GOALS, data),

  getSettings: (): AppSettings => get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (data: AppSettings) => save(STORAGE_KEYS.SETTINGS, data),

  getChatHistory: (): ChatMessage[] => get(STORAGE_KEYS.CHAT_HISTORY, []),
  saveChatHistory: (data: ChatMessage[]) => save(STORAGE_KEYS.CHAT_HISTORY, data),

  clearAll: () => {
    localStorage.clear();
  }
};
