import React from 'react';
import {
  LayoutDashboard, ArrowLeftRight, CreditCard,
  Wallet, BarChart3, Target, LogOut, TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'transactions', label: 'Transações',  icon: ArrowLeftRight },
  { id: 'cards',        label: 'Cartões',     icon: CreditCard,  soon: true },
  { id: 'accounts',     label: 'Contas',      icon: Wallet,      soon: true },
  { id: 'reports',      label: 'Relatórios',  icon: BarChart3,   soon: true },
  { id: 'goals',        label: 'Metas',       icon: Target,      soon: true },
];

const Sidebar = ({ session, activePage, onNavigate }) => {
  const email = session.user.email;
  const name  = email.split('@')[0];
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/25">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">FinanceApp</p>
            <p className="text-slate-500 text-xs">Gestão Pessoal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon, soon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => !soon && onNavigate(id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : soon
                  ? 'text-slate-700 cursor-default'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className="flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              {soon && (
                <span className="text-xs bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded-md">
                  breve
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate capitalize">{name}</p>
            <p className="text-slate-500 text-xs truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-rose-400 text-sm"
        >
          <LogOut size={16} />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
