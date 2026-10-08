import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DashboardView from './views/DashboardView';
import TodayTourView from './views/TodayTourView';
import ClientsView from './views/ClientsView';
import StockView from './views/StockView';
import DebtsView from './views/DebtsView';

import SaleModal from './components/SaleModal';
import PaymentModal from './components/PaymentModal';
import ClientModal from './components/ClientModal';
import StockModal from './components/StockModal';
import ClientDetailModal from './components/ClientDetailModal';
import EggPriceModal from './components/EggPriceModal';
import BackupModal from './components/BackupModal';

import { api } from './api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Données
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [todayVisits, setTodayVisits] = useState(null);
  const [clients, setClients] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [debtsData, setDebtsData] = useState(null);
  const [paymentsList, setPaymentsList] = useState([]);

  // Modals
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleClient, setSaleClient] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentClient, setPaymentClient] = useState(null);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockModalMode, setStockModalMode] = useState('entry');

  const [clientDetailOpen, setClientDetailOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Prix du jour des œufs et marge nette
  const [currentEggPrice, setCurrentEggPrice] = useState(1.35);
  const [profitPerEgg, setProfitPerEgg] = useState(0.20);
  const [eggPriceModalOpen, setEggPriceModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [
        usersRes,
        dashRes,
        visitsRes,
        clientsRes,
        stockRes,
        debtsRes,
        paymentsRes,
        priceRes
      ] = await Promise.all([
        api.getUsers(),
        api.getDashboard(),
        api.getTodayVisits(),
        api.getClients(),
        api.getStock(),
        api.getDebts(),
        api.getPayments(),
        api.getEggPrice().catch(() => ({ price: 1.35, profit_per_egg: 0.20 }))
      ]);

      setUsers(usersRes);
      if (!currentUser && usersRes.length > 0) {
        const seller = usersRes.find(u => u.role === 'vendeur') || usersRes[0];
        setCurrentUser(seller);
      }

      setDashboardData(dashRes);
      setTodayVisits(visitsRes);
      setClients(clientsRes);
      setStockData(stockRes);
      setDebtsData(debtsRes);
      setPaymentsList(paymentsRes);
      if (priceRes?.price) {
        setCurrentEggPrice(priceRes.price);
      }
      if (priceRes?.profit_per_egg !== undefined) {
        setProfitPerEgg(priceRes.profit_per_egg);
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
      showToast(err.message || 'Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handlers pour actions
  const handleSaleSuccess = async (salePayload) => {
    try {
      await api.createSale({
        ...salePayload,
        user_id: currentUser?.id || 1
      });
      showToast(`Livraison de ${salePayload.quantity} œufs enregistrée !`);
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur lors de la vente', 'error');
      throw err;
    }
  };

  const handlePaymentSuccess = async (paymentPayload) => {
    try {
      await api.createPayment({
        ...paymentPayload,
        user_id: currentUser?.id || 1
      });
      showToast(`Paiement de ${paymentPayload.amount} DH reçu !`);
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur lors du paiement', 'error');
      throw err;
    }
  };

  const handleStockSuccess = async (stockPayload) => {
    try {
      if (stockPayload.type === 'entry') {
        await api.addStockEntry({
          quantity: stockPayload.quantity,
          unit_price: stockPayload.unit_price,
          supplier: stockPayload.supplier,
          notes: stockPayload.notes,
          user_id: currentUser?.id || 1
        });
        showToast(`Stock rechargé : +${stockPayload.quantity} œufs`);
      } else if (stockPayload.type === 'damage') {
        await api.addStockDamage({
          quantity: stockPayload.quantity,
          notes: stockPayload.notes,
          user_id: currentUser?.id || 1
        });
        showToast(`${stockPayload.quantity} œufs cassés enlevés du stock`);
      } else if (stockPayload.type === 'adjust') {
        await api.adjustStock({
          new_stock: stockPayload.new_stock,
          notes: stockPayload.notes,
          user_id: currentUser?.id || 1
        });
        showToast(`Stock corrigé : ${stockPayload.new_stock} œufs`);
      }
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur de stock', 'error');
      throw err;
    }
  };

  const handleClientSuccess = async (clientPayload) => {
    try {
      if (clientPayload.id) {
        await api.updateClient(clientPayload.id, clientPayload);
        showToast('Client modifié');
      } else {
        await api.createClient({
          ...clientPayload,
          user_id: currentUser?.id || 1
        });
        showToast(`Client "${clientPayload.name}" enregistré et ajouté à la tournée !`);
      }
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur client', 'error');
      throw err;
    }
  };

  const handleMarkVisited = async (visitItem) => {
    try {
      await api.markVisited({
        visit_id: visitItem.visit_id,
        client_id: visitItem.client_id,
        user_id: currentUser?.id || 1
      });
      showToast(`Magasin "${visitItem.client_name}" marqué comme visité !`);
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur visite', 'error');
    }
  };

  const handleAddToTour = async (clientId, clientName, quantity = 0) => {
    try {
      const res = await api.addToTodayTour(clientId, quantity, currentUser?.id || 1);
      showToast(`"${clientName}" ajouté à la tournée (${quantity} œufs) !`);
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur lors de l\'ajout', 'error');
    }
  };

  const handleRemoveFromTour = async (visitId, clientName) => {
    try {
      await api.removeFromTodayTour(visitId);
      showToast(`"${clientName}" retiré de la tournée`);
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur lors du retrait', 'error');
    }
  };

  const handleClearTour = async (mode = 'all') => {
    try {
      const res = await api.clearTodayTour(mode);
      showToast(res.message || 'Liste de la tournée vidée !');
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur lors du vidage de la tournée', 'error');
    }
  };

  const handleSaveEggPrice = async ({ price, profit_per_egg, update_all_clients }) => {
    try {
      const res = await api.updateEggPrice({ price, profit_per_egg, update_all_clients });
      setCurrentEggPrice(res.price);
      if (res.profit_per_egg !== undefined) {
        setProfitPerEgg(res.profit_per_egg);
      }
      showToast(res.message || `Tarif et marge enregistrés avec succès !`);
      await loadInitialData();
    } catch (err) {
      showToast(err.message || 'Erreur lors de la mise à jour du prix', 'error');
      throw err;
    }
  };

  const pendingVisitsCount = todayVisits?.summary?.pending || 0;
  const debtCount = debtsData?.debtorCount || 0;
  const scheduledClientVisits = new Map((todayVisits?.visits || []).map(v => [v.client_id, v]));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors pb-16">
      {/* Toast Notification simple */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold animate-in slide-in-from-top duration-200 text-white bg-slate-900/95 dark:bg-slate-800/95 border border-slate-700">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Barre supérieure */}
      <Header
        currentUser={currentUser}
        users={users}
        onUserChange={setCurrentUser}
        onRefresh={loadInitialData}
        loading={loading}
        currentEggPrice={currentEggPrice}
        onOpenPriceModal={() => setEggPriceModalOpen(true)}
        onOpenBackupModal={() => setBackupModalOpen(true)}
      />

      {/* Vues principales */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <DashboardView
            dashboardData={dashboardData}
            onNavigate={setActiveTab}
            onOpenStockModal={(mode) => {
              setStockModalMode(mode);
              setStockModalOpen(true);
            }}
            onOpenClientModal={() => {
              setClientToEdit(null);
              setClientModalOpen(true);
            }}
            onOpenPriceModal={() => setEggPriceModalOpen(true)}
          />
        )}

        {activeTab === 'tour' && (
          <TodayTourView
            todayVisits={todayVisits}
            allClients={clients}
            onMarkVisited={handleMarkVisited}
            onAddToTour={handleAddToTour}
            onRemoveFromTour={handleRemoveFromTour}
            onClearTour={handleClearTour}
            onOpenSale={(client) => {
              // Si une quantité a été commandée pour aujourd'hui, on la préremplit !
              const visit = scheduledClientVisits.get(client.client_id || client.id);
              const customClient = {
                ...client,
                usual_quantity: (visit?.ordered_quantity > 0 ? visit.ordered_quantity : client.usual_quantity)
              };
              setSaleClient(customClient);
              setSaleModalOpen(true);
            }}
            onOpenClientDetail={(clientId) => {
              setSelectedClientId(clientId);
              setClientDetailOpen(true);
            }}
            onOpenClientModal={() => {
              setClientToEdit(null);
              setClientModalOpen(true);
            }}
            currentEggPrice={currentEggPrice}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            scheduledClientVisits={scheduledClientVisits}
            onAddToTour={handleAddToTour}
            onRemoveFromTour={handleRemoveFromTour}
            onOpenClientDetail={(clientId) => {
              setSelectedClientId(clientId);
              setClientDetailOpen(true);
            }}
            onOpenClientModal={(client) => {
              setClientToEdit(client);
              setClientModalOpen(true);
            }}
            onOpenPayment={(client) => {
              setPaymentClient(client);
              setPaymentModalOpen(true);
            }}
            onOpenSale={(client) => {
              const visit = scheduledClientVisits.get(client.client_id || client.id);
              const customClient = {
                ...client,
                usual_quantity: (visit?.ordered_quantity > 0 ? visit.ordered_quantity : client.usual_quantity)
              };
              setSaleClient(customClient);
              setSaleModalOpen(true);
            }}
            currentEggPrice={currentEggPrice}
            onOpenPriceModal={() => setEggPriceModalOpen(true)}
          />
        )}

        {activeTab === 'stock' && (
          <StockView
            stockData={stockData}
            onOpenStockModal={(mode) => {
              setStockModalMode(mode);
              setStockModalOpen(true);
            }}
            currentEggPrice={currentEggPrice}
            onOpenPriceModal={() => setEggPriceModalOpen(true)}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsView
            debtsData={debtsData}
            paymentsList={paymentsList}
            onOpenPayment={(client) => {
              setPaymentClient(client);
              setPaymentModalOpen(true);
            }}
            onOpenClientDetail={(clientId) => {
              setSelectedClientId(clientId);
              setClientDetailOpen(true);
            }}
          />
        )}
      </main>

      {/* Barre de navigation basse */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingVisitsCount={pendingVisitsCount}
        debtCount={debtCount}
      />

      {/* Modals Interactifs */}
      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => {
          setSaleModalOpen(false);
          setSaleClient(null);
        }}
        client={saleClient}
        onSuccess={handleSaleSuccess}
        currentUserId={currentUser?.id}
        currentEggPrice={currentEggPrice}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentClient(null);
        }}
        client={paymentClient}
        onSuccess={handlePaymentSuccess}
        currentUserId={currentUser?.id}
      />

      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => {
          setClientModalOpen(false);
          setClientToEdit(null);
        }}
        clientToEdit={clientToEdit}
        onSuccess={handleClientSuccess}
        currentEggPrice={currentEggPrice}
      />

      <StockModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        mode={stockModalMode}
        onSuccess={handleStockSuccess}
        currentUserId={currentUser?.id}
        currentStock={stockData?.currentStock ?? dashboardData?.currentStock ?? 0}
      />

      <ClientDetailModal
        isOpen={clientDetailOpen}
        onClose={() => {
          setClientDetailOpen(false);
          setSelectedClientId(null);
        }}
        clientId={selectedClientId}
        onOpenSale={(client) => {
          setSaleClient(client);
          setSaleModalOpen(true);
        }}
        onOpenPayment={(client) => {
          setPaymentClient(client);
          setPaymentModalOpen(true);
        }}
        onEditClient={(client) => {
          setClientDetailOpen(false);
          setClientToEdit(client);
          setClientModalOpen(true);
        }}
      />

      {/* Modal Changement Prix du Jour des Œufs et Marge de Bénéfice */}
      <EggPriceModal
        isOpen={eggPriceModalOpen}
        onClose={() => setEggPriceModalOpen(false)}
        currentPrice={currentEggPrice}
        currentProfitPerEgg={profitPerEgg}
        onSavePrice={handleSaveEggPrice}
      />

      {/* Modal Sauvegarde & Restauration (Export / Import) */}
      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        onDataRestored={loadInitialData}
        showToast={showToast}
      />
    </div>
  );
}
