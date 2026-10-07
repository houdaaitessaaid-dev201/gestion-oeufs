import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Calendar, Users, 
  Package, ShoppingCart, Wallet, AlertCircle, ArrowUpRight
} from 'lucide-react';

export default function StatsView({ statsData, onOpenClientDetail }) {
  const [period, setPeriod] = useState('today'); // 'today', 'week', 'month'

  const {
    todaySales = { total_amount: 0, paid_amount: 0, remaining_amount: 0, total_eggs: 0, sales_count: 0 },
    weekSales = { total_amount: 0, paid_amount: 0, remaining_amount: 0, total_eggs: 0, sales_count: 0 },
    monthSales = { total_amount: 0, paid_amount: 0, remaining_amount: 0, total_eggs: 0, sales_count: 0 },
    topClients = [],
    last7Days = [],
    stockSummary = { current_stock: 0, total_purchased: 0, total_sold: 0, total_damaged: 0 }
  } = statsData || {};

  const currentStats = 
    period === 'today' ? todaySales :
    period === 'week' ? weekSales :
    monthSales;

  const recoveryRate = currentStats.total_amount > 0 
    ? Math.round((currentStats.paid_amount / currentStats.total_amount) * 100) 
    : 100;

  return (
    <div className="space-y-4 p-4 pb-28 max-w-3xl mx-auto">
      {/* En-tête avec sélecteur de période */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rapports & Statistiques</h2>
            <p className="text-xs text-slate-500 font-medium">Performance des ventes et distribution</p>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* Périodes */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'today', label: 'Aujourd\'hui' },
            { id: 'week', label: '7 derniers jours' },
            { id: 'month', label: 'Ce mois-ci' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`py-2 text-xs font-bold rounded-xl border transition ${
                period === p.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chiffres clés de la période */}
      <div className="grid grid-cols-2 gap-3">
        {/* Chiffre d'Affaires */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {currentStats.total_amount.toLocaleString('fr-FR')} <span className="text-sm font-bold">DH</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">{currentStats.sales_count} ventes effectuées</span>
        </div>

        {/* Quantité d'œufs vendus */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantité Vendue</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {currentStats.total_eggs.toLocaleString('fr-FR')}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">œufs (~{Math.floor(currentStats.total_eggs / 30)} plateaux)</span>
        </div>

        {/* Montant Payé / Encaissé */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Montant Encaissé</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {currentStats.paid_amount.toLocaleString('fr-FR')} <span className="text-sm font-bold">DH</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">Taux : {recoveryRate}%</span>
        </div>

        {/* Montant Restant à percevoir */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crédit Restant</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {currentStats.remaining_amount.toLocaleString('fr-FR')} <span className="text-sm font-bold">DH</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">non réglé sur cette période</span>
        </div>
      </div>

      {/* Évolution des 7 derniers jours (Visualisation simple en barres SVG adaptées mobile) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Évolution des Ventes (7 Derniers Jours)
        </h3>

        <div className="space-y-2">
          {last7Days.map((d) => {
            const maxEggs = Math.max(1, ...last7Days.map(x => x.eggs_sold));
            const barWidth = Math.max(5, Math.round((d.eggs_sold / maxEggs) * 100));

            const dayLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(new Date(d.day));

            return (
              <div key={d.day} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="capitalize">{dayLabel}</span>
                  <span>
                    <b className="text-slate-900">{d.eggs_sold}</b> œufs • <span className="text-emerald-600">{d.total_sales} DH</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 Clients les plus actifs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Clients les Plus Actifs (Volume)
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {topClients.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">Aucune vente enregistrée.</p>
          ) : (
            topClients.map((c, index) => (
              <div 
                key={c.id} 
                onClick={() => onOpenClientDetail && onOpenClientDetail(c.id)}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{c.name}</h4>
                    {c.contact_person && <p className="text-[11px] text-slate-400">{c.contact_person}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-slate-900 block">{c.total_eggs_bought} œufs</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">{c.total_revenue.toFixed(2)} DH</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
