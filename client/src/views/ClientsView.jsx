import React, { useState } from 'react';
import { 
  UserPlus, Search, Phone, MessageCircle, MapPin, 
  Wallet, ShoppingCart, FileText, Plus, Check, Truck, X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ClientsView({ 
  clients, 
  scheduledClientVisits = new Map(),
  onOpenClientDetail, 
  onOpenClientModal, 
  onOpenPayment, 
  onOpenSale,
  onAddToTour,
  onRemoveFromTour,
  currentEggPrice = 1.35,
  onOpenPriceModal
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [customQuantities, setCustomQuantities] = useState({});

  const filteredClients = (clients || []).filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_person && c.contact_person.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search)) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()));

    const matchesDebt = filterDebtOnly ? (c.remaining_debt > 0) : true;
    return matchesSearch && matchesDebt;
  });

  return (
    <div className="space-y-4 p-4 pb-28 max-w-2xl mx-auto">
      {/* Barre supérieure : Titre et Grand bouton Ajouter Client */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">{t('clientsTitle')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('clientsSubtitle')}</p>
          </div>
          <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            {clients?.length || 0}
          </span>
        </div>

        {/* Gros bouton d'ajout de nouveau client bien visible */}
        <button
          onClick={() => onOpenClientModal(null)}
          className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-sm rounded-2xl shadow-sm transition flex items-center justify-center space-x-2 rtl:space-x-reverse"
        >
          <UserPlus className="w-5 h-5 stroke-[2.5]" />
          <span>{t('newClientBtn')}</span>
        </button>

        {/* Bandeau Prix du Jour des Œufs */}
        <div className="bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 rounded-2xl p-2.5 px-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-base">🥚</span>
            <span className="font-bold text-amber-950 dark:text-amber-200">
              {t('todayEggPrice')} <strong className="font-black text-slate-900 dark:text-white">{(currentEggPrice || 1.35).toFixed(2)} {t('dh')}</strong> / {t('egg')} (~{((currentEggPrice || 1.35) * 30).toFixed(2)} {t('plateauEstimate')})
            </span>
          </div>
          {onOpenPriceModal && (
            <button
              onClick={onOpenPriceModal}
              className="py-1 px-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-[11px] rounded-lg shadow-2xs transition"
            >
              ✏️ {t('changePrice')}
            </button>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtre */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 transition-colors">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchClientPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterDebtOnly(false)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              !filterDebtOnly
                ? 'bg-slate-900 dark:bg-slate-700 text-white'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t('allFilter')} ({clients?.length || 0})
          </button>
          <button
            onClick={() => setFilterDebtOnly(true)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              filterDebtOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t('shopsWithDebt')}
          </button>
        </div>
      </div>

      {/* Liste des cartes clients */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-medium">
            {t('noClientsFound')}
          </div>
        ) : (
          filteredClients.map((client) => {
            const debt = Math.max(0, Math.round((client.remaining_debt || 0) * 100) / 100);
            const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
            const cleanWhatsapp = (client.whatsapp || client.phone || '').replace(/[^0-9]/g, '');
            const mapsQuery = client.coordinates || encodeURIComponent(`${client.address} ${client.name}`);

            const visit = scheduledClientVisits.get(client.id);
            const inTour = !!visit;
            const isVisited = visit?.status === 'visited' || visit?.visit_status === 'visited';
            const orderedQty = visit?.ordered_quantity > 0 ? visit.ordered_quantity : client.usual_quantity;

            return (
              <div 
                key={client.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors"
              >
                {/* Ligne 1 : Nom du magasin & Crédit */}
                <div 
                  onClick={() => onOpenClientDetail(client.id)}
                  className="flex items-start justify-between cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition leading-tight">
                      {client.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {client.contact_person ? `${client.contact_person} • ` : ''}
                      <span className="font-bold text-slate-700 dark:text-slate-300">{client.phone}</span>
                    </p>
                    {client.address && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                        📍 {client.address}
                      </p>
                    )}
                  </div>

                  <div className="text-right rtl:text-left shrink-0">
                    {debt > 0 ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        {t('credit')} : {debt.toFixed(0)} {t('dh')}
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        {t('noCredit')}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 font-medium">
                      {(client.default_price || currentEggPrice || 1.35).toFixed(2)} {t('dh')} / {t('egg')}
                    </span>
                  </div>
                </div>

                {/* Ligne 2 : CHOIX DIRECT DU NOMBRE D'ŒUFS + BOUTON AJOUTER */}
                <div>
                  {inTour ? (
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/20 p-3 rounded-2xl border-2 border-emerald-400/90 dark:border-emerald-800 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                            <span className="text-xs font-black text-emerald-950 dark:text-emerald-300">
                              {isVisited ? `✅ ${t('done')} :` : `${t('tabTour')} :`}
                            </span>
                          </div>
                          <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 ml-5.5 rtl:ml-0 rtl:mr-5.5 block mt-0.5">
                            📦 {orderedQty} {t('eggs')} (~{Math.floor(orderedQty / 30)} {t('plateaux')})
                          </span>
                        </div>

                        {onRemoveFromTour && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromTour(visit.visit_id || visit.id || client.id, client.name);
                            }}
                            className="py-1.5 px-3 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 rounded-xl text-xs font-black transition active:scale-95 shadow-2xs"
                            title={t('removeFromTour')}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Montant à payer */}
                      <div className="pt-1.5 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                        <span className="text-emerald-950 dark:text-emerald-200 font-bold text-[11px]">
                          {t('amountToPay')} ({orderedQty} {t('eggs')} × {(client.default_price || currentEggPrice || 1.35).toFixed(2)} {t('dh')})
                        </span>
                        <span className="text-sm font-black text-emerald-900 dark:text-white bg-white/90 dark:bg-slate-800 px-2.5 py-0.5 rounded-xl border border-emerald-300 dark:border-slate-700 shadow-2xs">
                          {(Math.round(orderedQty * (client.default_price || currentEggPrice || 1.35) * 100) / 100).toFixed(2)} {t('dh')}
                        </span>
                      </div>

                      {/* Bouton Vendre / Livrer */}
                      <button
                        type="button"
                        onClick={() => onOpenSale(client)}
                        className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
                      >
                        <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                        <span>
                          {isVisited 
                            ? t('anotherSale') 
                            : `${t('sellDeliver')} (${orderedQty} ${t('eggs')} • ${(Math.round(orderedQty * (client.default_price || currentEggPrice || 1.35) * 100) / 100).toFixed(0)} ${t('dh')})`}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-50/70 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-amber-200/80 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center gap-2">
                        {/* Champ numérique direct */}
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse shrink-0">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={customQuantities[client.id] !== undefined ? customQuantities[client.id] : (client.usual_quantity || 150)}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomQuantities(prev => ({ ...prev, [client.id]: val }));
                            }}
                            className="w-24 py-2 px-2 text-center bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-slate-600 rounded-xl text-base font-black text-slate-900 dark:text-white focus:outline-none"
                          />
                          <span className="text-xs font-black text-slate-600 dark:text-slate-400">{t('eggs')}</span>
                        </div>

                        {/* Bouton d'ajout direct */}
                        <button
                          type="button"
                          onClick={() => {
                            const rawQty = customQuantities[client.id] !== undefined ? customQuantities[client.id] : (client.usual_quantity || 150);
                            const qty = parseInt(rawQty, 10) || client.usual_quantity || 150;
                            onAddToTour(client.id, client.name, qty);
                          }}
                          className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>{t('addToTodayTour')}</span>
                        </button>
                      </div>

                      {/* Calcul du montant selon le prix du jour */}
                      <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-slate-700">
                        <span>
                          {parseInt(customQuantities[client.id] !== undefined ? customQuantities[client.id] : (client.usual_quantity || 150), 10) || 0} {t('eggs')} × {(client.default_price || currentEggPrice || 1.35).toFixed(2)} {t('dh')}
                        </span>
                        <span className="font-black text-xs text-amber-950 dark:text-white bg-amber-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                          = {(Math.round((parseInt(customQuantities[client.id] !== undefined ? customQuantities[client.id] : (client.usual_quantity || 150), 10) || 0) * (client.default_price || currentEggPrice || 1.35) * 100) / 100).toFixed(2)} {t('dh')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ligne 3 : BOUTONS APPEL ET WHATSAPP */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2.5 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 active:bg-emerald-100 text-slate-800 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 font-extrabold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition"
                  >
                    <Phone className="w-4 h-4 fill-emerald-600 text-emerald-600 stroke-none" />
                    <span>{t('call')}</span>
                  </a>

                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Salam ${client.contact_person || client.name}, c'est votre livreur d'œufs.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2.5 px-3 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 active:bg-green-200 text-green-900 dark:text-green-300 font-extrabold text-xs rounded-xl border border-green-200 dark:border-green-800 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600 fill-green-600" />
                    <span>{t('whatsapp')}</span>
                  </a>
                </div>

                {/* Ligne 4 : Actions secondaires : Fiche client, Encaisser */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenClientDetail(client.id)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-bold"
                    title={t('clientSheet')}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t('clientSheet')}</span>
                  </button>

                  {debt > 0 && (
                    <button
                      onClick={() => onOpenPayment(client)}
                      className="py-2 px-3 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 active:scale-95 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-black transition flex items-center space-x-1 rtl:space-x-reverse"
                    >
                      <Wallet className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                      <span>{t('collectDebt')} {debt.toFixed(0)} {t('dh')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
