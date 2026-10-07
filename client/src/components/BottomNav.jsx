import React from 'react';
import { Home, ClipboardList, Users, Package, Wallet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav({ activeTab, setActiveTab, pendingVisitsCount, debtCount }) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'dashboard', label: t('tabHome'), icon: Home },
    { id: 'tour', label: t('tabTour'), icon: ClipboardList, badge: pendingVisitsCount },
    { id: 'clients', label: t('tabClients'), icon: Users },
    { id: 'stock', label: t('tabStock'), icon: Package },
    { id: 'debts', label: t('tabDebts'), icon: Wallet, badge: debtCount }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg pb-safe transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition active:scale-95 ${
                isActive
                  ? 'text-amber-600 dark:text-amber-500 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[2px]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-amber-600 dark:text-amber-500 font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-amber-600 dark:bg-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
