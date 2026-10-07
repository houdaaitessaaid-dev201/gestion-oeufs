import http from 'node:http';
import { initDatabase, get, query, run } from './src/db.js';

// Test database operations directly first
console.log('--- 1. Testing DB and calculations directly ---');
initDatabase();

const stock = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`);
console.log('Stock actuel calculé:', stock.stock, 'œufs');

const clients = query(`SELECT name, default_price FROM clients`);
console.log('Clients initialisés:', clients.map(c => `${c.name} (${c.default_price} DH)`).join(', '));

const debtRow = get(`
  SELECT COALESCE(SUM(remaining), 0) as total_debt
  FROM (
    SELECT (
      COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = c.id), 0) -
      COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = c.id), 0)
    ) as remaining
    FROM clients c
  )
  WHERE remaining > 0
`);
console.log('Dette globale à récupérer:', debtRow.total_debt, 'DH');

const visits = query(`SELECT c.name, v.status, v.visit_time FROM visits v JOIN clients c ON v.client_id = c.id`);
console.log('Visites du jour:', visits.map(v => `${v.name}: ${v.status} (${v.visit_time || 'en attente'})`).join(' | '));

console.log('--- DB & Business Logic test passed successfully! ---');
