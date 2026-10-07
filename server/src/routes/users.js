import express from 'express';
import { query, get, run } from '../db.js';

const router = express.Router();

// Liste des utilisateurs
router.get('/', (req, res) => {
  try {
    const users = query(`SELECT id, name, role, phone, active FROM users ORDER BY id ASC`);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un utilisateur
router.post('/', (req, res) => {
  try {
    const { name, role = 'vendeur', phone } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Le nom est obligatoire' });
    }

    const result = run(`INSERT INTO users (name, role, phone) VALUES (?, ?, ?)`, [name.trim(), role, phone || null]);
    res.status(201).json({
      success: true,
      user: { id: result.lastInsertRowid, name, role, phone }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
