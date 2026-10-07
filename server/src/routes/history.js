import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { type, client_id, user_id, date, limit = 150 } = req.query;

    let items = [];

    // 1. Ventes / Livraisons
    if (!type || type === 'all' || type === 'sales') {
      let salesSql = `
        SELECT 
          'sale' as event_type,
          s.id as event_id,
          s.sale_date as event_date,
          s.client_id,
          c.name as client_name,
          s.user_id,
          u.name as user_name,
          s.quantity,
          s.unit_price,
          s.total_amount,
          s.paid_amount,
          s.remaining_amount,
          s.notes,
          'Livraison de ' || s.quantity || ' œufs (' || s.total_amount || ' DH)' as summary
        FROM sales s
        JOIN clients c ON s.client_id = c.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      if (client_id) {
        salesSql += ` AND s.client_id = ?`;
        params.push(client_id);
      }
      if (user_id) {
        salesSql += ` AND s.user_id = ?`;
        params.push(user_id);
      }
      if (date) {
        salesSql += ` AND date(s.sale_date) = date(?)`;
        params.push(date);
      }
      salesSql += ` ORDER BY s.sale_date DESC LIMIT ?`;
      params.push(limit);
      const salesRows = query(salesSql, params);
      items.push(...salesRows);
    }

    // 2. Règlements / Paiements
    if (!type || type === 'all' || type === 'payments') {
      let paySql = `
        SELECT 
          'payment' as event_type,
          p.id as event_id,
          p.payment_date as event_date,
          p.client_id,
          c.name as client_name,
          p.user_id,
          u.name as user_name,
          NULL as quantity,
          NULL as unit_price,
          p.amount as total_amount,
          p.amount as paid_amount,
          0 as remaining_amount,
          p.notes,
          'Encaissement de ' || p.amount || ' DH (' || p.payment_method || ')' as summary
        FROM payments p
        JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      if (client_id) {
        paySql += ` AND p.client_id = ?`;
        params.push(client_id);
      }
      if (user_id) {
        paySql += ` AND p.user_id = ?`;
        params.push(user_id);
      }
      if (date) {
        paySql += ` AND date(p.payment_date) = date(?)`;
        params.push(date);
      }
      paySql += ` ORDER BY p.payment_date DESC LIMIT ?`;
      params.push(limit);
      const payRows = query(paySql, params);
      items.push(...payRows);
    }

    // 3. Visites
    if (!type || type === 'all' || type === 'visits') {
      let visitSql = `
        SELECT 
          'visit' as event_type,
          v.id as event_id,
          (v.visit_date || ' ' || COALESCE(v.visit_time, '00:00') || ':00') as event_date,
          v.client_id,
          c.name as client_name,
          v.user_id,
          u.name as user_name,
          NULL as quantity,
          NULL as unit_price,
          NULL as total_amount,
          NULL as paid_amount,
          NULL as remaining_amount,
          v.notes,
          'Visite client: ' || CASE WHEN v.status = 'visited' THEN 'Effectuée' ELSE 'Non visité' END as summary
        FROM visits v
        JOIN clients c ON v.client_id = c.id
        LEFT JOIN users u ON v.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      if (client_id) {
        visitSql += ` AND v.client_id = ?`;
        params.push(client_id);
      }
      if (user_id) {
        visitSql += ` AND v.user_id = ?`;
        params.push(user_id);
      }
      if (date) {
        visitSql += ` AND v.visit_date = date(?)`;
        params.push(date);
      }
      visitSql += ` ORDER BY v.visit_date DESC, v.created_at DESC LIMIT ?`;
      params.push(limit);
      const visitRows = query(visitSql, params);
      items.push(...visitRows);
    }

    // 4. Mouvements de stock (entrées ou pertes)
    if (!type || type === 'all' || type === 'stock') {
      let stockSql = `
        SELECT 
          CASE 
            WHEN sm.movement_type = 'in_purchase' THEN 'stock_entry'
            WHEN sm.movement_type = 'loss_damage' THEN 'stock_loss'
            ELSE 'stock_movement'
          END as event_type,
          sm.id as event_id,
          sm.movement_date as event_date,
          NULL as client_id,
          COALESCE(sm.supplier, 'Stock Interne') as client_name,
          sm.user_id,
          u.name as user_name,
          sm.quantity,
          sm.unit_price,
          NULL as total_amount,
          NULL as paid_amount,
          NULL as remaining_amount,
          sm.notes,
          CASE 
            WHEN sm.movement_type = 'in_purchase' THEN 'Achat: +' || sm.quantity || ' œufs (' || COALESCE(sm.supplier, 'Fournisseur') || ')'
            WHEN sm.movement_type = 'loss_damage' THEN 'Casse/Perte: ' || sm.quantity || ' œufs'
            ELSE 'Mouvement stock: ' || sm.quantity || ' œufs'
          END as summary
        FROM stock_movements sm
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE sm.movement_type != 'out_sale'
      `;
      const params = [];
      if (user_id) {
        stockSql += ` AND sm.user_id = ?`;
        params.push(user_id);
      }
      if (date) {
        stockSql += ` AND date(sm.movement_date) = date(?)`;
        params.push(date);
      }
      stockSql += ` ORDER BY sm.movement_date DESC LIMIT ?`;
      params.push(limit);
      const stockRows = query(stockSql, params);
      items.push(...stockRows);
    }

    // Sort all combined items by event_date DESC
    items.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    res.json(items.slice(0, parseInt(limit, 10)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
