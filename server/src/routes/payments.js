import express from 'express';
import { query, get, run } from '../db.js';

const router = express.Router();

// Liste de tous les paiements
router.get('/', (req, res) => {
  try {
    const payments = query(`
      SELECT 
        p.*,
        c.name as client_name,
        c.phone as client_phone,
        u.name as user_name
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.payment_date DESC
      LIMIT 100
    `);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste des clients ayant une dette
router.get('/debts', (req, res) => {
  try {
    const debtors = query(`
      SELECT 
        c.id as client_id,
        c.name as client_name,
        c.contact_person,
        c.phone,
        c.whatsapp,
        c.address,
        COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) as total_purchases,
        COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0) as total_paid,
        (
          COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) -
          COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0)
        ) as remaining_debt,
        (SELECT MAX(s.sale_date) FROM sales s WHERE s.client_id = c.id) as last_sale_date,
        (SELECT MAX(p.payment_date) FROM payments p WHERE p.client_id = c.id) as last_payment_date
      FROM clients c
      WHERE (
        COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) -
        COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0)
      ) > 0
      ORDER BY remaining_debt DESC
    `);

    const totalDebt = debtors.reduce((sum, d) => sum + d.remaining_debt, 0);

    res.json({
      totalDebt,
      debtorCount: debtors.length,
      debtors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enregistrer un nouveau paiement (règlement dette)
router.post('/', (req, res) => {
  try {
    const {
      client_id,
      user_id = 1,
      amount,
      payment_method = 'cash',
      notes = ''
    } = req.body;

    const clientId = parseInt(client_id, 10);
    const paidAmount = parseFloat(amount);

    if (!clientId) {
      return res.status(400).json({ error: 'Client obligatoire' });
    }
    if (!paidAmount || paidAmount <= 0) {
      return res.status(400).json({ error: 'Le montant payé doit être supérieur à 0' });
    }

    const result = run(`
      INSERT INTO payments (client_id, user_id, amount, payment_method, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [clientId, user_id, paidAmount, payment_method, notes || 'Règlement solde']);

    // Calculer la nouvelle dette du client
    const clientDebt = get(`
      SELECT (
        COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = ?), 0) -
        COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = ?), 0)
      ) as debt
    `, [clientId, clientId])?.debt || 0;

    res.status(201).json({
      success: true,
      message: `Paiement de ${paidAmount} DH enregistré avec succès`,
      paymentId: result.lastInsertRowid,
      amount: paidAmount,
      newRemainingDebt: clientDebt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
