import React from 'react';
import { 
  Truck, Package, Plus, AlertTriangle, ArrowRight, 
  Wallet, AlertCircle, UserPlus, TrendingUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardView({ 
  dashboardData, 
  onNavigate, 
  onOpenStockModal, 
  onOpenClientModal,
  onOpenPriceModal
}) {
  const { t } = useLanguage();
  if (!dashboardData) return null;

  const {
    currentStock = 0,
    totalClients = 0,
    visitsToday = { toVisit: 0, visited: 0, remaining: 0 },
    totalPaidToday = 0,
    totalDebtToRecover = 0,
    eggsDistributedToday = 0,
    totalSalesToday = 0,
    todayProfit = 0,
    profitPerEgg = 0.20,
    currentSellPrice = 1.35
  } = dashboardData;

  const visitPercent = visitsToday.toVisit > 0 
    ? Math.round((visitsToday.visited / visitsToday.toVisit) * 100) 
    : 0;

  return (
    <div className="space-y-4 p-4 pb-24 max-w-2xl mx-auto">
      {/* BLOC 1 : LA TOURNÉE DU JOUR */}
      <div 
        onClick={() => onNavigate('tour')}
        className="bg-amber-500 rounded-3xl p-5 text-white shadow-md cursor-pointer active:scale-98 transition group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Truck className="w-5 h-5 text-amber-100" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">{t('todayTour')}</span>
          </div>
          <span className="text-xs font-bold bg-amber-600/80 px-2.5 py-0.5 rounded-full">
            {visitsToday.remaining > 0 ? `${visitsToday.remaining} ${t('remainingTour')}` : t('completedTour')}
          </span>
        </div>

        <div className="flex items-baseline space-x-2 rtl:space-x-reverse my-2">
          <span className="text-4xl font-black">{visitsToday.visited}</span>
          <span className="text-lg font-bold text-amber-100">{t('visitedOutOf', { total: visitsToday.toVisit })}</span>
        </div>

        {/* Barre simple */}
        <div className="w-full bg-amber-700/40 rounded-full h-3 overflow-hidden my-3">
          <div 
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${visitPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-amber-400/50">
          <span className="text-xs font-semibold text-amber-100">
            {eggsDistributedToday} {t('eggsDistributedToday')}
          </span>
          <div className="flex items-center text-xs font-bold text-white group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition space-x-1 rtl:space-x-reverse">
            <span>{t('openTour')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </div>
        </div>
      </div>

      {/* BLOC 2 : LE STOCK D'ŒUFS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('availableStock')}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">~{Math.floor(currentStock / 30)} {t('plateaux')}</span>
        </div>

        <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
          <span className="text-4xl font-black text-slate-900 dark:text-white">
            {currentStock.toLocaleString('fr-FR')}
          </span>
          <span className="text-base font-bold text-amber-600 dark:text-amber-500">{t('eggs')}</span>
        </div>

        {/* Gros boutons faciles pour le stock */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={() => onOpenStockModal('entry')}
            className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('quickAddStock')}</span>
          </button>

          <button
            onClick={() => onOpenStockModal('damage')}
            className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse py-3 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 active:scale-95 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs rounded-xl transition"
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{t('recordDamage')}</span>
          </button>
        </div>

        {/* Bouton rapide pour modifier/corriger le stock */}
        <button
          onClick={() => onOpenStockModal('adjust')}
          className="w-full flex items-center justify-center space-x-1.5 rtl:space-x-reverse py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 active:scale-95 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition"
        >
          <span>✏️ {t('adjustStockBtn')}</span>
        </button>
      </div>

      {/* BLOC 3 : BÉNÉFICE DU JOUR & FINANCES */}
      <div className="space-y-3">
        {/* CARTE PRINCIPALE : BÉNÉFICE DU JOUR (شحال ربحت اليوم) */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-3xl p-5 text-white shadow-md space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-100 block">
                  {t('todayProfit')}
                </span>
                <span className="text-[11px] text-emerald-100/90 font-medium">
                  {t('todayProfitSub')}
                </span>
              </div>
            </div>

            {/* Badge de marge par œuf cliquable pour la modifier facilement */}
            {onOpenPriceModal ? (
              <button
                onClick={onOpenPriceModal}
                className="text-xs font-black bg-white/20 hover:bg-white/30 active:scale-95 px-3 py-1 rounded-full text-white transition flex items-center space-x-1 rtl:space-x-reverse cursor-pointer border border-white/20"
                title="Modifier mon bénéfice par œuf"
              >
                <span>🎯 {profitPerEgg !== undefined ? Number(profitPerEgg).toFixed(2) : '0.20'} DH / {t('egg')}</span>
                <span className="text-[10px] opacity-80">✏️</span>
              </button>
            ) : (
              <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full text-white">
                🎯 {profitPerEgg !== undefined ? Number(profitPerEgg).toFixed(2) : '0.20'} DH / {t('egg')}
              </span>
            )}
          </div>

          <div className="flex items-baseline space-x-2 rtl:space-x-reverse my-1">
            <span className="text-4xl font-black tracking-tight">
              +{todayProfit.toLocaleString('fr-FR')}
            </span>
            <span className="text-xl font-black text-emerald-100">{t('dh')}</span>
          </div>

          <div className="pt-2.5 border-t border-emerald-400/40 flex items-center justify-between text-xs text-emerald-100 font-semibold">
            <span>
              📦 {eggsDistributedToday.toLocaleString('fr-FR')} {t('eggsDistributedToday')}
            </span>
            <span>
              {t('totalSalesTodayLabel')} : {totalSalesToday.toLocaleString('fr-FR')} {t('dh')}
            </span>
          </div>
        </div>
      </div>

      {/* Raccourci simple pour ajouter un client */}
      <div className="pt-1">
        <button
          onClick={onOpenClientModal}
          className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white rounded-2xl font-black text-sm shadow-xs transition"
        >
          <UserPlus className="w-5 h-5 stroke-[2.5]" />
          <span>{t('newClientBtn')}</span>
        </button>
      </div>
    </div>
  );
}
