import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateNetWorth, calculateMonthlyCashFlow, formatCurrency, getMonthlyTrendData } from '../services/financeEngine';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Plus } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

// Simple Modal for Quick Add (in real app, move to separate file)
const QuickAddModal = ({ isOpen, onClose, onSave }: any) => {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;
    
    onSave({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      description: desc,
      type: type,
      category: 'Uncategorized', // Default for quick add
      tags: [],
      isRecurring: false
    });
    setAmount(''); setDesc(''); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-96 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Quick Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Type</label>
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
               <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-1 rounded-md text-sm ${type === TransactionType.EXPENSE ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>Expense</button>
               <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-1 rounded-md text-sm ${type === TransactionType.INCOME ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>Income</button>
            </div>
          </div>
          <div>
             <label className="block text-slate-400 text-sm mb-1">Description</label>
             <input autoFocus value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:border-emerald-500 outline-none" placeholder="Coffee, Salary, etc." />
          </div>
          <div>
             <label className="block text-slate-400 text-sm mb-1">Amount</label>
             <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:border-emerald-500 outline-none" placeholder="0.00" />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, subtext, trend, icon: Icon, colorClass }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      <Icon size={64} />
    </div>
    <div className="relative z-10">
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
      <div className="flex items-center gap-2 mt-4">
        {trend === 'up' ? <ArrowUpRight size={16} className="text-emerald-500 dark:text-emerald-400" /> : <ArrowDownRight size={16} className="text-rose-500 dark:text-rose-400" />}
        <span className="text-xs text-slate-500">{subtext}</span>
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const { transactions, assets, liabilities, settings, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const netWorth = calculateNetWorth(assets, liabilities);
  const { income, expenses, net } = calculateMonthlyCashFlow(transactions);
  const trendData = useMemo(() => getMonthlyTrendData(transactions), [transactions]);

  const currency = settings.currency;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Command Center</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Financial Situation Snapshot</p>
        </div>
        <div className="w-full md:w-auto text-left md:text-right flex flex-col items-start md:items-end gap-2">
           <div>
              <p className="text-sm text-slate-500">Total Net Worth</p>
              <p className="text-2xl md:text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(netWorth, currency)}</p>
           </div>
           <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <Plus size={16} /> Quick Add
           </button>
        </div>
      </header>

      <QuickAddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addTransaction} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Monthly Income" 
          value={formatCurrency(income, currency)} 
          subtext="Current Month" 
          trend="up" 
          icon={DollarSign} 
          colorClass="text-emerald-500" 
        />
        <MetricCard 
          title="Monthly Expenses" 
          value={formatCurrency(expenses, currency)} 
          subtext="Current Month" 
          trend="down" 
          icon={Activity} 
          colorClass="text-rose-500" 
        />
        <MetricCard 
          title="Net Flow" 
          value={formatCurrency(net, currency)} 
          subtext="Savings Rate" 
          trend={net > 0 ? "up" : "down"} 
          icon={Activity} 
          colorClass="text-indigo-500" 
        />
        <MetricCard 
          title="Assets" 
          value={formatCurrency(assets.reduce((a, b) => a + b.value, 0), currency)} 
          subtext={`${assets.length} Accounts`} 
          trend="up" 
          icon={DollarSign} 
          colorClass="text-blue-500" 
        />
      </div>

      {transactions.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center">
            <Activity className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Financial Data</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">Start by adding your assets, liabilities, or a quick transaction to generate your dashboard insights.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-6 text-emerald-500 hover:underline">Add First Transaction</button>
        </div>
      ) : (
        /* Charts Row */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Cash Flow Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Cash Flow & Savings Trend</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.2} vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Burn Rate / Savings Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Net Savings (6 Mo)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.2} vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.1}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }} 
                  />
                  <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
                    {trendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.savings > 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
