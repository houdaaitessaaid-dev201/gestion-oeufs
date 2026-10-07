import React, { useState } from 'react';
import { 
  Check, Clock, Phone, MessageCircle, MapPin, 
  ShoppingCart, Search, UserPlus, X, Plus, Trash2, RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TodayTourView({ 
  todayVisits, 
  allClients = [],
  onMarkVisited, 
  onOpenSale, 
  onOpenClientDetail,
  onAddToTour,
  onRemoveFromTour,
  onClearTour,
  onOpenClientModal,
  currentEggPrice = 1.35
}) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('pending'); // 'pending', 'visited', 'all'
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalQuantities, setModalQuantities] = useState({});

  const { summary = { total: 0, visited: 0, pending: 0 }, visits = [] } = todayVisits || {};

  // IDs of clients already in today's tour
  const scheduledClientIds = new Set(visits.map(v => v.client_id));

  // Filtered visits for the main list
  const filteredVisits = visits.filter(v => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? v.visit_status !== 'visited' :
      v.visit_status === 'visited';

    const matchesSearch = 
      v.client_name.toLowerCase().includes(search.toLowerCase()) ||
      (v.contact_person && v.contact_person.toLowerCase().includes(search.toLowerCase())) ||
      (v.address && v.address.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Filtered clients for the "Add who called" modal
  const filteredAvailableClients = allClients.filter(c => {
    return c.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      (c.contact_person && c.contact_person.toLowerCase().includes(modalSearch.toLowerCase())) ||
      (c.phone && c.phone.includes(modalSearch));
  });

  return (
    <div className="space-y-4 p-4 pb-28 max-w-2xl mx-auto">
      {/* BOUTON PRINCIPAL : AJOUTER UN CLIENT & VIDER LA LISTE */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">{t('tourTitle')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('tourSubtitle')}</p>
          </div>
          <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            {summary.visited} / {summary.total} {t('done')}
          </span>
        </div>

        {/* Boutons d'actions rapides : Ajouter & Vider la liste */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              setModalSearch('');
              setShowAddModal(true);
            }}
            className="flex-1 py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-sm rounded-2xl shadow-sm transition flex items-center justify-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>{t('addShopToTour')}</span>
          </button>

          {summary.total > 0 && onClearTour && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="py-3.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-900/80 font-black text-sm rounded-2xl shadow-xs transition active:scale-98 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
              <span>{t('clearTourBtn')}</span>
            </button>
          )}
        </div>

        {/* 3 Filtres faciles */}
        {summary.total > 0 && (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => setFilter('pending')}
              className={`py-2 text-xs font-extrabold rounded-xl border text-center transition active:scale-95 ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              ⏳ {t('pendingFilter')} ({summary.pending})
            </button>
            <button
              onClick={() => setFilter('visited')}
              className={`py-2 text-xs font-extrabold rounded-xl border text-center transition active:scale-95 ${
                filter === 'visited'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              ✅ {t('visitedFilter')} ({summary.visited})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`py-2 text-xs font-bold rounded-xl border text-center transition active:scale-95 ${
                filter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {t('allFilter')} ({summary.total})
            </button>
          </div>
        )}
      </div>

      {/* Liste des magasins dans la tournée */}
      <div className="space-y-3">
        {visits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-3 shadow-2xs">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              📋
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('noVisitsToday')}</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition"
            >
              {t('addShopToTour')}
            </button>
          </div>
        ) : filteredVisits.length === 0 ? (
          filter === 'pending' ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-6 text-center rounded-3xl border-2 border-emerald-300 dark:border-emerald-800 space-y-3 shadow-2xs">
              <div className="text-3xl">🎉</div>
              <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                {t('allVisitedCongrats')}
              </h3>
              {onClearTour && (
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-sm transition active:scale-95 flex items-center justify-center space-x-2 rtl:space-x-reverse mx-auto"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('startNewTour')} ({t('clearTourBtn')})</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-medium">
              {t('noClientsFound')}
            </div>
          )
        ) : (
          filteredVisits.map((item) => {
            const isVisited = item.visit_status === 'visited';
            const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
            const cleanWhatsapp = (item.whatsapp || item.phone || '').replace(/[^0-9]/g, '');
            const debt = Math.max(0, Math.round((item.remaining_debt || 0) * 100) / 100);
            const qty = item.ordered_quantity > 0 ? item.ordered_quantity : (item.usual_quantity || 0);
            const unitPrice = item.default_price || currentEggPrice || 1.35;
            const totalOrderAmount = Math.round(qty * unitPrice * 100) / 100;
            const totalWithDebt = Math.round((totalOrderAmount + debt) * 100) / 100;

            return (
              <div 
                key={item.visit_id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-4 border transition shadow-xs ${
                  isVisited 
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/15 dark:bg-emerald-950/10' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Ligne 1 : Nom et Statut */}
                <div className="flex items-start justify-between">
                  <div 
                    onClick={() => onOpenClientDetail(item.client_id)}
                    className="cursor-pointer group flex-1"
                  >
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition leading-tight">
                      {item.client_name}
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.contact_person && <span>{item.contact_person}</span>}
                      {item.contact_person && <span>•</span>}
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                    {isVisited ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1 stroke-[3]" />
                        <span>{t('done')} {item.visit_time ? `(${item.visit_time})` : ''}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1 stroke-[2.5]" />
                        <span>{t('pendingFilter')}</span>
                      </span>
                    )}

                    {/* Bouton pour retirer cette visite de la liste (disponible pour tous) */}
                    {onRemoveFromTour && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromTour(item.visit_id || item.id || item.client_id, item.client_name);
                        }}
                        className="py-1 px-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition active:scale-95 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 text-xs font-black"
                        title={t('removeFromTour')}
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Ligne 2 : Commande du jour & Montant & Crédit */}
                <div className="mt-2.5 py-3 px-3.5 bg-amber-50/90 dark:bg-slate-800/80 border-2 border-amber-300/80 dark:border-slate-700 rounded-2xl space-y-2.5 text-xs shadow-2xs">
                  {/* Commande & Crédit */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse flex-wrap gap-y-1">
                      <span className="text-amber-950 dark:text-amber-100 font-black text-sm">
                        📦 {t('order')} : {qty} {t('eggs')}
                      </span>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300/60 dark:border-amber-800">
                        ~{Math.floor(qty / 30)} {t('plateaux')}
                      </span>
                    </div>

                    {debt > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400 font-extrabold bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 text-xs">
                        {t('credit')} : {debt.toFixed(0)} {t('dh')}
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900 text-xs">
                        {t('noCredit')}
                      </span>
                    )}
                  </div>

                  {/* Montant de la commande */}
                  <div className="pt-2 border-t border-amber-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 font-black text-xs block">
                        {t('amountToPay')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                        ({qty} {t('eggs')} × {unitPrice.toFixed(2)} {t('dh')})
                      </span>
                    </div>

                    <div className="text-right rtl:text-left">
                      <span className="text-base sm:text-lg font-black text-amber-950 dark:text-white bg-amber-200 dark:bg-amber-600 px-3 py-1 rounded-xl border border-amber-400 dark:border-amber-500 inline-block shadow-xs">
                        {totalOrderAmount.toFixed(2)} {t('dh')}
                      </span>
                      {debt > 0 && (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-black block mt-1">
                          {t('withCredit')} {totalWithDebt.toFixed(2)} {t('dh')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ligne 3 : BOUTONS APPEL ET WHATSAPP CLAIRS */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2.5 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 active:bg-emerald-100 text-slate-800 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 font-extrabold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition"
                  >
                    <Phone className="w-4 h-4 fill-emerald-600 text-emerald-600 stroke-none" />
                    <span>{t('call')}</span>
                  </a>

                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Salam ${item.contact_person || item.client_name}, nous arrivons pour la livraison.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2.5 px-3 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 active:bg-green-200 text-green-900 dark:text-green-300 font-extrabold text-xs rounded-xl border border-green-200 dark:border-green-800 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600 fill-green-600" />
                    <span>{t('whatsapp')}</span>
                  </a>
                </div>

                {/* Ligne 4 : Fait, Vendre/Livrer */}
                <div className="mt-2 flex items-center gap-2">
                  {!isVisited && (
                    <button
                      onClick={() => onMarkVisited(item)}
                      className="py-3 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center space-x-1 rtl:space-x-reverse"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{t('done')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenSale(item)}
                    className={`flex-1 py-3 px-4 font-black text-xs rounded-2xl shadow-sm transition active:scale-95 flex items-center justify-center space-x-1.5 rtl:space-x-reverse ${
                      isVisited 
                        ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isVisited ? t('anotherSale') : `${t('sellDeliver')} (${totalOrderAmount.toFixed(0)} ${t('dh')})`}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Bouton pour vider la liste au bas de la page */}
        {visits.length > 1 && onClearTour && (
          <div className="pt-3 pb-2 text-center">
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="py-3 px-6 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 active:scale-95 text-rose-700 dark:text-rose-300 border-2 border-rose-200 dark:border-rose-900 rounded-2xl text-xs font-black transition inline-flex items-center space-x-2 rtl:space-x-reverse shadow-2xs"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
              <span>{t('clearTourList')}</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL : SÉLECTIONNER UN CLIENT QUI A APPELÉ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col transition-colors">
            <div className="bg-amber-600 dark:bg-slate-800 px-5 py-3.5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">{t('whoIsCalling')}</h3>
                <p className="text-xs text-amber-100 dark:text-slate-400 font-medium">{t('selectShopToAdd')}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-amber-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recherche magasin */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchClientPlaceholder')}
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Bouton pour créer et ajouter un NOUVEAU magasin direct */}
            <div className="px-4 py-2.5 bg-amber-50 dark:bg-slate-800/60 border-b border-amber-200/70 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-amber-950 dark:text-amber-300 font-bold">
                {t('newShopCalling')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  if (onOpenClientModal) onOpenClientModal();
                }}
                className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-1 rtl:space-x-reverse"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('newClientBtn')}</span>
              </button>
            </div>

            {/* Liste des magasins */}
            <div className="p-3 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 flex-1">
              {filteredAvailableClients.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">{t('noClientsFound')}</p>
              ) : (
                filteredAvailableClients.map((client) => {
                  const alreadyInTour = scheduledClientIds.has(client.id);

                  return (
                    <div 
                      key={client.id}
                      className="py-3 px-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 last:border-0 space-y-2 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-tight">
                            {client.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {client.contact_person ? `${client.contact_person} • ` : ''}{client.phone}
                          </span>
                        </div>

                        {alreadyInTour && (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                            ✅ {t('done')}
                          </span>
                        )}
                      </div>

                      {!alreadyInTour && (
                        <div className="bg-amber-50/70 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-200/80 dark:border-slate-700 space-y-1.5">
                          <div className="flex items-center gap-2">
                            {/* Champ numérique direct */}
                            <div className="relative w-24">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={modalQuantities[client.id] !== undefined ? modalQuantities[client.id] : (client.usual_quantity || 150)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setModalQuantities(prev => ({ ...prev, [client.id]: val }));
                                }}
                                className="w-full py-1.5 px-2 text-center bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-slate-600 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>

                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('eggs')}</span>

                            {/* Bouton d'ajout direct */}
                            <button
                              type="button"
                              onClick={async () => {
                                const rawQty = modalQuantities[client.id] !== undefined ? modalQuantities[client.id] : (client.usual_quantity || 150);
                                const qty = parseInt(rawQty, 10) || client.usual_quantity || 150;
                                await onAddToTour(client.id, client.name, qty);
                                setShowAddModal(false);
                              }}
                              className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1 rtl:space-x-reverse"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{t('addToTodayTour')}</span>
                            </button>
                          </div>

                          {/* Aperçu du prix calculé */}
                          <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-slate-700">
                            <span>
                              {parseInt(modalQuantities[client.id] !== undefined ? modalQuantities[client.id] : (client.usual_quantity || 150), 10) || 0} {t('eggs')} × {(client.default_price || currentEggPrice || 1.35).toFixed(2)} {t('dh')}
                            </span>
                            <span className="font-black text-xs text-amber-950 dark:text-white bg-amber-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                              = {(Math.round((parseInt(modalQuantities[client.id] !== undefined ? modalQuantities[client.id] : (client.usual_quantity || 150), 10) || 0) * (client.default_price || currentEggPrice || 1.35) * 100) / 100).toFixed(2)} {t('dh')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Vider la Tournée */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-2xl">
              🗑️
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t('clearTourModalTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('clearTourModalDesc')}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  setShowClearModal(false);
                  if (onClearTour) await onClearTour('all');
                }}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-sm transition flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <span>{t('clearAllTourBtn')}</span>
              </button>

              {summary.visited > 0 && summary.pending > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    setShowClearModal(false);
                    if (onClearTour) await onClearTour('visited');
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-750 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 font-black text-xs rounded-2xl transition active:scale-95"
                >
                  <span>{t('clearVisitedOnlyBtn')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
