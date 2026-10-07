import React, { useState, useEffect } from 'react';
import { X, Check, Store, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ClientModal({ isOpen, onClose, clientToEdit, onSuccess, currentEggPrice = 1.35 }) {
  if (!isOpen) return null;

  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setPhone(clientToEdit.phone || '');
      setWhatsapp(clientToEdit.whatsapp || '');
      setAddress(clientToEdit.address || '');
    } else {
      setName('');
      setPhone('');
      setWhatsapp('');
      setAddress('');
    }
    setError('');
  }, [clientToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('clientNameRequired'));
      return;
    }
    if (!phone.trim()) {
      setError(t('phoneRequired'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSuccess({
        id: clientToEdit?.id,
        name: name.trim(),
        contact_person: clientToEdit?.contact_person || '',
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        address: address.trim(),
        coordinates: clientToEdit?.coordinates || '',
        usual_quantity: clientToEdit?.usual_quantity || 150,
        default_price: clientToEdit?.default_price || parseFloat(currentEggPrice) || 1.35,
        notes: clientToEdit?.notes || '',
        add_to_today: !clientToEdit,
        ordered_quantity: clientToEdit?.usual_quantity || 150
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
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 dark:from-slate-800 dark:to-slate-850 px-6 py-4 text-white flex items-center justify-between border-b dark:border-slate-800">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Store className="w-5 h-5 text-amber-100" />
            <h2 className="text-base font-black tracking-tight">
              {clientToEdit ? t('clientModalTitleEdit') : t('clientModalTitleNew')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-100 hover:text-white hover:bg-white/10 active:scale-95 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - strictly the 4 fields */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
              <AlertCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. NOM DU MAGASIN / CLIENT */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t('clientNameLabel')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('clientNamePlaceholder')}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 focus:outline-none transition"
            />
          </div>

          {/* 2. TÉLÉPHONE */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t('phoneLabel')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phonePlaceholder')}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 focus:outline-none transition"
            />
          </div>

          {/* 3. NUMÉRO WHATSAPP */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t('whatsappLabel')}
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder={t('whatsappPlaceholder')}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 focus:outline-none transition"
            />
          </div>

          {/* 4. ADRESSE COMPLÈTE */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t('addressLabel')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('addressPlaceholder')}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 focus:outline-none transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
            >
              {loading ? (
                <span>{t('saving')}</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>{t('saveClientBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
