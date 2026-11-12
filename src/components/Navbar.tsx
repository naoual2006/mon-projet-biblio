/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bookmark, 
  LogIn, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const { 
    activeView, 
    setActiveView,
    darkMode, 
    toggleDarkMode, 
    selection, 
    setSelectionDrawerOpen, 
    currentUser, 
    logout, 
    setAuthModalOpen 
  } = useApp();

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Tableau de bord';
      case 'catalogue':
        return 'Ouvrages';
      case 'emprunts':
        return currentUser?.role === 'ETUDIANT' ? 'Mes Emprunts' : 'Suivi des Prêts';
      case 'scanner':
        return 'Scanner un livre';
      case 'adherents':
        return 'Adhérents';
      case 'acces':
        return "Contrôle d'accès";
      case 'notifications':
        return (currentUser?.role === 'BIBLIOTHECAIRE' || currentUser?.role === 'ADMIN')
          ? 'Historique des envois'
          : 'Notifications';
      case 'favoris':
        return 'Mes Favoris';
      case 'aide':
        return 'Aide & Règles';
      case 'journal_securite':
        return 'Journal de sécurité';
      default:
        return 'Bibliothèque Universitaire';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Gauche : Bouton menu hamburger (mobile) & Titre de la page */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {getViewTitle()}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              BiblioTech • Système de gestion documentaire
            </p>
          </div>
        </div>

        {/* Droite : Bouton Mes réservations (Étudiant/Biblio), Dark Mode, Profil */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser?.role === 'ETUDIANT' && (
            <button
              onClick={() => setSelectionDrawerOpen(true)}
              className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs flex items-center gap-2"
              title="Ouvrir mes réservations"
              aria-label="Mes réservations"
            >
              <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold hidden sm:inline">
                Mes réservations
              </span>
              {selection.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center -ml-0.5">
                  {selection.length}
                </span>
              )}
            </button>
          )}

          {/* Bouton Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
            title={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            aria-label="Basculer le mode sombre"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Profil utilisateur ou Bouton Se connecter */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.prenom} {currentUser.nom}
                </p>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {currentUser.role}
                </span>
              </div>

              <img
                src={currentUser.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Se déconnecter"
                aria-label="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Se connecter</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
