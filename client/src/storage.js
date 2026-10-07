// Moteur de stockage local (localStorage) 100% autonome
// Permet à l'application de fonctionner sans aucun backend Node.js / Express
// Compatible GitHub Pages et utilisation mobile hors-ligne (PWA)

const STORAGE_KEYS = {
  CLIENTS: 'distri_oeufs_clients',
  STOCK: 'distri_oeufs_stock_movements',
  SALES: 'distri_oeufs_sales',
  PAYMENTS: 'distri_oeufs_payments',
  VISITS: 'distri_oeufs_visits',
  SETTINGS: 'distri_oeufs_settings',
  USERS: 'distri_oeufs_users'
};

function getLocal(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Erreur lecture ${key}:`, err);
    return defaultValue;
  }
}

function setLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Erreur écriture ${key}:`, err);
  }
}

function getTodayDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNowIsoString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

function nextId(items) {
  if (!items || items.length === 0) return 1;
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

// Initialisation propre
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setLocal(STORAGE_KEYS.SETTINGS, {
      current_egg_price: 1.35,
      current_purchase_price: 1.15
    });
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setLocal(STORAGE_KEYS.USERS, [
      { id: 1, name: 'Vendeur', role: 'vendeur', phone: '0600000000' }
    ]);
  }

  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) setLocal(STORAGE_KEYS.CLIENTS, []);
  if (!localStorage.getItem(STORAGE_KEYS.STOCK)) setLocal(STORAGE_KEYS.STOCK, []);
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) setLocal(STORAGE_KEYS.SALES, []);
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) setLocal(STORAGE_KEYS.PAYMENTS, []);
  if (!localStorage.getItem(STORAGE_KEYS.VISITS)) setLocal(STORAGE_KEYS.VISITS, []);
}

// =================== CALCULS FINANCIERS ===================
function getClientBalance(clientId, salesList = null, paymentsList = null) {
  const sList = salesList || getLocal(STORAGE_KEYS.SALES, []);
  const pList = paymentsList || getLocal(STORAGE_KEYS.PAYMENTS, []);

  const totalPurchases = sList
    .filter(s => Number(s.client_id) === Number(clientId))
    .reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);

  const totalPaid = pList
    .filter(p => Number(p.client_id) === Number(clientId))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const remainingDebt = Math.max(0, Math.round((totalPurchases - totalPaid) * 100) / 100);

  return {
    totalPurchases: Math.round(totalPurchases * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    remainingDebt
  };
}

