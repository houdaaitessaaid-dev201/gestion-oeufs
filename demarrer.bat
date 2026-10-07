@echo off
title Gestion Oeufs - Lancement de l'application
echo ============================================================
echo   DEMARRAGE DE L'APPLICATION GESTION OEUFS (MOBILE PWA)
echo ============================================================
echo.
echo Demarrage de l'application...
start "Gestion Oeufs" cmd /k "cd client && npm run dev"

echo.
echo ============================================================
echo Application lancee avec succes !
echo - Sur votre PC : http://localhost:5173
echo - Sur smartphone : ouvrez le lien affiche dans le terminal
echo - Sauvegarde 100%% automatique dans le telephone (localStorage)
echo ============================================================
pause
