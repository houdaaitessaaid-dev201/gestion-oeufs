import express from 'express';
import { query, get } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    // 1. Ventes du jour, semaine, mois
    const todaySales = get(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(remaining_amount), 0) as remaining_amount,
        COALESCE(SUM(quantity), 0) as total_eggs,
        COUNT(*) as sales_count
      FROM sales 
      WHERE date(sale_date) = date('now', 'localtime')
    `);

    const weekSales = get(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(remaining_amount), 0) as remaining_amount,
        COALESCE(SUM(quantity), 0) as total_eggs,
        COUNT(*) as sales_count
      FROM sales 
      WHERE date(sale_date) >= date('now', 'localtime', '-7 days')
    `);

    const monthSales = get(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(remaining_amount), 0) as remaining_amount,
        COALESCE(SUM(quantity), 0) as total_eggs,
        COUNT(*) as sales_count
      FROM sales 
      WHERE strftime('%Y-%m', sale_date) = strftime('%Y-%m', 'now', 'localtime')
    `);

    // 2. Clients les plus actifs (Top 5 par quantité et chiffre d'affaires)
    const topClients = query(`
      SELECT 
        c.id,
        c.name,
        c.contact_person,
        c.phone,
        COALESCE(SUM(s.quantity), 0) as total_eggs_bought,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COALESCE((
          SELECT SUM(s2.total_amount) FROM sales s2 WHERE s2.client_id = c.id
        ), 0) -
        COALESCE((
          SELECT SUM(p2.amount) FROM payments p2 WHERE p2.client_id = c.id
        ), 0) as current_debt
      FROM clients c
      JOIN sales s ON c.id = s.client_id
      GROUP BY c.id
      ORDER BY total_eggs_bought DESC
      LIMIT 5
    `);

    // 3. Évolution des 7 derniers jours (quantités d'œufs vendues et encaissé)
    const last7Days = query(`
      WITH RECURSIVE dates(date_val) AS (
        SELECT date('now', 'localtime', '-6 days')
        UNION ALL
        SELECT date(date_val, '+1 day')
        FROM dates
        WHERE date_val < date('now', 'localtime')
      )
      SELECT 
        d.date_val as day,
        COALESCE(SUM(s.quantity), 0) as eggs_sold,
        COALESCE(SUM(s.total_amount), 0) as total_sales,
        COALESCE((
          SELECT SUM(p.amount) FROM payments p WHERE date(p.payment_date) = d.date_val
        ), 0) as total_paid
      FROM dates d
      LEFT JOIN sales s ON date(s.sale_date) = d.date_val
      GROUP BY d.date_val
      ORDER BY d.date_val ASC
    `);

    // 4. Résumé global du stock
    const stockSummary = get(`
      SELECT 
        COALESCE(SUM(quantity), 0) as current_stock,
        COALESCE(SUM(CASE WHEN movement_type = 'in_purchase' THEN quantity ELSE 0 END), 0) as total_purchased,
        COALESCE(SUM(CASE WHEN movement_type = 'out_sale' THEN ABS(quantity) ELSE 0 END), 0) as total_sold,
        COALESCE(SUM(CASE WHEN movement_type = 'loss_damage' THEN ABS(quantity) ELSE 0 END), 0) as total_damaged
      FROM stock_movements
    `);

    res.json({
      todaySales,
      weekSales,
      monthSales,
      topClients,
      last7Days,
      stockSummary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