// =================== API STORAGE ===================
export const localStorageApi = {
  // --- Dashboard ---
  getDashboard: async () => {
    initStorage();
    const today = getTodayDateStr();
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const stockMovements = getLocal(STORAGE_KEYS.STOCK, []);
    const sales = getLocal(STORAGE_KEYS.SALES, []);
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const visits = getLocal(STORAGE_KEYS.VISITS, []);
    const settings = getLocal(STORAGE_KEYS.SETTINGS, { current_egg_price: 1.35, current_purchase_price: 1.15 });

    // 1. Stock actuel
    const currentStock = stockMovements.reduce((sum, sm) => sum + (Number(sm.quantity) || 0), 0);

    // 2. Visites du jour
    const todayVisits = visits.filter(v => v.visit_date === today);
    const visitedCount = todayVisits.filter(v => v.status === 'visited').length;
    const remainingCount = todayVisits.filter(v => v.status !== 'visited').length;

    // 3. Paiements reçus aujourd'hui
    const todayPayments = payments.filter(p => (p.payment_date || '').startsWith(today));
    const totalPaidToday = Math.round(todayPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) * 100) / 100;

    // 4. Total dettes restantes chez tous les clients
    let totalDebtToRecover = 0;
    for (const c of clients) {
      const bal = getClientBalance(c.id, sales, payments);
      totalDebtToRecover += bal.remainingDebt;
    }
    totalDebtToRecover = Math.round(totalDebtToRecover * 100) / 100;

    // 5. Ventes d'aujourd'hui
    const todaySales = sales.filter(s => (s.sale_date || '').startsWith(today));
    const eggsDistributedToday = todaySales.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
    const totalSalesToday = Math.round(todaySales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) * 100) / 100;

    // 6. Prix et Bénéfice du jour
    const currentSellPrice = parseFloat(settings.current_egg_price) || 1.35;
    let currentPurchasePrice = parseFloat(settings.current_purchase_price);
    if (!currentPurchasePrice || isNaN(currentPurchasePrice) || currentPurchasePrice >= currentSellPrice) {
      currentPurchasePrice = Math.max(0.10, Math.round((currentSellPrice - 0.20) * 100) / 100);
    }

    const costOfGoodsSold = eggsDistributedToday * currentPurchasePrice;
    const todayProfit = Math.max(0, Math.round((totalSalesToday - costOfGoodsSold) * 100) / 100);

    return {
      currentStock,
      totalClients: clients.length,
      visitsToday: {
        toVisit: todayVisits.length,
        visited: visitedCount,
        remaining: remainingCount
      },
      totalPaidToday,
      totalDebtToRecover,
      eggsDistributedToday,
      totalSalesToday,
      todayProfit,
      currentPurchasePrice,
      currentSellPrice
    };
  },

  // --- Stock ---
  getStock: async () => {
    initStorage();
    const stockMovements = getLocal(STORAGE_KEYS.STOCK, []);
    const users = getLocal(STORAGE_KEYS.USERS, []);

    const currentStock = stockMovements.reduce((sum, sm) => sum + (Number(sm.quantity) || 0), 0);
    const totalPurchased = stockMovements
      .filter(sm => sm.movement_type === 'in_purchase')
      .reduce((sum, sm) => sum + (Number(sm.quantity) || 0), 0);
    const totalSold = stockMovements
      .filter(sm => sm.movement_type === 'out_sale')
      .reduce((sum, sm) => sum + Math.abs(Number(sm.quantity) || 0), 0);
    const totalDamaged = stockMovements
      .filter(sm => sm.movement_type === 'loss_damage')
      .reduce((sum, sm) => sum + Math.abs(Number(sm.quantity) || 0), 0);

    const recentMovements = [...stockMovements]
      .reverse()
      .slice(0, 50)
      .map(sm => {
        const u = users.find(user => user.id === sm.user_id);
        return {
          ...sm,
          user_name: u?.name || 'Vendeur'
        };
      });

    return {
      currentStock,
      totalPurchased,
      totalSold,
      totalDamaged,
      recentMovements
    };
  },

  addStockEntry: async (data) => {
    initStorage();
    const qty = parseInt(data.quantity, 10);
    const price = parseFloat(data.unit_price) || 0;
    if (!qty || qty <= 0) throw new Error("La quantité achetée doit être supérieure à 0");

    const stockMovements = getLocal(STORAGE_KEYS.STOCK, []);
    const newMovement = {
      id: nextId(stockMovements),
      movement_type: 'in_purchase',
      quantity: qty,
      unit_price: price,
      supplier: data.supplier || 'Fournisseur direct',
      user_id: data.user_id || 1,
      notes: data.notes || "Achat d'œufs",
      movement_date: getNowIsoString()
    };

    stockMovements.push(newMovement);
    setLocal(STORAGE_KEYS.STOCK, stockMovements);

    const newStock = stockMovements.reduce((sum, sm) => sum + (Number(sm.quantity) || 0), 0);
    return {
      success: true,
      movementId: newMovement.id,
      currentStock: newStock
    };
  },

  addStockDamage: async (data) => {
    initStorage();
    const qty = parseInt(data.quantity, 10);
    if (!qty || qty <= 0) throw new Error("La quantité cassée doit être supérieure à 0");

    const stockMovements = getLocal(STORAGE_KEYS.STOCK, []);
    const newMovement = {
      id: nextId(stockMovements),
      movement_type: 'loss_damage',
      quantity: -qty,
      unit_price: 0,
      supplier: null,
      user_id: data.user_id || 1,
      notes: data.notes || "Casse / perte d'œufs",
      movement_date: getNowIsoString()
    };

    stockMovements.push(newMovement);
    setLocal(STORAGE_KEYS.STOCK, stockMovements);

    const newStock = stockMovements.reduce((sum, sm) => sum + (Number(sm.quantity) || 0), 0);
    return {
      success: true,
      movementId: newMovement.id,
      currentStock: newStock
    };
  },

  // --- Clients ---
  getClients: async () => {
    initStorage();
    const today = getTodayDateStr();
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const sales = getLocal(STORAGE_KEYS.SALES, []);
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const visits = getLocal(STORAGE_KEYS.VISITS, []);

    return clients.map(c => {
      const bal = getClientBalance(c.id, sales, payments);
      const visitToday = visits.find(v => Number(v.client_id) === Number(c.id) && v.visit_date === today);
      const clientSales = sales.filter(s => Number(s.client_id) === Number(c.id));
      const lastSale = clientSales.length > 0 ? clientSales[clientSales.length - 1].sale_date : null;

      return {
        ...c,
        total_purchases: bal.totalPurchases,
        total_paid: bal.totalPaid,
        remaining_debt: bal.remainingDebt,
        today_visit_status: visitToday ? visitToday.status : 'not_scheduled',
        last_sale_date: lastSale
      };
    }).sort((a, b) => (b.remaining_debt - a.remaining_debt) || a.name.localeCompare(b.name));
  },

  getClient: async (id) => {
    initStorage();
    const clientId = parseInt(id, 10);
    const today = getTodayDateStr();
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const client = clients.find(c => Number(c.id) === clientId);
    if (!client) throw new Error("Client introuvable");

    const sales = getLocal(STORAGE_KEYS.SALES, []);
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const visits = getLocal(STORAGE_KEYS.VISITS, []);
    const bal = getClientBalance(clientId, sales, payments);

    const visitToday = visits.find(v => Number(v.client_id) === clientId && v.visit_date === today);

    const clientSales = sales
      .filter(s => Number(s.client_id) === clientId)
      .reverse();

    const clientPayments = payments
      .filter(p => Number(p.client_id) === clientId)
      .reverse();

    const clientVisits = visits
      .filter(v => Number(v.client_id) === clientId)
      .reverse();

    return {
      ...client,
      total_purchases: bal.totalPurchases,
      total_paid: bal.totalPaid,
      remaining_debt: bal.remainingDebt,
      today_visit_status: visitToday ? visitToday.status : 'not_scheduled',
      sales_history: clientSales,
      payments_history: clientPayments,
      visits_history: clientVisits
    };
  },

  createClient: async (data) => {
    initStorage();
    if (!data.name?.trim()) throw new Error("Le nom du client / magasin est obligatoire");
    if (!data.phone?.trim()) throw new Error("Le numéro de téléphone est obligatoire");

    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const settings = getLocal(STORAGE_KEYS.SETTINGS, { current_egg_price: 1.35 });

    const newClient = {
      id: nextId(clients),
      name: data.name.trim(),
      contact_person: data.contact_person?.trim() || '',
      phone: data.phone.trim(),
      whatsapp: data.whatsapp?.trim() || data.phone.trim(),
      address: data.address?.trim() || '',
      coordinates: data.coordinates?.trim() || '',
      usual_quantity: parseInt(data.usual_quantity, 10) || 0,
      default_price: parseFloat(data.default_price) || parseFloat(settings.current_egg_price) || 1.35,
      visit_days: data.visit_days || 'Tous les jours',
      notes: data.notes?.trim() || '',
      created_at: getNowIsoString()
    };

    clients.push(newClient);
    setLocal(STORAGE_KEYS.CLIENTS, clients);
    return newClient;
  },

  updateClient: async (id, data) => {
    initStorage();
    const clientId = parseInt(id, 10);
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const idx = clients.findIndex(c => Number(c.id) === clientId);
    if (idx === -1) throw new Error("Client introuvable");

    clients[idx] = {
      ...clients[idx],
      name: data.name ? data.name.trim() : clients[idx].name,
      contact_person: data.contact_person !== undefined ? data.contact_person.trim() : clients[idx].contact_person,
      phone: data.phone ? data.phone.trim() : clients[idx].phone,
      whatsapp: data.whatsapp !== undefined ? data.whatsapp.trim() : clients[idx].whatsapp,
      address: data.address !== undefined ? data.address.trim() : clients[idx].address,
      coordinates: data.coordinates !== undefined ? data.coordinates.trim() : clients[idx].coordinates,
      usual_quantity: data.usual_quantity !== undefined ? (parseInt(data.usual_quantity, 10) || 0) : clients[idx].usual_quantity,
      default_price: data.default_price !== undefined ? (parseFloat(data.default_price) || 1.35) : clients[idx].default_price,
      visit_days: data.visit_days || clients[idx].visit_days,
      notes: data.notes !== undefined ? data.notes.trim() : clients[idx].notes
    };

    setLocal(STORAGE_KEYS.CLIENTS, clients);
    return clients[idx];
  },

  // --- Visites du jour ---
  getTodayVisits: async () => {
    initStorage();
    const today = getTodayDateStr();
    const visits = getLocal(STORAGE_KEYS.VISITS, []);
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const sales = getLocal(STORAGE_KEYS.SALES, []);
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const users = getLocal(STORAGE_KEYS.USERS, []);

    const todayVisits = visits.filter(v => v.visit_date === today);

    const enriched = todayVisits.map(v => {
      const c = clients.find(client => Number(client.id) === Number(v.client_id));
      const u = users.find(user => Number(user.id) === Number(v.user_id));
      const bal = c ? getClientBalance(c.id, sales, payments) : { totalPurchases: 0, totalPaid: 0, remainingDebt: 0 };

      return {
        visit_id: v.id,
        id: v.id,
        visit_date: v.visit_date,
        visit_time: v.visit_time,
        visit_status: v.status,
        status: v.status,
        notes: v.notes,
        ordered_quantity: v.ordered_quantity || 0,
        sale_id: v.sale_id,
        user_name: u?.name || 'Vendeur',
        client_id: c?.id || v.client_id,
        client_name: c?.name || 'Client inconnu',
        contact_person: c?.contact_person || '',
        phone: c?.phone || '',
        whatsapp: c?.whatsapp || c?.phone || '',
        address: c?.address || '',
        coordinates: c?.coordinates || '',
        usual_quantity: c?.usual_quantity || 0,
        default_price: c?.default_price || 1.35,
        client_notes: c?.notes || '',
        total_purchases: bal.totalPurchases,
        total_paid: bal.totalPaid,
        remaining_debt: bal.remainingDebt
      };
    }).sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return a.id - b.id;
    });

    return {
      summary: {
        total: enriched.length,
        visited: enriched.filter(v => v.visit_status === 'visited').length,
        pending: enriched.filter(v => v.visit_status !== 'visited').length
      },
      visits: enriched
    };
  },

  markVisited: async (data) => {
    initStorage();
    const visitId = parseInt(data.visit_id || data.id, 10);
    const visits = getLocal(STORAGE_KEYS.VISITS, []);
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const idx = visits.findIndex(v => Number(v.id) === visitId);
    if (idx !== -1) {
      visits[idx] = {
        ...visits[idx],
        status: 'visited',
        visit_time: nowTime,
        notes: data.notes || visits[idx].notes
      };
    }

    setLocal(STORAGE_KEYS.VISITS, visits);
    return { success: true };
  },

  addToTodayTour: async (clientId, quantity = 0, userId = 1) => {
    initStorage();
    const today = getTodayDateStr();
    const cId = parseInt(clientId, 10);
    const qty = parseInt(quantity, 10) || 0;
    const visits = getLocal(STORAGE_KEYS.VISITS, []);

    const existingIdx = visits.findIndex(v => Number(v.client_id) === cId && v.visit_date === today);

    if (existingIdx !== -1) {
      visits[existingIdx].ordered_quantity = qty;
      visits[existingIdx].status = 'pending';
    } else {
      visits.push({
        id: nextId(visits),
        client_id: cId,
        user_id: userId || 1,
        visit_date: today,
        visit_time: null,
        status: 'pending',
        sale_id: null,
        ordered_quantity: qty,
        notes: '',
        created_at: getNowIsoString()
      });
    }

    setLocal(STORAGE_KEYS.VISITS, visits);
    return { success: true };
  },

  removeFromTodayTour: async (visitId) => {
    initStorage();
    const vId = parseInt(visitId, 10);
    let visits = getLocal(STORAGE_KEYS.VISITS, []);
    visits = visits.filter(v => Number(v.id) !== vId);
    setLocal(STORAGE_KEYS.VISITS, visits);
    return { success: true };
  },

  clearTodayTour: async (mode = 'all') => {
    initStorage();
    const today = getTodayDateStr();
    let visits = getLocal(STORAGE_KEYS.VISITS, []);

    if (mode === 'all') {
      visits = visits.filter(v => v.visit_date !== today);
    } else {
      visits = visits.filter(v => !(v.visit_date === today && v.status !== 'visited'));
    }

    setLocal(STORAGE_KEYS.VISITS, visits);
    return { success: true };
  },

  // --- Ventes & Livraisons ---
  createSale: async (data) => {
    initStorage();
    const cId = parseInt(data.client_id, 10);
    const qty = parseInt(data.quantity, 10);
    const unitPrice = parseFloat(data.unit_price);
    const paidAmount = parseFloat(data.paid_amount) || 0;
    const userId = data.user_id || 1;

    if (!qty || qty <= 0) throw new Error("La quantité doit être supérieure à 0");
    if (!unitPrice || unitPrice <= 0) throw new Error("Le prix unitaire doit être supérieur à 0");

    const totalAmount = Math.round(qty * unitPrice * 100) / 100;
    const paid = Math.min(totalAmount, Math.max(0, paidAmount));
    const remaining = Math.round((totalAmount - paid) * 100) / 100;
    const nowStr = getNowIsoString();
    const today = getTodayDateStr();

    const sales = getLocal(STORAGE_KEYS.SALES, []);
    const stockMovements = getLocal(STORAGE_KEYS.STOCK, []);
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const visits = getLocal(STORAGE_KEYS.VISITS, []);

    // 1. Créer la vente
    const newSale = {
      id: nextId(sales),
      client_id: cId,
      user_id: userId,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: totalAmount,
      paid_amount: paid,
      remaining_amount: remaining,
      sale_date: nowStr,
      notes: data.notes || '',
      created_at: nowStr
    };
    sales.push(newSale);

    // 2. Déduire le stock
    const newStockMove = {
      id: nextId(stockMovements),
      movement_type: 'out_sale',
      quantity: -qty,
      unit_price: unitPrice,
      supplier: null,
      related_sale_id: newSale.id,
      user_id: userId,
      notes: `Vente client #${cId}`,
      movement_date: nowStr
    };
    stockMovements.push(newStockMove);

    // 3. Enregistrer le paiement reçu à la livraison
    let paymentRecord = null;
    if (paid > 0) {
      paymentRecord = {
        id: nextId(payments),
        client_id: cId,
        sale_id: newSale.id,
        user_id: userId,
        amount: paid,
        payment_method: 'cash',
        payment_date: nowStr,
        notes: 'Paiement à la livraison',
        created_at: nowStr
      };
      payments.push(paymentRecord);
    }

    // 4. Mettre à jour la visite du jour si existante
    const vIdx = visits.findIndex(v => Number(v.client_id) === cId && v.visit_date === today);
    if (vIdx !== -1) {
      visits[vIdx].status = 'visited';
      visits[vIdx].sale_id = newSale.id;
      visits[vIdx].visit_time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    setLocal(STORAGE_KEYS.SALES, sales);
    setLocal(STORAGE_KEYS.STOCK, stockMovements);
    setLocal(STORAGE_KEYS.PAYMENTS, payments);
    setLocal(STORAGE_KEYS.VISITS, visits);

    const bal = getClientBalance(cId, sales, payments);

    return {
      success: true,
      sale: newSale,
      payment: paymentRecord,
      remaining_debt: bal.remainingDebt
    };
  },

  // --- Paiements & Dettes ---
  getPayments: async () => {
    initStorage();
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const users = getLocal(STORAGE_KEYS.USERS, []);

    return [...payments]
      .reverse()
      .slice(0, 100)
      .map(p => {
        const c = clients.find(cl => Number(cl.id) === Number(p.client_id));
        const u = users.find(us => Number(us.id) === Number(p.user_id));
        return {
          ...p,
          client_name: c?.name || 'Client',
          client_phone: c?.phone || '',
          user_name: u?.name || 'Vendeur'
        };
      });
  },

  getDebts: async () => {
    initStorage();
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const sales = getLocal(STORAGE_KEYS.SALES, []);
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);

    const debtors = [];
    let totalDebt = 0;

    for (const c of clients) {
      const bal = getClientBalance(c.id, sales, payments);
      if (bal.remainingDebt > 0) {
        totalDebt += bal.remainingDebt;
        const cSales = sales.filter(s => Number(s.client_id) === Number(c.id));
        const cPays = payments.filter(p => Number(p.client_id) === Number(c.id));

        debtors.push({
          client_id: c.id,
          client_name: c.name,
          contact_person: c.contact_person,
          phone: c.phone,
          whatsapp: c.whatsapp || c.phone,
          address: c.address,
          total_purchases: bal.totalPurchases,
          total_paid: bal.totalPaid,
          remaining_debt: bal.remainingDebt,
          last_sale_date: cSales.length > 0 ? cSales[cSales.length - 1].sale_date : null,
          last_payment_date: cPays.length > 0 ? cPays[cPays.length - 1].payment_date : null
        });
      }
    }

    debtors.sort((a, b) => b.remaining_debt - a.remaining_debt);

    return {
      totalDebt: Math.round(totalDebt * 100) / 100,
      debtorCount: debtors.length,
      debtors
    };
  },

  createPayment: async (data) => {
    initStorage();
    const cId = parseInt(data.client_id, 10);
    const amount = parseFloat(data.amount);
    if (!amount || amount <= 0) throw new Error("Le montant du règlement doit être supérieur à 0");

    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const nowStr = getNowIsoString();

    const newPayment = {
      id: nextId(payments),
      client_id: cId,
      sale_id: data.sale_id ? parseInt(data.sale_id, 10) : null,
      user_id: data.user_id || 1,
      amount,
      payment_method: data.payment_method || 'cash',
      payment_date: nowStr,
      notes: data.notes || 'Règlement de dette',
      created_at: nowStr
    };

    payments.push(newPayment);
    setLocal(STORAGE_KEYS.PAYMENTS, payments);

    const bal = getClientBalance(cId, null, payments);

    return {
      success: true,
      paymentId: newPayment.id,
      remaining_debt: bal.remainingDebt
    };
  },

  // --- Historique ---
  getHistory: async (params = {}) => {
    initStorage();
    const { type, client_id, date } = params;
    const sales = getLocal(STORAGE_KEYS.SALES, []);
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const stockMovements = getLocal(STORAGE_KEYS.STOCK, []);
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
    const users = getLocal(STORAGE_KEYS.USERS, []);

    let items = [];

    // 1. Ventes
    if (!type || type === 'all' || type === 'sales') {
      for (const s of sales) {
        if (client_id && Number(s.client_id) !== Number(client_id)) continue;
        if (date && !(s.sale_date || '').startsWith(date)) continue;

        const c = clients.find(cl => Number(cl.id) === Number(s.client_id));
        const u = users.find(us => Number(us.id) === Number(s.user_id));

        items.push({
          event_type: 'sale',
          event_id: s.id,
          event_date: s.sale_date,
          client_id: s.client_id,
          client_name: c?.name || 'Client',
          user_id: s.user_id,
          user_name: u?.name || 'Vendeur',
          quantity: s.quantity,
          unit_price: s.unit_price,
          total_amount: s.total_amount,
          paid_amount: s.paid_amount,
          remaining_amount: s.remaining_amount,
          notes: s.notes,
          summary: `Livraison de ${s.quantity} œufs (${s.total_amount} DH)`
        });
      }
    }

    // 2. Paiements
    if (!type || type === 'all' || type === 'payments') {
      for (const p of payments) {
        if (client_id && Number(p.client_id) !== Number(client_id)) continue;
        if (date && !(p.payment_date || '').startsWith(date)) continue;

        const c = clients.find(cl => Number(cl.id) === Number(p.client_id));
        const u = users.find(us => Number(us.id) === Number(p.user_id));

        items.push({
          event_type: 'payment',
          event_id: p.id,
          event_date: p.payment_date,
          client_id: p.client_id,
          client_name: c?.name || 'Client',
          user_id: p.user_id,
          user_name: u?.name || 'Vendeur',
          amount: p.amount,
          payment_method: p.payment_method,
          notes: p.notes,
          summary: `Règlement de ${p.amount} DH reçu`
        });
      }
    }

    // 3. Stock
    if (!type || type === 'all' || type === 'stock') {
      if (!client_id) {
        for (const sm of stockMovements) {
          if (date && !(sm.movement_date || '').startsWith(date)) continue;
          const u = users.find(us => Number(us.id) === Number(sm.user_id));

          let summary = '';
          if (sm.movement_type === 'in_purchase') {
            summary = `Achat de ${sm.quantity} œufs (${sm.supplier || 'Fournisseur'})`;
          } else if (sm.movement_type === 'loss_damage') {
            summary = `Casse : ${Math.abs(sm.quantity)} œufs perdus`;
          } else {
            summary = `Mouvement stock : ${sm.quantity} œufs`;
          }

          items.push({
            event_type: 'stock',
            event_id: sm.id,
            event_date: sm.movement_date,
            user_id: sm.user_id,
            user_name: u?.name || 'Vendeur',
            quantity: sm.quantity,
            movement_type: sm.movement_type,
            supplier: sm.supplier,
            notes: sm.notes,
            summary
          });
        }
      }
    }

    items.sort((a, b) => (b.event_date || '').localeCompare(a.event_date || ''));
    return items.slice(0, 150);
  },

  // --- Statistiques ---
  getStats: async () => {
    initStorage();
    const today = getTodayDateStr();
    const sales = getLocal(STORAGE_KEYS.SALES, []);
    const payments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const clients = getLocal(STORAGE_KEYS.CLIENTS, []);

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    const calcSales = (list) => ({
      total_amount: Math.round(list.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) * 100) / 100,
      paid_amount: Math.round(list.reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0) * 100) / 100,
      remaining_amount: Math.round(list.reduce((sum, s) => sum + (Number(s.remaining_amount) || 0), 0) * 100) / 100,
      total_eggs: list.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0),
      sales_count: list.length
    });

    const todaySales = calcSales(sales.filter(s => (s.sale_date || '').startsWith(today)));
    const weekSales = calcSales(sales.filter(s => (s.sale_date || '') >= sevenDaysAgo));
    const monthSales = calcSales(sales.filter(s => (s.sale_date || '').startsWith(currentMonth)));

    // Top clients
    const clientStats = clients.map(c => {
      const cSales = sales.filter(s => Number(s.client_id) === Number(c.id));
      const totalEggs = cSales.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      const totalRevenue = Math.round(cSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) * 100) / 100;
      const bal = getClientBalance(c.id, sales, payments);

      return {
        id: c.id,
        name: c.name,
        contact_person: c.contact_person,
        phone: c.phone,
        total_eggs_bought: totalEggs,
        total_revenue: totalRevenue,
        current_debt: bal.remainingDebt
      };
    }).filter(c => c.total_eggs_bought > 0)
      .sort((a, b) => b.total_eggs_bought - a.total_eggs_bought)
      .slice(0, 5);

    return {
      today: todaySales,
      week: weekSales,
      month: monthSales,
      topClients: clientStats
    };
  },

  // --- Utilisateurs ---
  getUsers: async () => {
    initStorage();
    return getLocal(STORAGE_KEYS.USERS, [
      { id: 1, name: 'Vendeur', role: 'vendeur', phone: '0600000000' }
    ]);
  },

  // --- Prix du jour ---
  getEggPrice: async () => {
    initStorage();
    const settings = getLocal(STORAGE_KEYS.SETTINGS, { current_egg_price: 1.35, current_purchase_price: 1.15 });
    const price = parseFloat(settings.current_egg_price) || 1.35;
    return {
      price,
      plateau_price: Math.round(price * 30 * 100) / 100
    };
  },

  updateEggPrice: async (data) => {
    initStorage();
    const numPrice = parseFloat(data.price);
    if (isNaN(numPrice) || numPrice <= 0) throw new Error("Le prix doit être un nombre positif");

    const roundedPrice = Math.round(numPrice * 100) / 100;
    const plateauPrice = Math.round(roundedPrice * 30 * 100) / 100;

    const settings = getLocal(STORAGE_KEYS.SETTINGS, {});
    settings.current_egg_price = roundedPrice;
    setLocal(STORAGE_KEYS.SETTINGS, settings);

    if (data.update_all_clients) {
      const clients = getLocal(STORAGE_KEYS.CLIENTS, []);
      for (const c of clients) {
        c.default_price = roundedPrice;
      }
      setLocal(STORAGE_KEYS.CLIENTS, clients);
    }

    return {
      success: true,
      price: roundedPrice,
      plateau_price: plateauPrice,
      message: `Nouveau prix fixé à ${roundedPrice.toFixed(2)} DH/œuf (${plateauPrice.toFixed(2)} DH le plateau)`
    };
  },

  // --- Sauvegarde & Restauration (Export / Import) ---
  exportAllData: () => {
    const data = {};
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      data[name] = getLocal(key, null);
    }
    return JSON.stringify(data, null, 2);
  },

  importAllData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        if (data[name] !== undefined && data[name] !== null) {
          setLocal(key, data[name]);
        }
      }
      return true;
    } catch (e) {
      console.error('Erreur import data:', e);
      throw new Error('Format de fichier de sauvegarde invalide');
    }
  },

  resetAllData: () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key);
    }
    initStorage();
    return true;
  }
};
