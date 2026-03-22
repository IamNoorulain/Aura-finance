import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/financeEngine';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Home, Landmark, Bitcoin, Car, CreditCard } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

const AssetIcon = ({ type }: { type: string }) => {
  switch(type) {
    case 'REAL_ESTATE': return <Home size={18} />;
    case 'CRYPTO': return <Bitcoin size={18} />;
    case 'VEHICLE': return <Car size={18} />;
    case 'INVESTMENT': return <TrendingUp size={18} />;
    default: return <Landmark size={18} />;
  }
};

export const AssetsLiabilities = () => {
  const { assets, liabilities, settings } = useFinance();

  // Aggregate for Pie Chart
  const allocationData = assets.map(a => ({ name: a.type, value: a.value })).reduce((acc: any[], curr) => {
    const existing = acc.find(x => x.name === curr.name);
    if (existing) {
        existing.value += curr.value;
    } else {
        acc.push({ ...curr });
    }
    return acc;
  }, []);

  const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
  const totalDebt = liabilities.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar">
       <header>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Portfolio Allocation</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Asset Distribution & Debt Management</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Allocation Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Asset Mix</h3>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={allocationData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {allocationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value, settings.currency)}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-slate-500 text-sm">Total Assets</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalAssets, settings.currency)}</p>
                </div>
            </div>

            {/* Asset List */}
            <div className="lg:col-span-2 space-y-8">
                {/* Assets Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Liquid & Fixed Assets</h3>
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-1 rounded">
                            {assets.length} Accounts
                        </span>
                    </div>
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {assets.map(asset => (
                                <tr key={asset.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 w-12">
                                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                            <AssetIcon type={asset.type} />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-slate-900 dark:text-white font-medium">{asset.name}</div>
                                        <div className="text-slate-500 text-xs">{asset.type.replace('_', ' ')}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="text-slate-900 dark:text-white font-mono font-medium">{formatCurrency(asset.value, settings.currency)}</div>
                                        {asset.interestRate && (
                                            <div className="text-emerald-500 text-xs">{(asset.interestRate * 100).toFixed(2)}% APY</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Liabilities Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Liabilities</h3>
                        <span className="text-xs font-mono text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/20 px-2 py-1 rounded">
                            {formatCurrency(totalDebt, settings.currency)} Total
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
                                        <div className="text-rose-500 text-xs">{(liab.interestRate * 100).toFixed(2)}% APR</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};