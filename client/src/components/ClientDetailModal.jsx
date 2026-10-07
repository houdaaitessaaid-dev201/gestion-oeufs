import React, { useState, useEffect } from 'react';
import { 
  X, Phone, MessageCircle, MapPin, Wallet, 
  ShoppingCart, Calendar, Edit3
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function ClientDetailModal({ 
  isOpen, 
  onClose, 
  clientId, 
  onOpenSale, 
  onOpenPayment, 
  onEditClient 
}) {
  if (!isOpen || !clientId) return null;

  const { t } = useLanguage();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'payments', 'visits'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      setLoading(true);
      api.getClient(clientId)
        .then(setClient)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xl flex items-center space-x-3 rtl:space-x-reverse border dark:border-slate-800">
          <div className="w-5 h-5 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const remainingDebt = Math.max(0, Math.round((client.remaining_debt || 0) * 100) / 100);
  const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
  const cleanWhatsapp = (client.whatsapp || client.phone || '').replace(/[^0-9]/g, '');
  const mapsQuery = client.coordinates || encodeURIComponent(`${client.address || ''} ${client.name}`);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 px-5 py-4 text-white flex items-center justify-between border-b dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <h2 className="text-lg font-black leading-tight">{client.name}</h2>
              <button
                onClick={() => onEditClient && onEditClient(client)}
                className="p-1 text-slate-400 hover:text-white"
                title="Modifier"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            {client.contact_person && (
              <p className="text-xs text-slate-400">{t('managerLabel')} {client.contact_person} • {client.phone}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Quick Action Buttons */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <a
            href={`tel:${cleanPhone}`}
            className="flex flex-col items-center justify-center py-2 px-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
          >
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <Phone className="w-4 h-4 fill-emerald-700 dark:fill-emerald-400 stroke-none" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('quickCall')}</span>
          </a>

          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Salam ${client.contact_person || client.name}, c'est votre distributeur d'œufs.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
          >
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('quickWhatsapp')}</span>
          </a>

          <button
            onClick={() => {
              onClose();
              onOpenPayment(client);
            }}
            className="flex flex-col items-center justify-center py-2 px-1 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
          >
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{t('quickPayment')}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSale(client);
            }}
            className="flex flex-col items-center justify-center py-2 px-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-2xl shadow-xs transition"
          >
            <div className="p-2 rounded-full bg-amber-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black text-white mt-1">{t('quickDeliver')}</span>
          </button>
        </div>

        {/* Détails financiers */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">{t('agreedPrice')}</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{(client.default_price || 1.35).toFixed(2)} {t('dh')}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">{t('usualQuantity')}</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{client.usual_quantity || 150} {t('eggs')}</span>
          </div>

          <div className={`p-2 rounded-xl ${remainingDebt > 0 ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900' : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900'}`}>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">{t('remainingDue')}</span>
            <span className={`text-sm font-black ${remainingDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {remainingDebt.toFixed(0)} {t('dh')}
            </span>
          </div>
        </div>

        {/* History Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-2.5 text-xs font-black transition border-b-2 ${
              activeTab === 'sales' ? 'border-amber-600 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('salesTab')} ({client.sales?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2.5 text-xs font-black transition border-b-2 ${
              activeTab === 'payments' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('paymentsTab')} ({client.payments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`flex-1 py-2.5 text-xs font-black transition border-b-2 ${
              activeTab === 'visits' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('visitsTab')} ({client.visits?.length || 0})
          </button>
        </div>

        {/* History Content */}
        <div className="p-4 overflow-y-auto max-h-64 space-y-2 bg-slate-50 dark:bg-slate-950 flex-1">
          {activeTab === 'sales' && (
            (client.sales && client.sales.length > 0) ? (
              client.sales.map((s) => (
                <div key={s.id} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between font-extrabold text-slate-900 dark:text-white">
                    <span>{s.quantity} {t('eggs')} ({s.total_amount.toFixed(2)} {t('dh')})</span>
                    <span className="text-slate-400 font-normal">{s.sale_date}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span>{t('paidPart')} <b className="text-emerald-600 dark:text-emerald-400">{s.paid_amount.toFixed(2)} {t('dh')}</b></span>
                    {s.remaining_amount > 0 && (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{t('remainingPart')} {s.remaining_amount.toFixed(2)} {t('dh')}</span>
                    )}
                  </div>
                </div>
              ))
            ) : <p className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">{t('noSalesRecorded')}</p>
          )}

          {activeTab === 'payments' && (
            (client.payments && client.payments.length > 0) ? (
              client.payments.map((p) => (
                <div key={p.id} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block">+{p.amount.toFixed(2)} {t('dh')}</span>
                    <span className="text-[10px] text-slate-400">{p.payment_date}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                    {t('cash')}
                  </span>
                </div>
              ))
            ) : <p className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">{t('noPaymentsRecorded')}</p>
          )}

          {activeTab === 'visits' && (
            (client.visits && client.visits.length > 0) ? (
              client.visits.map((v) => (
                <div key={v.id} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {v.status === 'visited' ? `✅ ${t('visitedStatus')}` : `⏳ ${t('notVisitedStatus')}`}
                  </span>
                  <span className="text-slate-400">{v.visit_date} {v.visit_time ? `à ${v.visit_time}` : ''}</span>
                </div>
              ))
            ) : <p className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">{t('noVisitsRecorded')}</p>
          )}
        </div>

        {/* Close Button */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
