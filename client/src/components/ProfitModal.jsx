import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ProfitModal({ 
  isOpen, 
  onClose, 
  currentProfitPerEgg = 0.20, 
  onSaveProfit 
}) {
  const { t } = useLanguage();
  const [profitPerEgg, setProfitPerEgg] = useState('0.20');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const profit = currentProfitPerEgg !== undefined ? currentProfitPerEgg : 0.20;
      setProfitPerEgg(Number(profit).toFixed(2));
      setError('');
    }
  }, [isOpen, currentProfitPerEgg]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalProfit = parseFloat(profitPerEgg);

    if (isNaN(finalProfit) || finalProfit < 0) {
      setError(t('error'));
      return;
    }

    try {
      setSaving(true);
      await onSaveProfit({
        profit_per_egg: finalProfit
      });
      onClose();
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setSaving(false);
    }
  };

  const currentNumeric = parseFloat(profitPerEgg) || 0;
  const plateauProfit = (currentNumeric * 30).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* En-tête */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">{t('profitModalTitle')}</h3>
              <p className="text-xs text-emerald-100 font-medium">{t('profitModalSubtitle')}</p>
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

          {/* Saisie de la marge bénéficiaire par œuf - Grande case claire */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-3xl border-2 border-emerald-400 dark:border-emerald-700 space-y-3 shadow-xs">
            <label className="block text-xs font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
              {t('profitAmountLabel')}
            </label>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={profitPerEgg}
                onChange={(e) => setProfitPerEgg(e.target.value)}
                className="w-full text-4xl font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 py-3 px-4 rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner text-center"
                placeholder="0.20"
                required
                autoFocus
              />
              <span className="text-base font-black text-emerald-900 dark:text-emerald-300 shrink-0 whitespace-nowrap">
                {t('dh')} / {t('egg')}
              </span>
            </div>

            {/* Calcul automatique pour 1 plateau */}
            <div className="p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl text-center border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                📦 {t('plateauProfitSummary', { amount: plateauProfit })}
              </span>
            </div>
          </div>

          {/* Raccourcis rapides en 1 clic */}
          <div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-2">
              {t('quickProfitPresets')}
            </span>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {['0.10', '0.15', '0.20', '0.25', '0.30'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setProfitPerEgg(preset)}
                  className={`py-3 text-sm sm:text-base font-black rounded-xl transition active:scale-95 border-2 ${
                    parseFloat(profitPerEgg).toFixed(2) === parseFloat(preset).toFixed(2)
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Explication simple */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
            💡 {t('profitPerEggHelp')}
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
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{saving ? t('saving') : t('saveProfitBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
