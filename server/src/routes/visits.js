import express from 'express';
import { query, get, run } from '../db.js';

const router = express.Router();

// Récupérer les visites d'aujourd'hui avec toutes les informations client
router.get('/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const visits = query(`
      SELECT 
        v.id as visit_id,
        v.id,
        v.visit_date,
        v.visit_time,
        v.status as visit_status,
        v.status,
        v.notes as visit_notes,
        COALESCE(v.ordered_quantity, 0) as ordered_quantity,
        v.sale_id,
        u.name as user_name,
        c.id as client_id,
        c.name as client_name,
        c.contact_person,
        c.phone,
        c.whatsapp,
        c.address,
        c.coordinates,
        c.usual_quantity,
        c.default_price,
        c.notes as client_notes,
        COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) as total_purchases,
        COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0) as total_paid,
        (
          COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) -
          COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0)
        ) as remaining_debt
      FROM visits v
      JOIN clients c ON v.client_id = c.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.visit_date = ?
      ORDER BY 
        CASE WHEN v.status = 'pending' THEN 0 ELSE 1 END,
        v.id ASC
    `, [today]);

    const summary = {
      total: visits.length,
      visited: visits.filter(v => v.visit_status === 'visited').length,
      pending: visits.filter(v => v.visit_status !== 'visited').length
    };

    res.json({
      summary,
      visits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marquer une visite comme effectuée (sans forcément vente)
router.post('/mark-visited', (req, res) => {
  try {
    const { client_id, visit_id, user_id = 1, notes } = req.body;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    if (visit_id) {
      run(`
        UPDATE visits 
        SET status = 'visited', visit_time = ?, user_id = ?, notes = COALESCE(?, notes)
        WHERE id = ?
      `, [timeStr, user_id, notes || null, visit_id]);
    } else if (client_id) {
      run(`
        UPDATE visits 
        SET status = 'visited', visit_time = ?, user_id = ?, notes = COALESCE(?, notes)
        WHERE client_id = ? AND visit_date = ?
      `, [timeStr, user_id, notes || null, client_id, today]);
    } else {
      return res.status(400).json({ error: 'visit_id ou client_id requis' });
    }

    res.json({ success: true, message: 'Visite marquée comme effectuée', visit_time: timeStr });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un client à la tournée du jour (ex: client qui a appelé pour commander)
router.post('/add-to-today', (req, res) => {
  try {
    const { client_id, user_id = 1, ordered_quantity = 0 } = req.body;
    const clientId = parseInt(client_id, 10);
    const qty = parseInt(ordered_quantity, 10) || 0;

    if (!clientId) {
      return res.status(400).json({ error: 'Client obligatoire' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Vérifier si déjà présent pour aujourd'hui
    const existing = get(`SELECT id, status FROM visits WHERE client_id = ? AND visit_date = ?`, [clientId, today]);
    if (existing) {
      // Mettre à jour la quantité demandée
      run(`UPDATE visits SET ordered_quantity = ? WHERE id = ?`, [qty, existing.id]);
      return res.json({ 
        success: true, 
        message: `Quantité mise à jour : ${qty} œufs`,
        visitId: existing.id,
        ordered_quantity: qty,
        alreadyInTour: true
      });
    }

    const result = run(
      `INSERT INTO visits (client_id, user_id, visit_date, status, ordered_quantity) VALUES (?, ?, ?, 'pending', ?)`,
      [clientId, user_id, today, qty]
    );

    res.status(201).json({
      success: true,
      message: 'Client ajouté à la tournée d\'aujourd\'hui avec succès',
      visitId: result.lastInsertRowid,
      ordered_quantity: qty
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vider toute la liste de la tournée du jour (pour commencer une nouvelle tournée)
router.post('/clear-today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { mode = 'all' } = req.body || {};

    if (mode === 'visited') {
      run(`DELETE FROM visits WHERE visit_date = ? AND status = 'visited'`, [today]);
      res.json({ success: true, message: 'Magasins visités retirés de la tournée' });
    } else {
      run(`DELETE FROM visits WHERE visit_date = ?`, [today]);
      res.json({ success: true, message: 'Tournée du jour vidée avec succès' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retirer un client de la tournée du jour (s'il annule sa commande ou pas visité)
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ error: 'ID de visite invalide' });
    }
    const today = new Date().toISOString().split('T')[0];
    run(`DELETE FROM visits WHERE id = ? OR (client_id = ? AND visit_date = ?)`, [id, id, today]);
    res.json({ success: true, message: 'Client retiré de la tournée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
