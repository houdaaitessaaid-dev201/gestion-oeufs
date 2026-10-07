# 🥚 Gestion Œufs — Application Mobile PWA de Vente & Distribution d'Œufs

Application web progressive (PWA) fluide, moderne et responsive, conçue pour être installée directement sur le smartphone Android d'un livreur / vendeur d'œufs.

Fonctionne **100% gratuitement** sur **GitHub Pages** sans aucun serveur ni base de données payante. Toutes les données sont sauvegardées instantanément dans le téléphone via `localStorage` et utilisables hors-ligne.

---

## 📱 Utilisation Mobile (PWA)

Depuis le navigateur **Google Chrome** sur votre téléphone Android :
1. Ouvrez le lien du site (ex: `https://VOTRE-PSEUDO.github.io/NOM-DU-REPO/`)
2. Appuyez sur le menu **⋮** (les trois petits points en haut à droite)
3. Appuyez sur **« Ajouter à l'écran d'accueil »** ou **« Installer l'application »**
4. L'icône de l'œuf apparaît sur votre écran d'accueil comme une vraie application !

---

## 🚀 Lancement Local sur PC

Double-cliquez sur le fichier **`demarrer.bat`** ou exécutez :
```bash
cd client
npm run dev
```
L'application démarre sur `http://localhost:5173`.

---

## 🌐 Déploiement Gratuit sur GitHub Pages

### Option 1 : Déploiement depuis le dossier `/docs` (Le plus simple)
1. Créez un repository sur GitHub (ex: `gestion-oeufs`) en mode **Public**.
2. Poussez votre code :
   ```bash
   git remote add origin https://github.com/VOTRE-PSEUDO/gestion-oeufs.git
   git branch -M main
   git push -u origin main
   ```
3. Sur GitHub, allez dans **Settings** ➔ **Pages**.
4. Dans **Build and deployment** > **Source**, choisissez : **Deploy from a branch**.
5. Sélectionnez la branche **`main`** et le dossier **`/docs`**, puis cliquez sur **Save**.
6. En 1 minute, votre lien est actif : `https://VOTRE-PSEUDO.github.io/gestion-oeufs/` !

### Option 2 : Déploiement automatique via GitHub Actions
Le workflow automatique `.github/workflows/deploy.yml` est déjà inclus. Vous pouvez simplement sélectionner **Source : GitHub Actions** dans les paramètres GitHub Pages.

---

## 📋 Fonctionnalités Complètes Incluses

- 📦 **Stock d'œufs** : entrées d'approvisionnement, déclarations de casse, décompte automatique lors des ventes.
- 👥 **Gestion des Clients** : répertoire, appels directs (`tel:`), messages WhatsApp directs, adresses.
- 🚚 **Visites du jour** : liste de la tournée, ajout de magasins ayant appelé, validation des visites faites, bouton vider la tournée.
- 💰 **Ventes & Dettes** : calcul automatique des totaux et soldes restants, encaissement de dettes.
- 📈 **Bénéfice Net du Jour** : calcul du gain journalier basé sur le prix de vente et d'achat.
- 🌐 **Multilingue & Thèmes** : Français 🇫🇷 et Arabe 🇲🇦 avec support RTL, Mode Sombre et Mode Clair.
- 💾 **Sauvegarde & Restauration** : bouton dédié dans l'en-tête pour exporter toutes les données en fichier `.json` et les restaurer à tout moment.

---

## ⚠️ Limite importante du stockage local (localStorage)

Les données saisies sont enregistrées dans la mémoire du navigateur du téléphone utilisé. Elles ne sont pas automatiquement synchronisées entre plusieurs téléphones différents. Pensez à utiliser le bouton de sauvegarde (icône bouclier 🛡️ dans la barre supérieure) pour télécharger une copie de sécurité sur votre téléphone ou WhatsApp.
