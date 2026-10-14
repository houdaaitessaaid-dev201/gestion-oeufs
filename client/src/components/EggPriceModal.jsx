import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function EggPriceModal({ 
  isOpen, 
  onClose, 
  currentPrice, 
  currentProfitPerEgg = 0.20, 
  onSavePrice 
}) {
  const { t } = useLanguage();
  const [eggPrice, setEggPrice] = useState('1.35');
  const [plateauPrice, setPlateauPrice] = useState('40.50');
  const [profitPerEgg, setProfitPerEgg] = useState('0.20');
  const [updateAllClients, setUpdateAllClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const p = currentPrice || 1.35;
      const profit = currentProfitPerEgg !== undefined ? currentProfitPerEgg : 0.20;
      setEggPrice(p.toFixed(2));
      setPlateauPrice((p * 30).toFixed(2));
      setProfitPerEgg(profit.toFixed(2));
      setUpdateAllClients(true);
      setError('');
    }
  }, [isOpen, currentPrice, currentProfitPerEgg]);

  if (!isOpen) return null;

  const handleEggPriceChange = (val) => {
    setEggPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setPlateauPrice((num * 30).toFixed(2));
      setError('');
    }
  };

  const handlePlateauPriceChange = (val) => {
    setPlateauPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setEggPrice((num / 30).toFixed(2));
      setError('');
    }
  };

  const adjustPrice = (delta) => {
    const current = parseFloat(eggPrice) || 1.35;
    const next = Math.max(0.10, Math.round((current + delta) * 100) / 100);
    setEggPrice(next.toFixed(2));
    setPlateauPrice((next * 30).toFixed(2));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalPrice = parseFloat(eggPrice);
    const finalProfit = parseFloat(profitPerEgg);

    if (isNaN(finalPrice) || finalPrice <= 0) {
      setError(t('error'));
      return;
    }
    if (isNaN(finalProfit) || finalProfit < 0) {
      setError(t('profitPerEggLabel'));
      return;
    }

    try {
      setSaving(true);
      await onSavePrice({
        price: finalPrice,
        profit_per_egg: finalProfit,
        update_all_clients: updateAllClients
      });
      onClose();
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* En-tête */}
        <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="p-2 bg-white/20 rounded-2xl">
              <span className="text-xl">🥚</span>
            </div>
            <div>
              <h3 className="text-base font-black leading-tight">{t('eggPriceModalTitle')}</h3>
              <p className="text-xs text-amber-100 dark:text-slate-300 font-medium">{t('eggPriceModalSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center space-x-2 rtl:space-x-reverse text-rose-700 dark:text-rose-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Saisie Prix unitaire et plateau - Grandes cases bien visibles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Prix par œuf */}
            <div className="bg-amber-50/80 dark:bg-slate-800 p-4 rounded-3xl border-2 border-amber-300 dark:border-slate-700 shadow-2xs">
              <label className="block text-xs font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider mb-1.5">
                {t('unitPriceInputLabel')}
              </label>
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  value={eggPrice}
                  onChange={(e) => handleEggPriceChange(e.target.value)}
                  className="w-full text-3xl font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 py-2.5 px-3 rounded-2xl border-2 border-amber-400 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                  placeholder="1.35"
                  required
                />
                <span className="text-sm font-black text-amber-900 dark:text-amber-400 shrink-0">{t('dh')}</span>
              </div>
            </div>

            {/* Prix par plateau */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-2xs">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t('plateauPriceInputLabel')}
              </label>
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                <input
                  type="number"
                  step="0.10"
                  min="3.00"
                  value={plateauPrice}
                  onChange={(e) => handlePlateauPriceChange(e.target.value)}
                  className="w-full text-3xl font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 py-2.5 px-3 rounded-2xl border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                  placeholder="40.50"
                  required
                />
                <span className="text-sm font-black text-slate-600 dark:text-slate-400 shrink-0">{t('dh')}</span>
              </div>
            </div>
          </div>

          {/* Raccourcis d'ajustement rapide - Grands boutons */}
          <div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => adjustPrice(-0.10)}
                className="py-2.5 text-sm font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition active:scale-95 border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                - 0.10
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(-0.05)}
                className="py-2.5 text-sm font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition active:scale-95 border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                - 0.05
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(+0.05)}
                className="py-2.5 text-sm font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition active:scale-95 border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                + 0.05
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(+0.10)}
                className="py-2.5 text-sm font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition active:scale-95 border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                + 0.10
              </button>
            </div>
          </div>

          {/* Marge bénéficiaire par œuf (Mon bénéfice net par œuf) - Grande boîte bien visible */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-3xl border-2 border-emerald-400 dark:border-emerald-700 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                🎯 {t('profitPerEggLabel')}
              </label>
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-2xs">
                ربحي الصافي
              </span>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={profitPerEgg}
                onChange={(e) => setProfitPerEgg(e.target.value)}
                className="w-full text-3xl font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 py-2.5 px-3 rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                placeholder="0.20"
                required
              />
              <span className="text-sm font-black text-emerald-900 dark:text-emerald-300 shrink-0 whitespace-nowrap">
                {t('dh')} / {t('egg')}
              </span>
            </div>

            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
              {t('profitPerEggHelp')}
            </p>

            {/* Presets rapides de marge - Grands boutons */}
            <div className="flex items-center gap-2 pt-1">
              {['0.10', '0.15', '0.20', '0.25', '0.30'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setProfitPerEgg(preset)}
                  className={`flex-1 py-2 text-sm font-black rounded-xl transition active:scale-95 border ${
                    profitPerEgg === preset
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-emerald-200 dark:border-slate-700 hover:bg-emerald-100/50'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Option appliquer à tous les clients */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="flex items-start space-x-2.5 rtl:space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={updateAllClients}
                onChange={(e) => setUpdateAllClients(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  {t('updateClientsDefault')}
                </span>
              </div>
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="pt-2 flex items-center space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl transition"
            >
              {t('cancel')}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{saving ? t('saving') : t('savePriceBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
