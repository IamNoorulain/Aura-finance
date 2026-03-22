
import { Asset, Liability, Transaction, TransactionType, Budget } from '../types';

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (currency === 'PKR') {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateNetWorth = (assets: Asset[], liabilities: Liability[]): number => {
  const totalAssets = assets.reduce((sum, item) => sum + item.value, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.balance, 0);
  return totalAssets - totalLiabilities;
};

export const calculateMonthlyCashFlow = (transactions: Transaction[]) => {
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7); 
  
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthStr));
  
  const income = currentMonthTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = currentMonthTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expenses, net: income - expenses };
};

export const getSpendingByCategory = (transactions: Transaction[]) => {
  const categoryMap: Record<string, number> = {};
  
  transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += t.amount;
    });

  return Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const getMonthlyTrendData = (transactions: Transaction[]) => {
  const monthMap: Record<string, { income: number; expenses: number; savings: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7); 
    monthMap[key] = { income: 0, expenses: 0, savings: 0 };
  }

  transactions.forEach(t => {
    const key = t.date.slice(0, 7);
    if (monthMap[key]) {
      if (t.type === TransactionType.INCOME) {
        monthMap[key].income += t.amount;
      } else if (t.type === TransactionType.EXPENSE) {
        monthMap[key].expenses += t.amount;
      }
    }
  });

  return Object.entries(monthMap).map(([date, data]) => ({
    name: new Date(date + '-01').toLocaleDateString('en-US', { month: 'short' }),
    income: data.income,
    expenses: data.expenses,
    savings: data.income - data.expenses
  }));
};

export const calculateBurnRate = (transactions: Transaction[]): number => {
    const trendData = getMonthlyTrendData(transactions);
    const recentMonths = trendData.slice(-3);
    const totalExpenses = recentMonths.reduce((sum, m) => sum + m.expenses, 0);
    return recentMonths.length ? totalExpenses / recentMonths.length : 0;
};

// New Helper for Budget Calculation
export const calculateBudgetUsage = (budget: Budget, transactions: Transaction[]) => {
    const now = new Date();
    let filtered = transactions.filter(t => t.type === TransactionType.EXPENSE);

    // Filter by Time Period
    if (budget.period === 'MONTHLY') {
        const currentMonth = now.toISOString().slice(0, 7);
        filtered = filtered.filter(t => t.date.startsWith(currentMonth));
    } else if (budget.period === 'YEARLY') {
        const currentYear = now.getFullYear().toString();
        filtered = filtered.filter(t => t.date.startsWith(currentYear));
    }

    // Filter by Category if needed
    if (budget.type === 'CATEGORY' && budget.category) {
        filtered = filtered.filter(t => t.category === budget.category);
    }

    const spent = filtered.reduce((sum, t) => sum + t.amount, 0);
    return {
        spent,
        remaining: budget.limit - spent,
        percentage: Math.min((spent / budget.limit) * 100, 100),
        isOverBudget: spent > budget.limit
    };
};
