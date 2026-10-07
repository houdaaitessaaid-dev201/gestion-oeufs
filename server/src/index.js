import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';

import dashboardRoutes from './routes/dashboard.js';
import stockRoutes from './routes/stock.js';
import clientsRoutes from './routes/clients.js';
import visitsRoutes from './routes/visits.js';
import salesRoutes from './routes/sales.js';
import paymentsRoutes from './routes/payments.js';
import historyRoutes from './routes/history.js';
import statsRoutes from './routes/stats.js';
import usersRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';

// Initialisation de la base de données SQLite
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Empêcher tout cache côté client/navigateur pour les requêtes API
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Log minimal des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Enregistrement des routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Distribution Oeufs API', time: new Date().toISOString() });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Une erreur interne est survenue', details: err.message });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Serveur Backend Oeufs démarré sur : http://localhost:${PORT}`);
  console.log(`Base de données SQLite active`);
  console.log(`===============================================`);
});
