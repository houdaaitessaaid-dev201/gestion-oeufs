import React, { useState, useEffect } from 'react';
import { 
  History, ShoppingCart, Wallet, Calendar, 
  Package, AlertTriangle, Filter, Search 
} from 'lucide-react';
import { api } from '../api';

export default function HistoryView({ clients, users }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterClient, setFilterClient] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory({
        type: filterType,
        client_id: filterClient || undefined,
        date: filterDate || undefined
      });
      setItems(data);
    } catch (err) {
      console.error('Erreur historique:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filterType, filterClient, filterDate]);

  return (
    <div className="space-y-4 p-4 pb-28 max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Journal des Opérations</h2>
          <p className="text-xs text-slate-500 font-medium">Historique complet des transactions</p>
        </div>
        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
          <History className="w-5 h-5" />
        </div>
      </div>

      {/* Barre de filtres multicritères */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center space-x-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtres de recherche</span>
        </div>

        {/* Type d'opération */}
        <div className="grid grid-cols-5 gap-1 text-[11px] font-bold">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'sales', label: 'Ventes' },
            { id: 'payments', label: 'Paiements' },
            { id: 'visits', label: 'Visites' },
            { id: 'stock', label: 'Stock' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`py-1.5 px-1 rounded-lg border text-center transition ${
                filterType === t.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Par client */}
          <div>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="">Tous les clients</option>
              {clients?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Par date */}
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {(filterClient || filterDate || filterType !== 'all') && (
          <button
            onClick={() => {
              setFilterType('all');
              setFilterClient('');
              setFilterDate('');
            }}
            className="text-[11px] text-amber-600 font-bold hover:underline"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Liste chronologique unifiée */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Chargement de l'historique...
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Aucune opération trouvée pour ces critères.
          </div>
        ) : (
          items.map((item, idx) => {
            const isSale = item.event_type === 'sale';
            const isPayment = item.event_type === 'payment';
            const isVisit = item.event_type === 'visit';
            const isStockEntry = item.event_type === 'stock_entry';
            const isStockLoss = item.event_type === 'stock_loss';

            return (
              <div key={`${item.event_type}-${item.event_id}-${idx}`} className="p-3.5 flex items-start justify-between text-xs hover:bg-slate-50 transition">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    isSale ? 'bg-amber-100 text-amber-700' :
                    isPayment ? 'bg-emerald-100 text-emerald-700' :
                    isVisit ? 'bg-sky-100 text-sky-700' :
                    isStockEntry ? 'bg-indigo-100 text-indigo-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {isSale && <ShoppingCart className="w-4 h-4" />}
                    {isPayment && <Wallet className="w-4 h-4" />}
                    {isVisit && <Calendar className="w-4 h-4" />}
                    {isStockEntry && <Package className="w-4 h-4" />}
                    {isStockLoss && <AlertTriangle className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="font-bold text-slate-900">
                      {item.summary}
                    </div>
                    {item.client_name && (
                      <p className="text-[11px] text-slate-600 font-medium">
                        Client / Magasin : <span className="font-semibold text-slate-800">{item.client_name}</span>
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-slate-400 italic mt-0.5">{item.notes}</p>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                      {item.event_date} {item.user_name ? `• par ${item.user_name}` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  {item.total_amount != null && isSale && (
                    <span className="font-black text-slate-900 block">{item.total_amount.toFixed(2)} DH</span>
                  )}
                  {item.paid_amount != null && isPayment && (
                    <span className="font-black text-emerald-600 block">+{item.paid_amount.toFixed(2)} DH</span>
                  )}
                  {item.quantity != null && (
                    <span className="text-[10px] font-bold text-slate-500 block">
                      {item.quantity > 0 ? `+${item.quantity}` : item.quantity} œufs
                    </span>
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
