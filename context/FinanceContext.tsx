
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Asset, Liability, Budget, SavingsGoal, AppSettings, ChatMessage } from '../types';
import { StorageService } from '../services/storage';

interface FinanceContextType {
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  settings: AppSettings;
  chatHistory: ChatMessage[];
  loading: boolean;
  
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAsset: (a: Asset) => void;
  updateAsset: (a: Asset) => void;
  deleteAsset: (id: string) => void;
  addLiability: (l: Liability) => void;
  updateLiability: (l: Liability) => void;
  deleteLiability: (id: string) => void;
  
  addBudget: (b: Budget) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (g: SavingsGoal) => void;
  updateSavingsGoal: (g: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  
  updateSettings: (s: Partial<AppSettings>) => void;
  setChatHistory: (history: ChatMessage[]) => void;
  clearChatHistory: () => void;
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [chatHistory, setChatHistoryState] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    StorageService.saveSettings(settings);
  }, [settings.theme]);

  const loadData = () => {
    try {
      setTransactions(StorageService.getTransactions());
      setAssets(StorageService.getAssets());
      setLiabilities(StorageService.getLiabilities());
      setBudgets(StorageService.getBudgets());
      setSavingsGoals(StorageService.getSavingsGoals());
      setChatHistoryState(StorageService.getChatHistory());
      setSettings(StorageService.getSettings());
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (t: Transaction) => {
    const updated = [t, ...transactions];
    setTransactions(updated);
    StorageService.saveTransactions(updated);
  };
  const updateTransaction = (t: Transaction) => {
    const updated = transactions.map(existing => existing.id === t.id ? t : existing);
    setTransactions(updated);
    StorageService.saveTransactions(updated);
  };
  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    StorageService.saveTransactions(updated);
  };

  const addAsset = (a: Asset) => {
    const updated = [...assets, a];
    setAssets(updated);
    StorageService.saveAssets(updated);
  };
  const updateAsset = (a: Asset) => {
    const updated = assets.map(existing => existing.id === a.id ? a : existing);
    setAssets(updated);
    StorageService.saveAssets(updated);
  };
  const deleteAsset = (id: string) => {
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    StorageService.saveAssets(updated);
  };

  const addLiability = (l: Liability) => {
    const updated = [...liabilities, l];
    setLiabilities(updated);
    StorageService.saveLiabilities(updated);
  };
  const updateLiability = (l: Liability) => {
    const updated = liabilities.map(existing => existing.id === l.id ? l : existing);
    setLiabilities(updated);
    StorageService.saveLiabilities(updated);
  };
  const deleteLiability = (id: string) => {
    const updated = liabilities.filter(l => l.id !== id);
    setLiabilities(updated);
    StorageService.saveLiabilities(updated);
  };

  const addBudget = (b: Budget) => {
    const updated = [...budgets, b];
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };
  const updateBudget = (b: Budget) => {
    const updated = budgets.map(existing => existing.id === b.id ? b : existing);
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };
  const deleteBudget = (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };

  const addSavingsGoal = (g: SavingsGoal) => {
    const updated = [...savingsGoals, g];
    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(updated);
  };
  const updateSavingsGoal = (g: SavingsGoal) => {
    const updated = savingsGoals.map(existing => existing.id === g.id ? g : existing);
    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(updated);
  };
  const deleteSavingsGoal = (id: string) => {
    const updated = savingsGoals.filter(g => g.id !== id);
    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(updated);
  };

  const setChatHistory = (history: ChatMessage[]) => {
    setChatHistoryState(history);
    StorageService.saveChatHistory(history);
  };

  const clearChatHistory = () => {
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "I am Aura, your personal financial strategist. I have access to your live ledger, asset portfolio, and liability structure. How can I assist you in optimizing your wealth today?",
      timestamp: new Date().toISOString()
    };
    setChatHistory([welcome]);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const oldCurrency = settings.currency;
    const newCurrency = newSettings.currency;
    const rate = newSettings.usdToPkrRate || settings.usdToPkrRate;

    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);

    // If currency changed, convert all values
    if (newCurrency && newCurrency !== oldCurrency) {
      const conversionFactor = newCurrency === 'PKR' ? rate : 1 / rate;

      const convertValue = (val: number) => Math.round(val * conversionFactor * 100) / 100;

      const updatedTransactions = transactions.map(t => ({ ...t, amount: convertValue(t.amount) }));
      const updatedAssets = assets.map(a => ({ ...a, value: convertValue(a.value) }));
      const updatedLiabilities = liabilities.map(l => ({ ...l, balance: convertValue(l.balance), minimumPayment: convertValue(l.minimumPayment) }));
      const updatedBudgets = budgets.map(b => ({ ...b, limit: convertValue(b.limit) }));
      const updatedSavingsGoals = savingsGoals.map(g => ({ ...g, targetAmount: convertValue(g.targetAmount), currentAmount: convertValue(g.currentAmount) }));

      setTransactions(updatedTransactions);
      setAssets(updatedAssets);
      setLiabilities(updatedLiabilities);
      setBudgets(updatedBudgets);
      setSavingsGoals(updatedSavingsGoals);

      StorageService.saveTransactions(updatedTransactions);
      StorageService.saveAssets(updatedAssets);
      StorageService.saveLiabilities(updatedLiabilities);
      StorageService.saveBudgets(updatedBudgets);
      StorageService.saveSavingsGoals(updatedSavingsGoals);
    }
  };

  const clearAllData = () => {
    StorageService.clearAll();
    setTransactions([]);
    setAssets([]);
    setLiabilities([]);
    setBudgets([]);
    setSavingsGoals([]);
    clearChatHistory();
    const defaultSettings: AppSettings = { currency: 'USD', theme: 'dark', usdToPkrRate: 278.72, geminiApiKey: undefined };
    setSettings(defaultSettings);
    StorageService.saveSettings(defaultSettings);
  };

  return (
    <FinanceContext.Provider value={{
      transactions, assets, liabilities, budgets, savingsGoals, settings, chatHistory, loading,
      addTransaction, updateTransaction, deleteTransaction,
      addAsset, updateAsset, deleteAsset,
      addLiability, updateLiability, deleteLiability,
      addBudget, updateBudget, deleteBudget,
      addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      updateSettings, setChatHistory, clearChatHistory, clearAllData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
