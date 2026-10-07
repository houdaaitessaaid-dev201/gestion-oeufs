import React, { useState, useEffect } from 'react';
import { X, Check, Wallet, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentModal({ isOpen, onClose, client, onSuccess, currentUserId }) {
  if (!isOpen || !client) return null;

  const { t } = useLanguage();
  const currentDebt = Math.max(0, Math.round((client.remaining_debt || 0) * 100) / 100);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      if (client.remaining_debt && client.remaining_debt > 0) {
        setAmount(client.remaining_debt.toString());
      } else {
        setAmount('');
      }
      setError('');
    }
  }, [client]);

  const numAmount = parseFloat(amount) || 0;
  const newDebt = Math.max(0, Math.round((currentDebt - numAmount) * 100) / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError(t('amountToCollectLabel'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSuccess({
        client_id: client.client_id || client.id,
        user_id: currentUserId || 1,
        amount: numAmount,
        payment_method: 'cash',
        notes: 'Paiement en espèces'
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
        <div className="bg-emerald-600 dark:bg-slate-800 px-5 py-3.5 text-white flex items-center justify-between border-b dark:border-slate-700">
          <div>
            <h2 className="text-base font-black leading-tight">{t('paymentModalTitle')}</h2>
            <p className="text-xs text-emerald-100 dark:text-slate-300 font-semibold mt-0.5">
              {t('clientLabel')} <span className="text-white underline">{client.client_name || client.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700 dark:hover:bg-slate-700 active:scale-95 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center p-3 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
              <AlertCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Debt */}
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-3 flex justify-between items-center text-xs">
            <span className="text-rose-800 dark:text-rose-300 font-bold">{t('currentDebtOfClient')}</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400">{currentDebt.toFixed(2)} {t('dh')}</span>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              {t('amountToCollectLabel')}
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-3xl font-black px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-400 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                placeholder="0.00"
                required
                autoFocus
              />
              <span className="text-xl font-black text-slate-800 dark:text-slate-200">{t('dh')}</span>
            </div>

            {/* Shortcuts */}
            {currentDebt > 0 && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAmount(currentDebt.toString())}
                  className="flex-1 py-2 text-xs font-black bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl active:scale-95 transition"
                >
                  {t('payAll')} ({currentDebt} {t('dh')})
                </button>
                {currentDebt > 40 && (
                  <button
                    type="button"
                    onClick={() => setAmount(Math.round(currentDebt / 2).toString())}
                    className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl active:scale-95 transition"
                  >
                    {t('payHalf')} ({Math.round(currentDebt / 2)} {t('dh')})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Remaining After Payment */}
          <div className="bg-emerald-50/70 dark:bg-slate-800/60 border border-emerald-200 dark:border-slate-700 rounded-2xl p-3 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">{t('remainingAfterPayment')}</span>
            <span className={`text-base font-black ${newDebt > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {newDebt.toFixed(2)} {t('dh')}
            </span>
          </div>

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
              className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse disabled:opacity-50"
            >
              {loading ? (
                <span>{t('saving')}</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>{t('collectBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
