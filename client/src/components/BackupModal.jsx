import React, { useState } from 'react';
import { X, Download, Upload, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { localStorageApi } from '../storage';

export default function BackupModal({ isOpen, onClose, onDataRestored, showToast }) {
  const { t } = useLanguage();
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const dataStr = localStorageApi.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().split('T')[0];

      const a = document.createElement('a');
      a.href = url;
      a.download = `gestion-oeufs-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (showToast) showToast(t('backupSuccess'), 'success');
    } catch (err) {
      console.error('Erreur export:', err);
      if (showToast) showToast("Erreur lors de l'exportation", 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImporting(true);
        const content = event.target?.result;
        if (typeof content === 'string') {
          localStorageApi.importAllData(content);
          if (showToast) showToast(t('restoreSuccess'), 'success');
          if (onDataRestored) onDataRestored();
          onClose();
        }
      } catch (err) {
        if (showToast) showToast("Fichier de sauvegarde invalide", 'error');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* En-tête */}
        <div className="bg-amber-600 dark:bg-slate-800 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <ShieldCheck className="w-5 h-5 text-amber-200" />
            <h3 className="text-base font-black">{t('backupTitle')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-100 hover:text-white hover:bg-amber-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {t('backupDesc')}
          </p>

          <div className="space-y-3 pt-2">
            {/* Bouton Exporter */}
            <button
              onClick={handleExport}
              type="button"
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black rounded-2xl shadow-sm transition flex items-center justify-center space-x-2 rtl:space-x-reverse text-xs"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{t('exportData')} (Fichier .json)</span>
            </button>

            {/* Bouton Importer */}
            <label className="w-full py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-800 dark:text-slate-200 font-black rounded-2xl border border-slate-300 dark:border-slate-700 transition flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer text-xs">
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>{importing ? t('loading') : `${t('importData')} (Fichier .json)`}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed">
            💡 <strong>Conseil :</strong> Toutes vos données sont enregistrées directement dans ce téléphone. Faites une sauvegarde de temps en temps (par exemple une fois par semaine) pour la garder sur votre WhatsApp.
          </div>
        </div>

        {/* Pied de modal */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-right rtl:text-left">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
