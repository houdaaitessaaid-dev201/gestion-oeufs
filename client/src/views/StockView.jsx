import React, { useState } from 'react';
import { Package, Plus, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function StockView({ 
  stockData, 
  onOpenStockModal,
  currentEggPrice = 1.35,
  onOpenPriceModal
}) {
  const { t } = useLanguage();
  const {
    currentStock = 0,
    totalPurchased = 0,
    totalSold = 0,
    totalDamaged = 0,
    recentMovements = []
  } = stockData || {};

  const [filterType, setFilterType] = useState('all');

  const filteredMovements = recentMovements.filter(m => {
    if (filterType === 'all') return true;
    return m.movement_type === filterType;
  });

  return (
    <div className="space-y-4 p-4 pb-28 max-w-2xl mx-auto">
      {/* En-tête de la page Stock */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">{t('stockTitle')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('stockSubtitle')}</p>
        </div>
        <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
          ~{Math.floor(currentStock / 30)} {t('plateaux')}
        </span>
      </div>

      {/* Carte Prix du Marché / Prix de Vente du Jour */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-amber-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-2xl">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <span className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-300 tracking-wider block">
              {t('todayEggPrice')}
            </span>
            <div className="flex items-baseline space-x-2 rtl:space-x-reverse mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {(currentEggPrice || 1.35).toFixed(2)} {t('dh')} <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ {t('egg')}</span>
              </span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                ~{((currentEggPrice || 1.35) * 30).toFixed(2)} {t('dh')} {t('plateau')}
              </span>
            </div>
          </div>
        </div>

        {onOpenPriceModal && (
          <button
            onClick={onOpenPriceModal}
            className="py-2.5 px-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-1 rtl:space-x-reverse"
          >
            <span>✏️ {t('changePrice')}</span>
          </button>
        )}
      </div>

      {/* Carte Centrale du Stock */}
      <div className="bg-slate-900 dark:bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-white text-center shadow-md">
        <div className="inline-flex p-3 bg-amber-500/20 text-amber-400 rounded-2xl mb-2">
          <Package className="w-8 h-8" />
        </div>
        <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400">{t('stockInVanTitle')}</p>
        <div className="text-4xl sm:text-5xl font-black text-white mt-1">
          {currentStock.toLocaleString('fr-FR')} <span className="text-2xl font-bold text-amber-400">{t('eggs')}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          ~{Math.floor(currentStock / 30)} {t('plateaux')} (30 {t('eggs')})
        </p>

        {/* 2 Boutons principaux bien clairs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => onOpenStockModal('entry')}
            className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-sm transition"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>{t('addStockEntryBtn')}</span>
          </button>

          <button
            onClick={() => onOpenStockModal('damage')}
            className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-3.5 px-4 bg-rose-600/90 hover:bg-rose-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-sm transition"
          >
            <AlertTriangle className="w-5 h-5 stroke-[3]" />
            <span>{t('addDamageBtn')}</span>
          </button>
        </div>

        {/* Bouton pour corriger / modifier le stock en cas d'erreur */}
        <button
          onClick={() => onOpenStockModal('adjust')}
          className="w-full mt-2.5 flex items-center justify-center space-x-2 rtl:space-x-reverse py-3 px-4 bg-slate-800 hover:bg-slate-700/80 active:scale-95 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-2xl font-bold text-xs shadow-xs transition"
        >
          <span>✏️ {t('adjustStockBtn')}</span>
        </button>
      </div>


      {/* Liste des derniers mouvements */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            {t('stockHistory')}
          </h3>
        </div>

        {/* Filtres simples */}
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex gap-1 text-xs overflow-x-auto">
          {[
            { id: 'all', label: t('allFilter') },
            { id: 'in_purchase', label: `${t('purchaseEntry')} (+)` },
            { id: 'out_sale', label: `${t('saleExit')} (-)` },
            { id: 'loss_damage', label: `${t('damageLoss')} (-)` },
            { id: 'adjustment', label: `✏️ ${t('adjustmentEntry')}` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`flex-1 py-1.5 px-1 font-bold rounded-xl transition text-[11px] whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-slate-900 dark:bg-slate-700 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
          {filteredMovements.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">{t('noClientsFound')}</p>
          ) : (
            filteredMovements.map((m) => {
              const isPurchase = m.movement_type === 'in_purchase';
              const isSale = m.movement_type === 'out_sale';
              const isDamage = m.movement_type === 'loss_damage';
              const isAdjustment = m.movement_type === 'adjustment';

              return (
                <div key={m.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <div className={`p-2 rounded-xl text-xs font-black ${
                      isPurchase ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                      isSale ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                      isDamage ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' :
                      'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                    }`}>
                      {isPurchase && '+'}
                      {isSale && '-'}
                      {isDamage && '⚠️'}
                      {isAdjustment && '✏️'}
                    </div>

                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {isPurchase && `${t('purchaseEntry')} (${m.supplier || t('supplierLabel')})`}
                        {isSale && t('saleExit')}
                        {isDamage && t('damageLoss')}
                        {isAdjustment && (m.notes || t('adjustmentEntry'))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {m.movement_date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className={`text-sm font-black ${
                      m.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 
                      m.quantity < 0 ? 'text-rose-600 dark:text-rose-400' :
                      'text-slate-800 dark:text-slate-200'
                    }`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{t('eggs')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
