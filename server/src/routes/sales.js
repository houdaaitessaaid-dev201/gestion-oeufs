import express from 'express';
import { query, get, run, transaction } from '../db.js';

const router = express.Router();

// Enregistrer une vente / livraison
router.post('/', (req, res) => {
  try {
    const {
      client_id,
      user_id = 1,
      quantity,
      unit_price,
      paid_amount = 0,
      notes = ''
    } = req.body;

    const clientId = parseInt(client_id, 10);
    const qty = parseInt(quantity, 10);
    const price = parseFloat(unit_price);
    const paid = parseFloat(paid_amount) || 0;

    if (!clientId) {
      return res.status(400).json({ error: 'Client obligatoire' });
    }
    if (!qty || qty <= 0) {
      return res.status(400).json({ error: 'La quantité doit être supérieure à 0' });
    }
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Le prix unitaire doit être valide' });
    }

    const totalAmount = Math.round((qty * price) * 100) / 100;
    const remainingAmount = Math.round((totalAmount - paid) * 100) / 100;

    // Transaction atomique pour garantir la cohérence
    const result = transaction(() => {
      // 1. Enregistrer la vente
      const saleResult = run(`
        INSERT INTO sales (client_id, user_id, quantity, unit_price, total_amount, paid_amount, remaining_amount, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [clientId, user_id, qty, price, totalAmount, paid, remainingAmount, notes || 'Livraison standard']);

      const saleId = saleResult.lastInsertRowid;

      // 2. Déduire le stock automatiquement
      run(`
        INSERT INTO stock_movements (movement_type, quantity, unit_price, related_sale_id, user_id, notes)
        VALUES ('out_sale', ?, ?, ?, ?, ?)
      `, [-qty, price, saleId, user_id, `Vente #${saleId} (Qté: ${qty})`]);

      // 3. Enregistrer le paiement immédiat s'il y a lieu
      if (paid > 0) {
        run(`
          INSERT INTO payments (client_id, sale_id, user_id, amount, payment_method, notes)
          VALUES (?, ?, ?, ?, 'cash', 'Paiement direct à la livraison')
        `, [clientId, saleId, user_id, paid]);
      }

      // 4. Mettre à jour la visite du jour si elle existe
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      run(`
        UPDATE visits 
        SET status = 'visited', visit_time = ?, sale_id = ?, user_id = ?
        WHERE client_id = ? AND visit_date = ?
      `, [timeStr, saleId, user_id, clientId, today]);

      return saleId;
    });

    // Calculer les nouvelles valeurs mises à jour
    const clientDebt = get(`
      SELECT (
        COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = ?), 0) -
        COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = ?), 0)
      ) as debt
    `, [clientId, clientId])?.debt || 0;

    const currentStock = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`)?.stock || 0;

    res.status(201).json({
      success: true,
      message: 'Vente et livraison enregistrées avec succès',
      saleId: result,
      totalAmount,
      paidAmount: paid,
      remainingAmount,
      newClientDebt: clientDebt,
      newStock: currentStock
    });
  } catch (error) {
    console.error('Erreur vente:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
