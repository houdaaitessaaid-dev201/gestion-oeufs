import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ 
  currentEggPrice = 1.35,
  onOpenPriceModal 
}) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const locale = lang === 'ar' ? 'ar-MA' : 'fr-FR';
  const todayFormatted = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-amber-600 dark:bg-slate-900 border-b dark:border-slate-800 text-white shadow-sm transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-2xl" role="img" aria-label="egg">🥚</span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-none">{t('appName')}</h1>
            <p className="text-[11px] text-amber-100 dark:text-slate-400 font-medium capitalize mt-0.5">{todayFormatted}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          {/* Bouton Traduction Arabe / Français */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-xl bg-amber-700/70 hover:bg-amber-700 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-xs font-black text-white transition border border-white/20 dark:border-slate-700"
            title={lang === 'fr' ? 'Traduire en Arabe' : 'Traduire en Français'}
          >
            <span>{lang === 'fr' ? 'AR 🇲🇦' : 'FR 🇫🇷'}</span>
          </button>

          {/* Bouton Mode Sombre / Clair */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-amber-700/70 hover:bg-amber-700 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition text-white border border-white/20 dark:border-slate-700"
            title={isDark ? t('lightMode') : t('darkMode')}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-amber-100" />
            )}
          </button>
        </div>
      </div>

      {/* Bandeau Prix du Jour des Œufs */}
      <div className="bg-amber-700/90 dark:bg-slate-950/90 border-t border-amber-500/40 dark:border-slate-800 text-white">
        <div className="max-w-2xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <span className="font-extrabold text-amber-200 dark:text-amber-400">💰 {t('todayEggPrice')}</span>
            <span className="font-black text-white bg-amber-900/60 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-amber-500/50 dark:border-slate-700">
              {(currentEggPrice || 1.35).toFixed(2)} {t('perEgg')}
            </span>
            <span className="text-[11px] text-amber-200/90 dark:text-slate-400 hidden xs:inline sm:inline">
              (~{((currentEggPrice || 1.35) * 30).toFixed(2)} {t('plateauEstimate')})
            </span>
          </div>

          {onOpenPriceModal && (
            <button
              type="button"
              onClick={onOpenPriceModal}
              className="flex items-center space-x-1 rtl:space-x-reverse py-1 px-2.5 bg-white hover:bg-amber-50 dark:bg-amber-500 dark:hover:bg-amber-400 active:scale-95 text-amber-950 dark:text-slate-950 font-black text-[11px] rounded-lg shadow-2xs transition"
            >
              <span>✏️ {t('changePrice')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
