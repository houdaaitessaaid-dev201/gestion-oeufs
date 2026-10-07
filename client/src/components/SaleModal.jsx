import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingCart, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SaleModal({ isOpen, onClose, client, onSuccess, currentUserId, currentEggPrice = 1.35 }) {
  if (!isOpen || !client) return null;

  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(client.usual_quantity || 150);
  const [unitPrice, setUnitPrice] = useState(client.default_price || currentEggPrice);
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const qty = parseInt(quantity, 10) || 0;
  const price = parseFloat(unitPrice) || 0;
  const totalAmount = Math.round(qty * price * 100) / 100;
  const paid = paidAmount === '' ? 0 : parseFloat(paidAmount) || 0;
  const remainingAmount = Math.max(0, Math.round((totalAmount - paid) * 100) / 100);

  useEffect(() => {
    if (client) {
      const initialQty = client.usual_quantity || 150;
      const initialPrice = client.default_price || currentEggPrice;
      setQuantity(initialQty);
      setUnitPrice(initialPrice);
      const initialTotal = Math.round(initialQty * initialPrice * 100) / 100;
      setPaidAmount(initialTotal.toString());
      setNotes('');
      setError('');
    }
  }, [client, currentEggPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (qty <= 0) {
      setError(t('howManyEggs'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSuccess({
        client_id: client.client_id || client.id,
        user_id: currentUserId || 1,
        quantity: qty,
        unit_price: price,
        paid_amount: paid,
        notes: notes.trim()
      });
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
        <div className="bg-amber-600 dark:bg-slate-800 px-5 py-3.5 text-white flex items-center justify-between border-b dark:border-slate-700">
          <div>
            <h2 className="text-base font-black leading-tight">{t('saleModalTitle')}</h2>
            <p className="text-xs text-amber-100 dark:text-slate-300 font-semibold mt-0.5">
              {t('shopLabel')} <span className="text-white underline">{client.client_name || client.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-amber-100 hover:text-white hover:bg-amber-700 dark:hover:bg-slate-700 active:scale-95 transition"
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

          {/* 1. Nombre d'œufs */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              {t('howManyEggs')}
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => {
                  const newQty = e.target.value;
                  setQuantity(newQty);
                  const newTotal = Math.round((parseInt(newQty, 10) || 0) * price * 100) / 100;
                  setPaidAmount(newTotal.toString());
                }}
                className="w-full text-3xl font-black px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                placeholder="Ex: 150"
                required
              />
              <span className="text-base font-extrabold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('eggs')}</span>
            </div>

            {/* Raccourcis plateaux */}
            <div className="flex items-center gap-1.5 mt-2">
              {[30, 60, 90, 150, 300].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setQuantity(preset);
                    const newTotal = Math.round(preset * price * 100) / 100;
                    setPaidAmount(newTotal.toString());
                  }}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition active:scale-95 ${
                    qty === preset
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Prix de l'œuf */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              {t('eggPriceDH')}
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={unitPrice}
                onChange={(e) => {
                  const newPrice = e.target.value;
                  setUnitPrice(newPrice);
                  const newTotal = Math.round(qty * (parseFloat(newPrice) || 0) * 100) / 100;
                  setPaidAmount(newTotal.toString());
                }}
                className="w-full text-xl font-black px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                required
              />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{t('perEgg')}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              ~<strong className="text-amber-700 dark:text-amber-400">{((parseFloat(unitPrice) || 0) * 30).toFixed(2)} {t('dh')}</strong> {t('plateauEstimate')}
            </p>
          </div>

          {/* 3. Résumé du Total & Paiement */}
          <div className="bg-amber-50 dark:bg-slate-800/60 border-2 border-amber-200 dark:border-slate-700 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('totalAmountLabel')}</span>
              <span className="text-2xl font-black text-amber-900 dark:text-amber-400">{totalAmount.toFixed(2)} {t('dh')}</span>
            </div>

            <div className="pt-2 border-t border-amber-200/80 dark:border-slate-700">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1">
                {t('amountPaidNowLabel')}
              </label>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={totalAmount}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full text-2xl font-black px-4 py-2 bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-slate-600 text-slate-900 dark:text-white rounded-2xl focus:outline-none"
                  placeholder="0.00"
                />
                <span className="text-base font-bold text-amber-900 dark:text-amber-300">{t('dh')}</span>
              </div>

              {/* 2 Boutons : Tout payé ou Crédit */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPaidAmount(totalAmount.toString())}
                  className="py-2 text-xs font-black bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl active:scale-95 transition"
                >
                  {t('allPaid')} ({totalAmount} {t('dh')})
                </button>
                <button
                  type="button"
                  onClick={() => setPaidAmount('0')}
                  className="py-2 text-xs font-black bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700 rounded-xl active:scale-95 transition"
                >
                  {t('creditZero')}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-slate-700 text-sm font-bold">
              <span className="text-slate-700 dark:text-slate-300">{t('remainingDebtLabel')}</span>
              <span className={`text-xl font-black ${remainingAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {remainingAmount.toFixed(2)} {t('dh')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-1 flex gap-2.5">
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
              className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse disabled:opacity-50"
            >
              {loading ? (
                <span>{t('saving')}</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>{t('validateSaleBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
