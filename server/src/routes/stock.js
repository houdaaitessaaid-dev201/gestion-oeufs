import express from 'express';
import { query, get, run, transaction } from '../db.js';

const router = express.Router();

// Obtenir le stock actuel et le résumé
router.get('/', (req, res) => {
  try {
    const currentStock = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`)?.stock || 0;
    const totalPurchased = get(`SELECT COALESCE(SUM(quantity), 0) as total FROM stock_movements WHERE movement_type = 'in_purchase'`)?.total || 0;
    const totalSold = get(`SELECT COALESCE(SUM(ABS(quantity)), 0) as total FROM stock_movements WHERE movement_type = 'out_sale'`)?.total || 0;
    const totalDamaged = get(`SELECT COALESCE(SUM(ABS(quantity)), 0) as total FROM stock_movements WHERE movement_type = 'loss_damage'`)?.total || 0;

    const recentMovements = query(`
      SELECT sm.*, u.name as user_name
      FROM stock_movements sm
      LEFT JOIN users u ON sm.user_id = u.id
      ORDER BY sm.movement_date DESC
      LIMIT 50
    `);

    res.json({
      currentStock,
      totalPurchased,
      totalSold,
      totalDamaged,
      recentMovements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enregistrer une entrée de stock (achat fournisseur)
router.post('/entry', (req, res) => {
  try {
    const { quantity, unit_price, supplier, notes, user_id = 1 } = req.body;
    const qty = parseInt(quantity, 10);
    const price = parseFloat(unit_price) || 0;

    if (!qty || qty <= 0) {
      return res.status(400).json({ error: 'La quantité achetée doit être un nombre positif supérieur à 0' });
    }

    const result = run(`
      INSERT INTO stock_movements (movement_type, quantity, unit_price, supplier, user_id, notes)
      VALUES ('in_purchase', ?, ?, ?, ?, ?)
    `, [qty, price, supplier || 'Fournisseur direct', user_id, notes || "Achat d'œufs"]);

    const newStock = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`)?.stock || 0;

    res.status(201).json({
      success: true,
      message: `Entrée de ${qty} œufs enregistrée avec succès`,
      movementId: result.lastInsertRowid,
      currentStock: newStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enregistrer des œufs cassés ou perdus
router.post('/damage', (req, res) => {
  try {
    const { quantity, notes, user_id = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    if (!qty || qty <= 0) {
      return res.status(400).json({ error: "La quantité d'œufs cassés doit être supérieure à 0" });
    }

    const result = run(`
      INSERT INTO stock_movements (movement_type, quantity, user_id, notes)
      VALUES ('loss_damage', ?, ?, ?)
    `, [-qty, user_id, notes || "Casse / perte d'œufs"]);

    const newStock = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`)?.stock || 0;

    res.status(201).json({
      success: true,
      message: `${qty} œufs cassés/perdus enregistrés`,
      movementId: result.lastInsertRowid,
      currentStock: newStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
