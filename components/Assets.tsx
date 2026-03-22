
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../services/financeEngine';
import { Asset, AssetType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Home, Landmark, Bitcoin, Car, Plus, Trash2 } from 'lucide-react';

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

export const Assets = () => {
  const { assets, settings, addAsset, updateAsset, deleteAsset } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ type: AssetType.CASH, currency: settings.currency });

  const allocationData = assets.map(a => ({ name: a.type, value: a.value })).reduce((acc: any[], curr) => {
    const existing = acc.find(x => x.name === curr.name);
    if (existing) { existing.value += curr.value; } 
    else { acc.push({ ...curr }); }
    return acc;
  }, []);

  const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.value) return;
    
    const assetData: Asset = {
      id: editingAsset ? editingAsset.id : Date.now().toString(),
      name: newAsset.name,
      type: newAsset.type || AssetType.CASH,
      value: Number(newAsset.value),
      currency: settings.currency,
      lastUpdated: new Date().toISOString().split('T')[0],
      interestRate: newAsset.interestRate ? Number(newAsset.interestRate) / 100 : undefined
    };

    if (editingAsset) {
      updateAsset(assetData);
    } else {
      addAsset(assetData);
    }
    
    setIsFormOpen(false);
    setEditingAsset(null);
    setNewAsset({ type: AssetType.CASH });
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setNewAsset({
      name: asset.name,
      type: asset.type,
      value: asset.value,
      interestRate: asset.interestRate ? asset.interestRate * 100 : undefined
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 h-full overflow-y-auto custom-scrollbar pb-20">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Assets & Allocation</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Net Worth Distribution</p>
          </div>
          <button onClick={() => { setEditingAsset(null); setNewAsset({ type: AssetType.CASH }); setIsFormOpen(true); }} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20 transition-colors">
              <Plus size={16} /> Add Asset
          </button>
        </header>

        {isFormOpen && (
             <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl animate-fade-in">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{editingAsset ? 'Edit Asset' : 'Track New Asset'}</h3>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Name</label>
                        <input className="input-std" placeholder="e.g. Chase Savings" value={newAsset.name || ''} onChange={e => setNewAsset({...newAsset, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Type</label>
                        <select className="input-std" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value as AssetType})}>
                            {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Value ({settings.currency})</label>
                        <input type="number" className="input-std" placeholder="0.00" value={newAsset.value || ''} onChange={e => setNewAsset({...newAsset, value: parseFloat(e.target.value)})} required />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Annual Percentage Yield (APY %)</label>
                        <input type="number" step="0.01" className="input-std" placeholder="4.5" value={newAsset.interestRate || ''} onChange={e => setNewAsset({...newAsset, interestRate: parseFloat(e.target.value)})} />
                    </div>
                    <div className="lg:col-span-4 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => { setIsFormOpen(false); setEditingAsset(null); }} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-emerald-500 text-white rounded-lg">{editingAsset ? 'Update Asset' : 'Save Asset'}</button>
                    </div>
                </form>
             </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex items-center gap-4">
                <div className="p-4 bg-emerald-500/20 rounded-full text-emerald-500">
                    <TrendingUp size={32} />
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Assets</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAssets, settings.currency)}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Asset Mix</h3>
                <div className="flex-1 min-h-[300px]">
                    {assets.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value, settings.currency)} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">No assets to visualize</div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
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
                                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
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
                                    <td className="p-4 w-20 text-center">
                                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEdit(asset)} className="text-slate-400 hover:text-emerald-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                            </button>
                                            <button onClick={() => deleteAsset(asset.id)} className="text-slate-400 hover:text-rose-500">
                                                <Trash2 size={16} />
                                            </button>
                                         </div>
                                    </td>
                                </tr>
                            ))}
                            {assets.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No assets recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};
