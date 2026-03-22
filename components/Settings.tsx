import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Moon, Sun, DollarSign, Database, Trash2, AlertTriangle, X } from 'lucide-react';

export const Settings = () => {
  const { settings, updateSettings, clearAllData } = useFinance();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleClear = () => {
    clearAllData();
    setShowConfirm(false);
    setIsDeleted(true);
    setTimeout(() => setIsDeleted(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-4xl">
       <header>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">System Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Preferences & Data Management</p>
        </header>

        <div className="space-y-6">
            {/* Appearance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Moon size={20} /> Appearance
                </h3>
                <div className="flex gap-4">
                    <button 
                        onClick={() => updateSettings({ theme: 'dark' })}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.theme === 'dark' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
                    >
                        <Moon size={24} />
                        <span className="font-medium">Dark Mode</span>
                    </button>
                    <button 
                        onClick={() => updateSettings({ theme: 'light' })}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.theme === 'light' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
                    >
                        <Sun size={24} />
                        <span className="font-medium">Light Mode</span>
                    </button>
                </div>
            </div>

            {/* Currency */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <DollarSign size={20} /> Regional Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-slate-500 block mb-2">Primary Currency</label>
                        <select 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                            value={settings.currency}
                            onChange={(e) => updateSettings({ currency: e.target.value as any })}
                        >
                            <option value="USD">USD ($) - United States Dollar</option>
                            <option value="PKR">PKR (Rs) - Pakistani Rupee</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-2 italic">Changing currency will convert all your existing data values.</p>
                    </div>
                    <div>
                        <label className="text-sm text-slate-500 block mb-2">Exchange Rate (1 USD to PKR)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">Rs</span>
                            <input 
                                type="number"
                                step="0.01"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 pl-10 text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-mono"
                                value={settings.usdToPkrRate}
                                onChange={(e) => updateSettings({ usdToPkrRate: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">This rate is used for currency conversions when switching primary currency.</p>
                    </div>
                </div>
            </div>

            {/* Data */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-rose-500 mb-6 flex items-center gap-2">
                    <Database size={20} /> Data Zone
                </h3>
                <p className="text-slate-500 mb-4 text-sm">Aura Finance stores data locally on your device. Clearing data is irreversible.</p>
                
                {isDeleted ? (
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        All data has been successfully cleared.
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowConfirm(true)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-500 border border-rose-500/20 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Trash2 size={16} /> Delete All Data
                    </button>
                )}
            </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                                <AlertTriangle size={24} />
                            </div>
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Wipe All Data?</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            This action will permanently delete all transactions, assets, liabilities, budgets, and chat history. This cannot be undone.
                        </p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                        <button 
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleClear}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                        >
                            Yes, Delete Everything
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
