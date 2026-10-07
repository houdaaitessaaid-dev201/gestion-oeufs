# 🥚 Distri-Œufs — Application Mobile-First de Vente & Distribution d'Œufs

Application web moderne, fluide et responsive, conçue pour être utilisée en priorité depuis un smartphone par des livreurs, vendeurs et gestionnaires d'une activité de distribution d'œufs.

---

## 🚀 Démarrage Rapide en Local

### Option A : Double-cliquer sur le fichier (Windows)
Double-cliquez simplement sur le fichier `demarrer.bat` situé à la racine du projet.

### Option B : Lancer via le terminal
1. **Lancer le serveur Backend** :
   ```bash
   cd server
   npm start
   ```
   *L'API démarre sur : http://localhost:5000*

2. **Lancer l'application Frontend** (dans une autre fenêtre de terminal) :
   ```bash
   cd client
   npm run dev
   ```
   *L'application s'ouvre sur : http://localhost:5173*

### 📱 Utilisation depuis votre Téléphone portable
Puisque Vite est configuré avec `host: true`, vous pouvez ouvrir l'application directement depuis votre smartphone connecté au même réseau WiFi en saisissant l'adresse IP locale affichée par Vite (ex: `http://192.168.1.XX:5173`).

---

## 📋 Fonctionnalités Implémentées

### 1. 📊 Tableau de Bord (Dashboard)
- Stock actuel d'œufs en temps réel.
- Nombre total de magasins/clients.
- Nombre de clients à visiter aujourd'hui, déjà visités et restant à visiter (avec barre de progression).
- Total payé aujourd'hui en caisse (DH).
- Total restant à récupérer (dette cumulée de tous les clients débiteurs).
- Quantité d'œufs distribuée aujourd'hui.
- Accès rapide aux actions du terrain.

### 2. 📋 Tournée du Jour (Clients à visiter)
- Liste des magasins programmés pour la tournée quotidienne.
- Filtres tactiles rapides : *Tous*, *À visiter*, *Déjà visités*.
- Bouton **« ✅ Marquer comme visité »** enregistrant l'heure et l'utilisateur.
- Bouton **« 📦 Livrer & Vendre »** ouvrant le formulaire de livraison.
- Boutons directs d'appel téléphonique, WhatsApp et Google Maps.

### 3. 👥 Fiche & Répertoire Clients
- Nom du magasin, responsable, téléphone, WhatsApp, adresse, coordonnées Maps, quantité habituelle et prix unitaire convenu.
- Badge visuel du solde restant dû (vert si à jour, rouge si dette).
- **5 boutons d'action rapide par client** :
  - 📞 **Appeler** : Déclenche immédiatement l'appel téléphonique natif.
  - 💬 **WhatsApp** : Ouvre directement la discussion pré-remplie sur WhatsApp.
  - 📍 **Localisation** : Ouvre l'adresse ou les coordonnées sur Google Maps.
  - 🧾 **Historique** : Affiche l'historique complet des achats, paiements et visites.
  - 💰 **Paiement** : Ouvre la fenêtre d'encaissement rapide.

### 4. 📦 Gestion du Stock
- Compteur géant d'œufs disponibles (et estimation en plateaux de 30).
- Enregistrement des entrées (achats fournisseurs, quantité, prix d'achat, fournisseur).
- Déclaration des œufs cassés ou perdus pour garder un stock réaliste.
- Décompte automatique instantané lors de chaque livraison aux clients.
- Historique complet des mouvements avec filtres.

### 5. 💰 Gestion des Paiements & Dettes
- Vue synthétique de tous les clients ayant une dette, triés par montant restant dû.
- Formulaire d'encaissement avec calcul automatique du nouveau solde restant.
- Historique détaillé de tous les règlements.

### 6. 📈 Statistiques & Journal des Opérations
- Ventes du jour, des 7 derniers jours et du mois.
- Quantité totale vendue et taux de recouvrement financier.
- Graphique d'évolution des ventes sur les 7 derniers jours.
- Classement des 5 clients les plus actifs (volume et chiffre d'affaires).
- Journal unifié filtrable par type, date et client.

---

## 🛠️ Architecture Technique

- **Frontend** : React 19, Vite, Tailwind CSS v4, Lucide React icons.
- **Backend** : Node.js, Express.js (API REST modulaire).
- **Base de données** : SQLite relationnel haute performance (`node:sqlite`), stocké dans `server/egg_distribution.sqlite`.
