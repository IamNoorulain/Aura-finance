
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, calculateBudgetUsage } from '../services/financeEngine';
import { Budget, SavingsGoal } from '../types';
import { Plus, Trash2, Target, Wallet, Calendar, AlertCircle } from 'lucide-react';

export const Budgeting = () => {
  const { budgets, savingsGoals, transactions, settings, addBudget, updateBudget, deleteBudget, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const [activeTab, setActiveTab] = useState<'BUDGETS' | 'GOALS'>('BUDGETS');
  
  // Modals
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Forms
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({ 
    type: 'CATEGORY', 
    period: 'MONTHLY', 
    alertThreshold: 85,
    isActive: true 
  });
  
  const [newGoal, setNewGoal] = useState<Partial<SavingsGoal>>({ 
    status: 'IN_PROGRESS', 
    currentAmount: 0 
  });

  // Unique Categories for dropdown
  const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)));

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.name || !newBudget.limit) return;
    
    const budgetData = {
      id: editingBudget ? editingBudget.id : Date.now().toString(),
      name: newBudget.name,
      type: newBudget.type as any,
      category: newBudget.type === 'CATEGORY' ? newBudget.category : undefined,
      limit: Number(newBudget.limit),
      period: newBudget.period as any,
      alertThreshold: Number(newBudget.alertThreshold),
      isActive: true,
      color: editingBudget ? editingBudget.color : 'indigo'
    };

    if (editingBudget) {
      updateBudget(budgetData);
    } else {
      addBudget(budgetData);
    }
    
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
    setNewBudget({ type: 'CATEGORY', period: 'MONTHLY', alertThreshold: 85 });
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

    const goalData = {
        id: editingGoal ? editingGoal.id : Date.now().toString(),
        name: newGoal.name,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount || 0),
        deadline: newGoal.deadline,
        notes: newGoal.notes || '',
        status: editingGoal ? editingGoal.status : 'IN_PROGRESS'
    };

    if (editingGoal) {
      updateSavingsGoal(goalData);
    } else {
      addSavingsGoal(goalData);
    }

    setIsGoalModalOpen(false);
    setEditingGoal(null);
    setNewGoal({ currentAmount: 0, status: 'IN_PROGRESS' });
  };

  const openEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setNewBudget({
      name: budget.name,
      type: budget.type,
      category: budget.category,
      limit: budget.limit,
      period: budget.period,
      alertThreshold: budget.alertThreshold
    });
    setIsBudgetModalOpen(true);
  };

  const openEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      notes: goal.notes
    });
    setIsGoalModalOpen(true);
  };

  const calculateGoalProgress = (goal: SavingsGoal) => {
    const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const monthsLeft = Math.max((deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth()), 1);
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthlyNeeded = remaining > 0 ? remaining / monthsLeft : 0;
    
    return { percent, remaining, monthlyNeeded, monthsLeft };
  };

  return (
    <div className="p-4 md:p-8 space-y-8 h-full overflow-y-auto custom-scrollbar pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Planning & Strategy</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Control Spending & Build Wealth</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg w-full md:w-auto">
            <button 
                onClick={() => setActiveTab('BUDGETS')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'BUDGETS' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Spending Budgets
            </button>
            <button 
                onClick={() => setActiveTab('GOALS')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'GOALS' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Savings Goals
            </button>
        </div>
      </header>

      {/* Action Bar */}
      <div className="flex justify-end">
        {activeTab === 'BUDGETS' ? (
             <button onClick={() => { setEditingBudget(null); setNewBudget({ type: 'CATEGORY', period: 'MONTHLY', alertThreshold: 85 }); setIsBudgetModalOpen(true); }} className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20 transition-colors">
                <Wallet size={16} /> Create Budget
            </button>
        ) : (
            <button onClick={() => { setEditingGoal(null); setNewGoal({ currentAmount: 0, status: 'IN_PROGRESS' }); setIsGoalModalOpen(true); }} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20 transition-colors">
                <Target size={16} /> Set New Goal
            </button>
        )}
      </div>

      {/* --- CREATE/EDIT BUDGET MODAL --- */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{editingBudget ? 'Edit Spending Budget' : 'Create Spending Budget'}</h3>
                <form onSubmit={handleSaveBudget} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Budget Type</label>
                            <select className="input-std" value={newBudget.type} onChange={e => setNewBudget({...newBudget, type: e.target.value as any})}>
                                <option value="CATEGORY">Category Limit</option>
                                <option value="GLOBAL">Total Spending Limit</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Period</label>
                            <select className="input-std" value={newBudget.period} onChange={e => setNewBudget({...newBudget, period: e.target.value as any})}>
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="text-xs text-slate-500 block mb-1">Budget Name</label>
                            <input className="input-std" placeholder="e.g. Dining Out" value={newBudget.name || ''} onChange={e => setNewBudget({...newBudget, name: e.target.value})} required />
                        </div>
                        {newBudget.type === 'CATEGORY' && (
                            <div className="col-span-1">
                                <label className="text-xs text-slate-500 block mb-1">Select Category</label>
                                <select className="input-std" value={newBudget.category || ''} onChange={e => setNewBudget({...newBudget, category: e.target.value})}>
                                    <option value="">Select Category...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Limit Amount ({settings.currency})</label>
                            <input type="number" className="input-std" placeholder="500" value={newBudget.limit || ''} onChange={e => setNewBudget({...newBudget, limit: parseFloat(e.target.value)})} required />
                        </div>
                         <div>
                            <label className="text-xs text-slate-500 block mb-1">Alert Threshold (%)</label>
                            <input type="number" className="input-std" min="1" max="100" value={newBudget.alertThreshold} onChange={e => setNewBudget({...newBudget, alertThreshold: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={() => { setIsBudgetModalOpen(false); setEditingBudget(null); }} className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">{editingBudget ? 'Update Budget' : 'Create Budget'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- SET/EDIT GOAL MODAL --- */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{editingGoal ? 'Edit Financial Goal' : 'Set Financial Goal'}</h3>
                <form onSubmit={handleSaveGoal} className="space-y-6">
                    <div className="col-span-2">
                        <label className="text-xs text-slate-500 block mb-1">Goal Name</label>
                        <input className="input-std" placeholder="e.g. New Tesla Model 3" value={newGoal.name || ''} onChange={e => setNewGoal({...newGoal, name: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Target Amount ({settings.currency})</label>
                            <input type="number" className="input-std" placeholder="50000" value={newGoal.targetAmount || ''} onChange={e => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value)})} required />
                        </div>
                         <div>
                            <label className="text-xs text-slate-500 block mb-1">Already Saved (Optional)</label>
                            <input type="number" className="input-std" placeholder="0" value={newGoal.currentAmount || ''} onChange={e => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Target Deadline</label>
                            <input type="date" className="input-std" value={newGoal.deadline || ''} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} required />
                        </div>
                         <div className="md:row-span-2">
                             <label className="text-xs text-slate-500 block mb-1">Notes / Motivation</label>
                             <textarea className="input-std h-full min-h-[42px]" placeholder="Why do you want this?" value={newGoal.notes || ''} onChange={e => setNewGoal({...newGoal, notes: e.target.value})} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={() => { setIsGoalModalOpen(false); setEditingGoal(null); }} className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">{editingGoal ? 'Update Goal' : 'Set Goal'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- CONTENT AREA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'BUDGETS' && budgets.map(budget => {
            const usage = calculateBudgetUsage(budget, transactions);
            
            return (
                <div key={budget.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{budget.name}</h3>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">{budget.period} • {budget.type === 'CATEGORY' ? budget.category : 'Global'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditBudget(budget)} className="text-slate-400 hover:text-indigo-500 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button onClick={() => deleteBudget(budget.id)} className="text-slate-400 hover:text-rose-500 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between text-sm mb-2 mt-6">
                        <span className={usage.isOverBudget ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-300'}>{formatCurrency(usage.spent, settings.currency)}</span>
                        <span className="text-slate-400">of {formatCurrency(budget.limit, settings.currency)}</span>
                    </div>
                    
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                        <div 
                            className={`h-full rounded-full ${usage.isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${usage.percentage}%` }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 text-xs">
                        <span className={usage.isOverBudget ? 'text-rose-500 font-medium' : 'text-slate-500'}>
                            {usage.isOverBudget ? `Over by ${formatCurrency(usage.spent - budget.limit, settings.currency)}` : `${formatCurrency(usage.remaining, settings.currency)} left`}
                        </span>
                        <span className="text-slate-400">{usage.percentage.toFixed(0)}% used</span>
                    </div>
                </div>
            );
        })}

        {activeTab === 'GOALS' && savingsGoals.map(goal => {
            const stats = calculateGoalProgress(goal);
            return (
                <div key={goal.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <Target size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{goal.name}</h3>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(goal.deadline).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditGoal(goal)} className="text-slate-400 hover:text-emerald-500 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button onClick={() => deleteSavingsGoal(goal.id)} className="text-slate-400 hover:text-rose-500 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                         <div className="flex justify-between items-end mb-1">
                             <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(goal.currentAmount, settings.currency)}</span>
                             <span className="text-sm text-slate-400 mb-1">/ {formatCurrency(goal.targetAmount, settings.currency)}</span>
                         </div>
                    </div>

                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative mb-4">
                        <div 
                            className="h-full rounded-full bg-emerald-500" 
                            style={{ width: `${stats.percent}%` }}
                        ></div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-xs space-y-1 border border-slate-100 dark:border-slate-800">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Remaining</span>
                            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(stats.remaining, settings.currency)}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Monthly Need</span>
                            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(stats.monthlyNeeded, settings.currency)}/mo</span>
                         </div>
                    </div>
                </div>
            );
        })}

        {activeTab === 'BUDGETS' && budgets.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
                <Wallet className="mx-auto mb-3 opacity-50" size={48} />
                <p>No active budgets. Create a budget to track spending.</p>
                <button onClick={() => setIsBudgetModalOpen(true)} className="mt-4 text-indigo-500 hover:underline">Create First Budget</button>
            </div>
        )}

        {activeTab === 'GOALS' && savingsGoals.length === 0 && (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
                <Target className="mx-auto mb-3 opacity-50" size={48} />
                <p>No savings goals set. Define a target to start building wealth.</p>
                <button onClick={() => setIsGoalModalOpen(true)} className="mt-4 text-emerald-500 hover:underline">Set First Goal</button>
            </div>
        )}
      </div>
    </div>
  );
};
