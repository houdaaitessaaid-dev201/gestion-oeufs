import express from 'express';
import { query, get, run } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Stock actuel
    const stockRow = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`);
    const currentStock = stockRow ? stockRow.stock : 0;

    // 2. Nombre de clients
    const clientCountRow = get(`SELECT COUNT(*) as count FROM clients`);
    const totalClients = clientCountRow ? clientCountRow.count : 0;

    // 3, 4, 5. Visites du jour
    const visitsStats = get(`
      SELECT 
        COUNT(*) as total_to_visit,
        COALESCE(SUM(CASE WHEN status = 'visited' THEN 1 ELSE 0 END), 0) as visited_count,
        COALESCE(SUM(CASE WHEN status != 'visited' THEN 1 ELSE 0 END), 0) as remaining_count
      FROM visits 
      WHERE visit_date = ?
    `, [today]);

    // 6. Total payé aujourd'hui
    const paidTodayRow = get(`
      SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM payments 
      WHERE date(payment_date) = date('now', 'localtime')
    `);

    // 7. Total restant à récupérer (somme des dettes positives de tous les clients)
    const debtRow = get(`
      SELECT COALESCE(SUM(remaining), 0) as total_debt
      FROM (
        SELECT (
          COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) -
          COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0)
        ) as remaining
        FROM clients c
      )
      WHERE remaining > 0
    `);

    // 8. Ventes et quantité d'œufs distribuée aujourd'hui
    const salesToday = query(`
      SELECT quantity, unit_price, total_amount
      FROM sales
      WHERE date(sale_date) = date('now', 'localtime')
    `);

    const eggsDistributedToday = salesToday.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const totalSalesToday = Math.round(salesToday.reduce((sum, s) => sum + (s.total_amount || 0), 0) * 100) / 100;

    // 9. Prix d'achat de référence et calcul du Bénéfice Net du jour
    const sellPriceRow = get(`SELECT value FROM app_settings WHERE key = 'current_egg_price'`);
    const currentSellPrice = sellPriceRow ? parseFloat(sellPriceRow.value) : 1.35;

    const purchasePriceRow = get(`SELECT value FROM app_settings WHERE key = 'current_purchase_price'`);
    let currentPurchasePrice = purchasePriceRow ? parseFloat(purchasePriceRow.value) : null;
    if (!currentPurchasePrice || isNaN(currentPurchasePrice) || currentPurchasePrice >= currentSellPrice) {
      // Marge par défaut de ~0.20 DH par œuf (ex: 0.80 si vendu à 1.00, ou 1.15 si vendu à 1.35)
      currentPurchasePrice = Math.max(0.10, Math.round((currentSellPrice - 0.20) * 100) / 100);
    }

    // Coût d'achat des œufs vendus aujourd'hui
    const costOfGoodsSold = eggsDistributedToday * currentPurchasePrice;
    const todayProfit = Math.max(0, Math.round((totalSalesToday - costOfGoodsSold) * 100) / 100);

    res.json({
      currentStock,
      totalClients,
      visitsToday: {
        toVisit: visitsStats ? visitsStats.total_to_visit : 0,
        visited: visitsStats ? visitsStats.visited_count : 0,
        remaining: visitsStats ? visitsStats.remaining_count : 0
      },
      totalPaidToday: paidTodayRow ? paidTodayRow.total_paid : 0,
      totalDebtToRecover: debtRow ? debtRow.total_debt : 0,
      eggsDistributedToday,
      totalSalesToday,
      todayProfit,
      currentPurchasePrice,
      currentSellPrice
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
