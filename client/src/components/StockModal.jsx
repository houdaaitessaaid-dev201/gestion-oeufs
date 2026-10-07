import React, { useState } from 'react';
import { X, Check, Plus, AlertTriangle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function StockModal({ isOpen, onClose, mode = 'entry', onSuccess, currentUserId }) {
  if (!isOpen) return null;

  const { t } = useLanguage();
  const isEntry = mode === 'entry';
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('1.15');
  const [supplier, setSupplier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const qty = parseInt(quantity, 10) || 0;
  const price = parseFloat(unitPrice) || 0;
  const totalCost = Math.round(qty * price * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (qty <= 0) {
      setError(isEntry ? t('howManyEggsAdd') : t('howManyEggsBroken'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (isEntry) {
        await onSuccess({
          type: 'entry',
          quantity: qty,
          unit_price: price,
          supplier: supplier.trim() || 'Fournisseur direct',
          notes: 'Achat d\'œufs',
          user_id: currentUserId || 1
        });
      } else {
        await onSuccess({
          type: 'damage',
          quantity: qty,
          notes: 'Œufs cassés',
          user_id: currentUserId || 1
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className={`px-5 py-3.5 text-white flex items-center justify-between border-b dark:border-slate-700 ${
          isEntry ? 'bg-amber-600 dark:bg-slate-800' : 'bg-rose-600 dark:bg-rose-900'
        }`}>
          <div>
            <h2 className="text-base font-black leading-tight">
              {isEntry ? t('stockModalEntryTitle') : t('stockModalDamageTitle')}
            </h2>
            <p className="text-xs text-white/90 dark:text-slate-300 font-medium mt-0.5">
              {isEntry ? t('stockModalEntrySub') : t('stockModalDamageSub')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/20 active:scale-95 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center p-3 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
              <AlertCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              {isEntry ? t('howManyEggsAdd') : t('howManyEggsBroken')}
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-3xl font-black px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                placeholder={isEntry ? 'Ex: 1500' : 'Ex: 15'}
                required
                autoFocus
              />
              <span className="text-base font-extrabold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('eggs')}</span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              {(isEntry ? [300, 600, 1500, 3000, 6000] : [5, 10, 15, 30, 60]).map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setQuantity(preset.toString())}
                  className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 active:scale-95 transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Si Achat : Prix d'achat et Fournisseur */}
          {isEntry && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {t('purchasePriceLabel')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {t('totalCost')}
                  </label>
                  <div className="px-3 py-2 bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl text-sm font-black text-amber-900 dark:text-amber-400">
                    {totalCost.toFixed(2)} {t('dh')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                  {t('supplierOptional')}
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Ex: Ferme Souss"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-2 py-3 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse disabled:opacity-50 ${
                isEntry ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {loading ? (
                <span>{t('saving')}</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>{isEntry ? t('addToStockBtn') : t('removeFromStockBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
