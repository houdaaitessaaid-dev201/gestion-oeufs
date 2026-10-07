import express from 'express';
import { get, run, transaction, resetDatabase } from '../db.js';

const router = express.Router();

// Récupérer le prix du jour actuel
router.get('/price', (req, res) => {
  try {
    const row = get(`SELECT value, updated_at FROM app_settings WHERE key = 'current_egg_price'`);
    const price = row ? parseFloat(row.value) : 1.35;
    const plateauPrice = Math.round(price * 30 * 100) / 100;

    res.json({
      price,
      plateau_price: plateauPrice,
      updated_at: row?.updated_at || new Date().toISOString()
    });
  } catch (err) {
    console.error('Erreur get price:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du prix' });
  }
});

// Mettre à jour le prix du jour des œufs
router.put('/price', (req, res) => {
  try {
    const { price, update_all_clients = true } = req.body;
    const numPrice = parseFloat(price);

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Le prix doit être un nombre positif' });
    }

    const roundedPrice = Math.round(numPrice * 100) / 100;
    const plateauPrice = Math.round(roundedPrice * 30 * 100) / 100;

    transaction(() => {
      // 1. Sauvegarder dans app_settings
      run(`
        INSERT INTO app_settings (key, value, updated_at)
        VALUES ('current_egg_price', ?, datetime('now', 'localtime'))
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value,
          updated_at = excluded.updated_at
      `, [roundedPrice.toString()]);

      // 2. Si demandé, mettre à jour le prix par défaut de tous les clients
      if (update_all_clients) {
        run(`UPDATE clients SET default_price = ?`, [roundedPrice]);
      }
    });

    res.json({
      success: true,
      price: roundedPrice,
      plateau_price: plateauPrice,
      update_all_clients,
      message: `Nouveau prix fixé à ${roundedPrice.toFixed(2)} DH/œuf (${plateauPrice.toFixed(2)} DH le plateau)`
    });
  } catch (err) {
    console.error('Erreur update price:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du prix' });
  }
});

// Réinitialiser toutes les données à zéro
router.post('/reset', (req, res) => {
  try {
    resetDatabase();
    res.json({
      success: true,
      message: 'Base de données réinitialisée à zéro avec succès'
    });
  } catch (err) {
    console.error('Erreur reset database:', err);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
  }
});

export default router;
