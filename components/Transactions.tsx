import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/financeEngine';
import { TransactionType, Transaction } from '../types';
import { Search, Filter, Download, Plus, Trash2 } from 'lucide-react';

export const Transactions = () => {
  const { transactions, settings, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: '',
    description: '',
  });

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    const transactionData: Transaction = {
        id: editingTransaction ? editingTransaction.id : Date.now().toString(),
        date: formData.date!,
        amount: Number(formData.amount),
        type: formData.type!,
        category: formData.category || 'Uncategorized',
        description: formData.description!,
        subcategory: formData.subcategory || '',
        tags: formData.tags || [],
        isRecurring: formData.isRecurring || false
    };

    if (editingTransaction) {
        updateTransaction(transactionData);
    } else {
        addTransaction(transactionData);
    }

    setIsFormOpen(false);
    setEditingTransaction(null);
    setFormData({type: TransactionType.EXPENSE, date: new Date().toISOString().split('T')[0], amount: 0, category: '', description: ''});
  };

  const openEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setFormData({
        type: t.type,
        date: t.date,
        amount: t.amount,
        category: t.category,
        description: t.description,
        subcategory: t.subcategory,
        isRecurring: t.isRecurring
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Full Ledger History</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
             <button onClick={() => { setEditingTransaction(null); setFormData({type: TransactionType.EXPENSE, date: new Date().toISOString().split('T')[0], amount: 0, category: '', description: ''}); setIsFormOpen(!isFormOpen); }} className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors shadow-lg shadow-emerald-500/20">
                <Plus size={16} /> Add New
            </button>
            <button className="flex-1 md:flex-none bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors border border-slate-200 dark:border-slate-700">
                <Download size={16} /> Export CSV
            </button>
        </div>
      </header>

      {/* Inline Form */}
      {isFormOpen && (
        <div className="mb-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-xl animate-fade-in shadow-inner">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{editingTransaction ? 'Edit Entry' : 'New Entry'}</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                <div className="lg:col-span-1">
                    <label className="text-xs text-slate-500 block mb-1">Type</label>
                    <select 
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                    >
                        <option value={TransactionType.EXPENSE}>Expense</option>
                        <option value={TransactionType.INCOME}>Income</option>
                    </select>
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs text-slate-500 block mb-1">Date</label>
                    <input type="date" className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs text-slate-500 block mb-1">Description</label>
                    <input type="text" placeholder="Grocery, Salary, etc" className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs text-slate-500 block mb-1">Amount</label>
                    <input type="number" placeholder="0.00" className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs text-slate-500 block mb-1">Category</label>
                    <input type="text" placeholder="Food, Housing" className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="lg:col-span-6 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => { setIsFormOpen(false); setEditingTransaction(null); }} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">{editingTransaction ? 'Update Transaction' : 'Save Transaction'}</button>
                </div>
            </form>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
                type="text" 
                placeholder="Search transactions..." 
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <select 
                className="w-full md:w-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-8 py-2 rounded-lg focus:outline-none focus:border-emerald-500 appearance-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
            >
                <option value="ALL">All Types</option>
                <option value={TransactionType.EXPENSE}>Expenses</option>
                <option value={TransactionType.INCOME}>Income</option>
            </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-auto custom-scrollbar flex-1">
            {/* Desktop Table View */}
            <table className="hidden lg:table w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 z-10">
                    <tr>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Date</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Description</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Category</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-right">Amount</th>
                        <th className="p-4 w-20 border-b border-slate-200 dark:border-slate-800"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm">{t.date}</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">
                                {t.description}
                                {t.isRecurring && <span className="ml-2 px-1.5 py-0.5 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] rounded uppercase tracking-wide">Recurring</span>}
                            </td>
                            <td className="p-4">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full border border-slate-200 dark:border-slate-700">
                                    {t.category}
                                </span>
                            </td>
                            <td className={`p-4 text-right font-mono font-medium ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                                {t.type === TransactionType.INCOME ? '+' : ''}{formatCurrency(t.amount, settings.currency)}
                            </td>
                            <td className="p-4 text-center">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => openEdit(t)} className="text-slate-400 hover:text-emerald-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </button>
                                    <button onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile List View */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(t => (
                    <div key={t.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-mono">{t.date}</span>
                                <span className="text-slate-900 dark:text-white font-medium">{t.description}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`font-mono font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                                    {t.type === TransactionType.INCOME ? '+' : ''}{formatCurrency(t.amount, settings.currency)}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 mt-1 uppercase tracking-wider">
                                    {t.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            {t.isRecurring && <span className="px-1.5 py-0.5 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] rounded uppercase tracking-wide">Recurring</span>}
                            <div className="ml-auto flex items-center gap-3">
                                <button onClick={() => openEdit(t)} className="text-slate-400 hover:text-emerald-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                </button>
                                <button onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-rose-500 p-1">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    No transactions found matching your criteria.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
