import http from 'node:http';
import { initDatabase, get, query, run } from './src/db.js';

console.log('====================================================');
console.log('  TEST INTÉGRATION COMPLET : DISTRI-ŒUFS API & BDD  ');
console.log('====================================================');

// Re-init database
initDatabase();

// 1. Initial State
const initialStock = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`).stock;
console.log('1. Stock initial :', initialStock, 'œufs');

// 2. Client Al Amal initial debt
const alAmalDebt1 = get(`
  SELECT (
    COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = 1), 0) -
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = 1), 0)
  ) as debt
`).debt;
console.log('2. Dette initiale Al Amal :', alAmalDebt1, 'DH');

// 3. Simulate Sale / Delivery to Al Amal: 200 eggs @ 1.50 DH = 300 DH, Paid 200 DH, Debt added 100 DH
console.log('\n--- 3. Enregistrement d\'une livraison de 200 œufs chez Al Amal ---');
const qty = 200;
const price = 1.50;
const total = qty * price; // 300 DH
const paid = 200.0;
const remaining = total - paid; // 100 DH

const saleRes = run(`
  INSERT INTO sales (client_id, user_id, quantity, unit_price, total_amount, paid_amount, remaining_amount, notes)
  VALUES (1, 2, ?, ?, ?, ?, ?, 'Livraison du matin')
`, [qty, price, total, paid, remaining]);

const saleId = saleRes.lastInsertRowid;

// Stock deduction
run(`
  INSERT INTO stock_movements (movement_type, quantity, unit_price, related_sale_id, user_id, notes)
  VALUES ('out_sale', ?, ?, ?, 2, 'Vente Al Amal')
`, [-qty, price, saleId]);

// Payment
run(`
  INSERT INTO payments (client_id, sale_id, user_id, amount, payment_method, notes)
  VALUES (1, ?, 2, ?, 'cash', 'Paiement partiel à la livraison')
`, [saleId, paid]);

// Update visit
run(`
  UPDATE visits SET status = 'visited', visit_time = '10:45', sale_id = ?
  WHERE client_id = 1 AND visit_date = date('now', 'localtime')
`, [saleId]);

// Verify Stock
const stockAfterSale = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`).stock;
console.log('Stock après livraison (attendu:', initialStock - 200, ') ->', stockAfterSale, 'œufs');
if (stockAfterSale !== initialStock - 200) throw new Error('Échec calcul stock !');

// Verify Debt
const alAmalDebt2 = get(`
  SELECT (
    COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = 1), 0) -
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = 1), 0)
  ) as debt
`).debt;
console.log('Dette Al Amal après livraison (attendu:', alAmalDebt1 + remaining, ') ->', alAmalDebt2, 'DH');
if (alAmalDebt2 !== alAmalDebt1 + remaining) throw new Error('Échec calcul dette client !');

// 4. Client Al Amal later pays 200 DH (entire remaining debt)
console.log('\n--- 4. Client Al Amal règle 200 DH de sa dette ---');
run(`
  INSERT INTO payments (client_id, user_id, amount, payment_method, notes)
  VALUES (1, 2, 200.0, 'cash', 'Règlement solde')
`);

const alAmalDebt3 = get(`
  SELECT (
    COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.client_id = 1), 0) -
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.client_id = 1), 0)
  ) as debt
`).debt;
console.log('Dette Al Amal après règlement complet (attendu: 0 DH) ->', alAmalDebt3, 'DH');
if (alAmalDebt3 !== 0) throw new Error('La dette devrait être de 0 DH !');

// 5. Casse / Perte de 25 œufs
console.log('\n--- 5. Déclaration de casse de 25 œufs ---');
run(`
  INSERT INTO stock_movements (movement_type, quantity, user_id, notes)
  VALUES ('loss_damage', -25, 2, 'Casse transport')
`);
const stockAfterLoss = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`).stock;
console.log('Stock après casse (attendu:', stockAfterSale - 25, ') ->', stockAfterLoss, 'œufs');
if (stockAfterLoss !== stockAfterSale - 25) throw new Error('Échec calcul casse stock !');

// 6. Achat / Entrée de 1000 œufs
console.log('\n--- 6. Achat fournisseur de 1000 œufs ---');
run(`
  INSERT INTO stock_movements (movement_type, quantity, unit_price, supplier, user_id, notes)
  VALUES ('in_purchase', 1000, 1.15, 'Ferme Avicole Souss', 1, 'Réapprovisionnement')
`);
const stockAfterEntry = get(`SELECT COALESCE(SUM(quantity), 0) as stock FROM stock_movements`).stock;
console.log('Stock après entrée (attendu:', stockAfterLoss + 1000, ') ->', stockAfterEntry, 'œufs');
if (stockAfterEntry !== stockAfterLoss + 1000) throw new Error('Échec calcul approvisionnement stock !');

// 7. Check visit status for Al Amal
const visitAlAmal = get(`SELECT status, visit_time FROM visits WHERE client_id = 1 AND visit_date = date('now', 'localtime')`);
console.log('\n--- 7. Statut visite Al Amal ---');
console.log('Statut visite :', visitAlAmal.status, '| Heure :', visitAlAmal.visit_time);
if (visitAlAmal.status !== 'visited') throw new Error('La visite devrait être marquée visitée !');

console.log('\n====================================================');
console.log('✅ TOUS LES TESTS MÉTIER ONT ÉTÉ VALIDÉS AVEC SUCCÈS');
console.log('====================================================\n');
