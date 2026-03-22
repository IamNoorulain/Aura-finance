
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/financeEngine';
import { Liability, LiabilityType } from '../types';
import { CreditCard, Plus, Trash2, ShieldAlert } from 'lucide-react';

export const Liabilities = () => {
  const { liabilities, settings, addLiability, updateLiability, deleteLiability } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [newLiab, setNewLiab] = useState<Partial<Liability>>({ type: LiabilityType.CREDIT_CARD });

  const totalDebt = liabilities.reduce((acc, curr) => acc + curr.balance, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiab.name || !newLiab.balance) return;
    
    const liabilityData: Liability = {
      id: editingLiability ? editingLiability.id : Date.now().toString(),
      name: newLiab.name,
      type: newLiab.type || LiabilityType.CREDIT_CARD,
      balance: Number(newLiab.balance),
      interestRate: newLiab.interestRate ? Number(newLiab.interestRate) / 100 : 0,
      minimumPayment: Number(newLiab.minimumPayment || 0),
      dueDateStr: newLiab.dueDateStr || '1st'
    };

    if (editingLiability) {
      updateLiability(liabilityData);
    } else {
      addLiability(liabilityData);
    }

    setIsFormOpen(false);
    setEditingLiability(null);
    setNewLiab({ type: LiabilityType.CREDIT_CARD });
  };

  const openEdit = (liab: Liability) => {
    setEditingLiability(liab);
    setNewLiab({
      name: liab.name,
      type: liab.type,
      balance: liab.balance,
      interestRate: liab.interestRate * 100,
      minimumPayment: liab.minimumPayment,
      dueDateStr: liab.dueDateStr
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 h-full overflow-y-auto custom-scrollbar pb-20">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Liabilities & Debt</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Debt Management Strategy</p>
          </div>
          <button onClick={() => { setEditingLiability(null); setNewLiab({ type: LiabilityType.CREDIT_CARD }); setIsFormOpen(true); }} className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-rose-500/20 transition-colors">
              <Plus size={16} /> Add Liability
          </button>
        </header>

        {isFormOpen && (
             <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl animate-fade-in">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{editingLiability ? 'Edit Liability' : 'Track New Liability'}</h3>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Name</label>
                        <input className="input-std" placeholder="e.g. Amex Gold" value={newLiab.name || ''} onChange={e => setNewLiab({...newLiab, name: e.target.value})} required />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Type</label>
                        <select className="input-std" value={newLiab.type} onChange={e => setNewLiab({...newLiab, type: e.target.value as LiabilityType})}>
                            {Object.values(LiabilityType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Balance</label>
                        <input type="number" className="input-std" placeholder="0.00" value={newLiab.balance || ''} onChange={e => setNewLiab({...newLiab, balance: parseFloat(e.target.value)})} required />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Annual Percentage Rate (APR %)</label>
                        <input type="number" step="0.01" className="input-std" placeholder="18.5" value={newLiab.interestRate || ''} onChange={e => setNewLiab({...newLiab, interestRate: parseFloat(e.target.value)})} />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Due Date</label>
                         <input className="input-std" placeholder="e.g. 15th" value={newLiab.dueDateStr || ''} onChange={e => setNewLiab({...newLiab, dueDateStr: e.target.value})} />
                    </div>
                    <div className="lg:col-span-5 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => { setIsFormOpen(false); setEditingLiability(null); }} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-rose-500 text-white rounded-lg">{editingLiability ? 'Update Liability' : 'Save Liability'}</button>
                    </div>
                </form>
             </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-xl flex items-center gap-4">
                <div className="p-4 bg-rose-500/20 rounded-full text-rose-500">
                    <ShieldAlert size={32} />
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Liabilities</p>
                    <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalDebt, settings.currency)}</p>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="font-semibold text-slate-900 dark:text-white">Active Debts</h3>
                <span className="text-xs font-mono text-rose-500 bg-rose-100 dark:bg-rose-900/20 px-2 py-1 rounded">
                    {liabilities.length} Accounts
                </span>
            </div>
            <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {liabilities.map(liab => (
                        <tr key={liab.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-4 w-12">
                                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                    <CreditCard size={18} />
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="text-slate-900 dark:text-white font-medium">{liab.name}</div>
                                <div className="text-slate-500 text-xs">Due: {liab.dueDateStr}</div>
                            </td>
                            <td className="p-4 text-right">
                                <div className="text-rose-600 dark:text-rose-300 font-mono font-medium">{formatCurrency(liab.balance, settings.currency)}</div>
                                <div className="text-rose-50 text-xs">{(liab.interestRate * 100).toFixed(2)}% APR</div>
                            </td>
                            <td className="p-4 w-20 text-center">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => openEdit(liab)} className="text-slate-400 hover:text-rose-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                        </button>
                                        <button onClick={() => deleteLiability(liab.id)} className="text-slate-400 hover:text-rose-500">
                                        <Trash2 size={16} />
                                        </button>
                                    </div>
                            </td>
                        </tr>
                    ))}
                     {liabilities.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">No liabilities recorded. Great job!</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};
