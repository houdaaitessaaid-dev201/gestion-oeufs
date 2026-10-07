import express from 'express';
import { query, get, run } from '../db.js';

const router = express.Router();

// Liste de tous les clients avec solde et statut de visite
router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const clients = query(`
      SELECT 
        c.*,
        COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) as total_purchases,
        COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0) as total_paid,
        (
          COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) -
          COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0)
        ) as remaining_debt,
        COALESCE((
          SELECT v.status 
          FROM visits v 
          WHERE v.client_id = c.id AND v.visit_date = ? 
          LIMIT 1
        ), 'not_scheduled') as today_visit_status,
        (
          SELECT MAX(s.sale_date) 
          FROM sales s 
          WHERE s.client_id = c.id
        ) as last_sale_date
      FROM clients c
      ORDER BY remaining_debt DESC, c.name ASC
    `, [today]);

    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Détail complet d'un client avec ses historiques
router.get('/:id', (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const today = new Date().toISOString().split('T')[0];

    const client = get(`
      SELECT 
        c.*,
        COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) as total_purchases,
        COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0) as total_paid,
        (
          COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) -
          COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0)
        ) as remaining_debt,
        COALESCE((
          SELECT v.status 
          FROM visits v 
          WHERE v.client_id = c.id AND v.visit_date = ? 
          LIMIT 1
        ), 'not_scheduled') as today_visit_status
      FROM clients c
      WHERE c.id = ?
    `, [today, clientId]);

    if (!client) {
      return res.status(404).json({ error: 'Client introuvable' });
    }

    // Historique des ventes / livraisons
    const sales = query(`
      SELECT s.*, u.name as user_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.client_id = ?
      ORDER BY s.sale_date DESC
    `, [clientId]);

    // Historique des paiements
    const payments = query(`
      SELECT p.*, u.name as user_name
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.client_id = ?
      ORDER BY p.payment_date DESC
    `, [clientId]);

    // Historique des visites
    const visits = query(`
      SELECT v.*, u.name as user_name
      FROM visits v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.client_id = ?
      ORDER BY v.visit_date DESC, v.created_at DESC
      LIMIT 30
    `, [clientId]);

    res.json({
      ...client,
      sales,
      payments,
      visits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un nouveau client
router.post('/', (req, res) => {
  try {
    const {
      name,
      contact_person,
      phone,
      whatsapp,
      address,
      coordinates,
      usual_quantity = 0,
      default_price = 1.45,
      visit_days = 'Tous les jours',
      notes = '',
      add_to_today = true,
      ordered_quantity = null,
      user_id = 1
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Le nom du magasin/client et le numéro de téléphone sont obligatoires' });
    }

    const cleanWhatsapp = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : phone.replace(/[^0-9]/g, '');
    const clientQty = parseInt(usual_quantity, 10) || 0;

    const result = run(`
      INSERT INTO clients (name, contact_person, phone, whatsapp, address, coordinates, usual_quantity, default_price, visit_days, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name.trim(),
      contact_person ? contact_person.trim() : null,
      phone.trim(),
      cleanWhatsapp,
      address ? address.trim() : null,
      coordinates ? coordinates.trim() : null,
      clientQty,
      parseFloat(default_price) || 1.45,
      visit_days,
      notes ? notes.trim() : null
    ]);

    const newClientId = result.lastInsertRowid;

    // Si add_to_today est activé (par défaut true), on l'ajoute directement à la tournée d'aujourd'hui !
    if (add_to_today) {
      const today = new Date().toISOString().split('T')[0];
      const tourQty = ordered_quantity !== null && ordered_quantity !== undefined 
        ? (parseInt(ordered_quantity, 10) || 0) 
        : clientQty;

      run(`
        INSERT INTO visits (visit_date, client_id, user_id, status, ordered_quantity)
        VALUES (?, ?, ?, 'pending', ?)
      `, [today, newClientId, user_id || 1, tourQty]);
    }

    res.status(201).json({
      success: true,
      message: 'Client créé avec succès et ajouté à la tournée d\'aujourd\'hui',
      clientId: newClientId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modifier un client
router.put('/:id', (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const {
      name,
      contact_person,
      phone,
      whatsapp,
      address,
      coordinates,
      usual_quantity,
      default_price,
      visit_days,
      notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Le nom et le téléphone sont obligatoires' });
    }

    const cleanWhatsapp = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : phone.replace(/[^0-9]/g, '');

    run(`
      UPDATE clients 
      SET name = ?, contact_person = ?, phone = ?, whatsapp = ?, address = ?, coordinates = ?,
          usual_quantity = ?, default_price = ?, visit_days = ?, notes = ?
      WHERE id = ?
    `, [
      name.trim(),
      contact_person ? contact_person.trim() : null,
      phone.trim(),
      cleanWhatsapp,
      address ? address.trim() : null,
      coordinates ? coordinates.trim() : null,
      parseInt(usual_quantity, 10) || 0,
      parseFloat(default_price) || 1.45,
      visit_days || 'Tous les jours',
      notes ? notes.trim() : null,
      clientId
    ]);

    res.json({ success: true, message: 'Client mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
