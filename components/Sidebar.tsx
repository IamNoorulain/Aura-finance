import React from 'react';
import { LayoutDashboard, Wallet, PieChart, CreditCard, BrainCircuit, Settings, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active, onClick }: { to: string, icon: any, label: string, active: boolean, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
  >
    <Icon size={20} className={active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'} />
    <span className="font-medium text-sm tracking-wide">{label}</span>
  </Link>
);

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const location = useLocation();

  const handleNavClick = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`w-64 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <div className="w-3 h-3 bg-white dark:bg-slate-950 rounded-full"></div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AURA <span className="text-slate-400 dark:text-slate-600 font-light">FINANCE</span></h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem to="/" icon={LayoutDashboard} label="Command Center" active={location.pathname === '/'} onClick={handleNavClick} />
          <NavItem to="/transactions" icon={Wallet} label="Transactions" active={location.pathname === '/transactions'} onClick={handleNavClick} />
          <NavItem to="/assets" icon={PieChart} label="Assets" active={location.pathname === '/assets'} onClick={handleNavClick} />
          <NavItem to="/debts" icon={CreditCard} label="Liabilities" active={location.pathname === '/debts'} onClick={handleNavClick} />
          <NavItem to="/budget" icon={Target} label="Budget & Goals" active={location.pathname === '/budget'} onClick={handleNavClick} />
          <NavItem to="/ai-insights" icon={BrainCircuit} label="Aura Intelligence" active={location.pathname === '/ai-insights'} onClick={handleNavClick} />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <NavItem to="/settings" icon={Settings} label="System Settings" active={location.pathname === '/settings'} onClick={handleNavClick} />
        </div>
      </div>
    </>
  );
};
