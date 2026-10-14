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
  onOpenPriceModal,
  onSavePrice
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
    paidEggsToday = 0,
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
            {eggsDistributedToday > 0 && ` (~${Math.floor(eggsDistributedToday / 30)} ${t('plateaux')})`}
          </span>
          <div className="flex items-center text-xs font-bold text-white group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition space-x-1 rtl:space-x-reverse">
            <span>{t('openTour')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </div>
        </div>
      </div>

      {/* BLOC 2 : LE STOCK D'ŒUFS (GRAND & CLAIR : ŒUFS + PLATEAUX) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-md space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            📦 {t('availableStock')}
          </span>
        </div>

        {/* 2 Grandes Cases : Nombre d'œufs et Nombre de Plateaux */}
        <div className="grid grid-cols-2 gap-3">
          {/* Nombre total d'œufs */}
          <div className="bg-amber-50/80 dark:bg-slate-800 p-4 rounded-3xl border-2 border-amber-300 dark:border-slate-700 text-center shadow-xs">
            <span className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide block mb-1">
              🥚 {t('eggs')}
            </span>
            <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              {currentStock.toLocaleString('fr-FR')}
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 block">
              {t('stockInVan')}
            </span>
          </div>

          {/* Nombre de plateaux de 30 */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 p-4 rounded-3xl text-white text-center shadow-md">
            <span className="text-xs font-black text-amber-100 uppercase tracking-wide block mb-1">
              📦 {t('plateaux')} (30)
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white leading-tight">
              {Math.floor(currentStock / 30)}
            </div>
            <span className="text-[11px] font-black text-amber-100 mt-1 block">
              {currentStock % 30 > 0 ? `+ ${currentStock % 30} ${t('eggs')}` : `${t('plateaux')} complets`}
            </span>
          </div>
        </div>

        {/* Gros boutons faciles pour le stock */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => onOpenStockModal('entry')}
            className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('quickAddStock')}</span>
          </button>

          <button
            onClick={() => onOpenStockModal('damage')}
            className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse py-3 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 active:scale-95 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-black text-xs sm:text-sm rounded-2xl transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{t('recordDamage')}</span>
          </button>
        </div>

        {/* Bouton rapide pour modifier/corriger le stock */}
        <button
          onClick={() => onOpenStockModal('adjust')}
          className="w-full flex items-center justify-center space-x-1.5 rtl:space-x-reverse py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 active:scale-95 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-extrabold text-xs sm:text-sm rounded-2xl transition cursor-pointer"
        >
          <span>✏️ {t('adjustStockBtn')}</span>
        </button>
      </div>

      {/* BLOC 3 : PRIX DU JOUR DES ŒUFS (GRANDE CARTE BIEN VISIBLE) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-amber-300 dark:border-slate-700 shadow-md space-y-4 transition-colors">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <span className="text-3xl">🏷️</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t('eggPriceTodayTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {t('eggPriceTodaySub')}
            </p>
          </div>
        </div>

        {/* 2 Grandes Cases : Prix par œuf et Prix par plateau */}
        <div className="grid grid-cols-2 gap-3">
          {/* Prix d'une pièce */}
          <div className="bg-amber-50 dark:bg-slate-800/80 p-4 rounded-3xl border-2 border-amber-300 dark:border-slate-700 text-center shadow-xs">
            <span className="text-xs font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider block mb-1">
              🥚 {t('unitPriceInputLabel')}
            </span>
            <div className="flex items-baseline justify-center space-x-1 rtl:space-x-reverse">
              <span className="text-4xl sm:text-5xl font-black text-amber-950 dark:text-white tracking-tight">
                {(Number(currentSellPrice) || 1.35).toFixed(2)}
              </span>
              <span className="text-sm font-black text-amber-800 dark:text-amber-400">{t('dh')}</span>
            </div>
          </div>

          {/* Prix du plateau (30) */}
          <div className="bg-amber-50 dark:bg-slate-800/80 p-4 rounded-3xl border-2 border-amber-300 dark:border-slate-700 text-center shadow-xs">
            <span className="text-xs font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider block mb-1">
              📦 {t('plateauPriceInputLabel')}
            </span>
            <div className="flex items-baseline justify-center space-x-1 rtl:space-x-reverse">
              <span className="text-4xl sm:text-5xl font-black text-amber-950 dark:text-white tracking-tight">
                {((Number(currentSellPrice) || 1.35) * 30).toFixed(2)}
              </span>
              <span className="text-sm font-black text-amber-800 dark:text-amber-400">{t('dh')}</span>
            </div>
          </div>
        </div>

        {/* Gros bouton bien visible pour modifier le prix du jour */}
        <button
          onClick={onOpenPriceModal}
          className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-white font-black text-base sm:text-lg rounded-2xl shadow-md transition cursor-pointer"
        >
          <span className="text-xl">✏️</span>
          <span>{t('editPriceBtn')}</span>
        </button>
      </div>

      {/* BLOC 4 : MON BÉNÉFICE NET PAR ŒUF (GRANDE CASE DÉDIÉE) */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-3xl p-5 text-white shadow-md space-y-4 transition-all">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse border-b border-emerald-400/50 pb-2.5">
          <span className="text-3xl">🎯</span>
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              {t('profitPerEggLabel')}
            </h3>
            <p className="text-xs text-emerald-100 font-semibold">
              {t('profitPerEggHelp')}
            </p>
          </div>
        </div>

        {/* Le grand chiffre du bénéfice par œuf */}
        <div className="bg-white/15 dark:bg-black/20 backdrop-blur-xs p-4 rounded-3xl border-2 border-white/30 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-xs uppercase font-extrabold text-emerald-100 block">
              ربحي الصافي في كل بيضة
            </span>
            <div className="flex items-baseline space-x-2 rtl:space-x-reverse mt-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                +{Number(profitPerEgg !== undefined ? profitPerEgg : 0.20).toFixed(2)}
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-100">
                {t('dh')} / {t('egg')}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenPriceModal}
            className="py-3 px-5 bg-white text-emerald-900 font-black text-sm sm:text-base rounded-2xl shadow-md hover:bg-emerald-50 active:scale-95 transition flex items-center space-x-1.5 rtl:space-x-reverse shrink-0 cursor-pointer"
          >
            <span className="text-lg">✏️</span>
            <span>{t('modify')}</span>
          </button>
        </div>

        {/* Raccourcis de sélection directe du bénéfice en 1 clic */}
        <div>
          <span className="text-xs font-black text-emerald-100 block mb-2">
            {t('quickProfitPresets')}
          </span>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {['0.10', '0.15', '0.20', '0.25', '0.30'].map((preset) => (
              <button
                key={preset}
                onClick={async () => {
                  if (onSavePrice) {
                    await onSavePrice({
                      price: currentSellPrice,
                      profit_per_egg: parseFloat(preset),
                      update_all_clients: false
                    });
                  } else if (onOpenPriceModal) {
                    onOpenPriceModal();
                  }
                }}
                className={`py-2.5 text-sm sm:text-base font-black rounded-xl transition active:scale-95 border-2 ${
                  Number(profitPerEgg).toFixed(2) === parseFloat(preset).toFixed(2)
                    ? 'bg-white text-emerald-950 border-white shadow-md scale-105'
                    : 'bg-emerald-800/60 text-white border-emerald-400/50 hover:bg-emerald-700'
                }`}
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BLOC 5 : BÉNÉFICE DU JOUR (شحال ربحت اليوم) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-emerald-400 dark:border-emerald-700 shadow-md space-y-3 transition-all">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-700 dark:text-emerald-300">
            <TrendingUp className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t('todayProfit')}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {t('todayProfitSub')}
            </span>
          </div>
        </div>

        <div className="flex items-baseline space-x-2 rtl:space-x-reverse my-2">
          <span className="text-5xl sm:text-6xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            +{todayProfit.toLocaleString('fr-FR')}
          </span>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-500">{t('dh')}</span>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <span className="text-slate-800 dark:text-slate-200">
            📦 {paidEggsToday.toLocaleString('fr-FR')} {t('eggsPaid')} (~{Math.floor(paidEggsToday / 30)} {t('plateaux')})
            {eggsDistributedToday > paidEggsToday && (
              <span className="text-rose-600 dark:text-rose-400 font-extrabold"> ({eggsDistributedToday - paidEggsToday} {t('onCredit')})</span>
            )}
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-black">
            {t('totalSalesTodayLabel')} : {totalSalesToday.toLocaleString('fr-FR')} {t('dh')}
          </span>
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
