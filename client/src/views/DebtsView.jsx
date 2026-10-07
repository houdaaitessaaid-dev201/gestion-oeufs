import React, { useState } from 'react';
import { Wallet, Phone, MessageCircle, AlertCircle, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DebtsView({ 
  debtsData, 
  paymentsList, 
  onOpenPayment, 
  onOpenClientDetail 
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('debtors'); // 'debtors', 'history'
  const [search, setSearch] = useState('');

  const { totalDebt = 0, debtorCount = 0, debtors = [] } = debtsData || {};

  const filteredDebtors = (debtors || []).filter(d => 
    d.client_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.contact_person && d.contact_person.toLowerCase().includes(search.toLowerCase())) ||
    (d.phone && d.phone.includes(search))
  );

  return (
    <div className="space-y-4 p-4 pb-28 max-w-2xl mx-auto">
      {/* Bannière Total Crédit */}
      <div className="bg-rose-600 rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
          <AlertCircle className="w-4 h-4" />
          <span>{t('totalDebtOutside')}</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-white">
          {totalDebt.toLocaleString('fr-FR')} <span className="text-xl font-bold">{t('dh')}</span>
        </div>
        <p className="text-xs text-rose-100 mt-1 font-medium">
          {debtorCount} {t('shopsWithDebt')}
        </p>
      </div>

      {/* Onglets Simples */}
      <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl transition-colors">
        <button
          onClick={() => setActiveTab('debtors')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'debtors'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t('shopsWithDebt')} ({debtorCount})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t('lastPayments')}
        </button>
      </div>

      {activeTab === 'debtors' ? (
        <div className="space-y-3">
          {/* Recherche */}
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <input
              type="text"
              placeholder={t('searchClientPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:outline-none"
            />
          </div>

          {filteredDebtors.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-medium">
              🎉 {t('noClientsFound')}
            </div>
          ) : (
            filteredDebtors.map((debtor) => {
              const cleanPhone = (debtor.phone || '').replace(/[^0-9]/g, '');
              const cleanWhatsapp = (debtor.whatsapp || debtor.phone || '').replace(/[^0-9]/g, '');

              return (
                <div 
                  key={debtor.client_id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-rose-100 dark:border-slate-800 shadow-2xs space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      onClick={() => onOpenClientDetail(debtor.client_id)}
                      className="cursor-pointer flex-1"
                    >
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {debtor.client_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {debtor.contact_person ? `${debtor.contact_person} • ` : ''}{debtor.phone}
                      </p>
                    </div>

                    <div className="text-right rtl:text-left">
                      <span className="text-xl font-black text-rose-600 dark:text-rose-400 block">
                        {debtor.remaining_debt.toFixed(2)} {t('dh')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{t('credit')}</span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={`tel:${cleanPhone}`}
                      aria-label="Appeler"
                      className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:bg-emerald-100 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
                    >
                      <Phone className="w-4 h-4 fill-slate-700 dark:fill-slate-300 stroke-none" />
                    </a>

                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Salam ${debtor.contact_person || debtor.client_name}, nous vous rappelons votre solde de ${debtor.remaining_debt.toFixed(0)} DH concernant les œufs.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/40 active:bg-green-100 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
                    >
                      <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </a>

                    <button
                      onClick={() => onOpenPayment(debtor)}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>{t('collectDebt')}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Historique simple */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto transition-colors">
          {(!paymentsList || paymentsList.length === 0) ? (
            <p className="text-center py-6 text-xs text-slate-400">{t('noClientsFound')}</p>
          ) : (
            paymentsList.map((p) => (
              <div key={p.id} className="p-3.5 flex justify-between items-center text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">{p.client_name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {p.payment_date}
                  </span>
                </div>

                <div className="text-right rtl:text-left">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    +{p.amount.toFixed(2)} {t('dh')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
