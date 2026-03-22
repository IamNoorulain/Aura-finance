import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { AIFinancialAssistant } from './components/AIFinancialAssistant';
import { Assets } from './components/Assets';
import { Liabilities } from './components/Liabilities';
import { Budgeting } from './components/Budgeting';
import { Settings } from './components/Settings';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <FinanceProvider>
      <Router>
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-700 dark:selection:text-emerald-200 transition-colors">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 h-screen overflow-hidden relative flex flex-col">
             {/* Mobile Header */}
             <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-20">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                   <div className="w-2 h-2 bg-white dark:bg-slate-950 rounded-full"></div>
                 </div>
                 <span className="font-bold text-sm tracking-tight">AURA</span>
               </div>
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
               </button>
             </header>

             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 dark:from-indigo-900/20 via-slate-50 dark:via-slate-950 to-slate-50 dark:to-slate-950 pointer-events-none" />
             
             <div className="relative flex-1 overflow-y-auto z-10 lg:ml-64">
               <div className="max-w-7xl mx-auto p-4 md:p-8">
                 <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/debts" element={<Liabilities />} />
                    <Route path="/budget" element={<Budgeting />} />
                    <Route path="/ai-insights" element={<AIFinancialAssistant />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                 </Routes>
               </div>
             </div>
          </main>
        </div>
      </Router>
    </FinanceProvider>
  );
};

export default App;
