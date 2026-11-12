/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { AppNavView, UserRole } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  BookMarked, 
  Layers, 
  Users, 
  ShieldCheck, 
  Bell, 
  Heart, 
  HelpCircle, 
  X,
  GraduationCap,
  ScanLine,
  Send,
  QrCode
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: AppNavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  roles: (UserRole | 'VISITEUR')[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { 
    activeView, 
    setActiveView, 
    currentUser, 
    notifications, 
    favorites, 
    setStudentQrModalOpen 
  } = useApp();

  const userRole: UserRole | 'VISITEUR' = currentUser?.role || 'VISITEUR';
  const isStudent = userRole === 'ETUDIANT';
  const isLibrarian = userRole === 'BIBLIOTHECAIRE';
  const isAdmin = userRole === 'ADMIN';

  // Nombre de notifications non lues
  const unreadNotifs = notifications.filter(n => !n.lue).length;

  // PROBLÈME 1 : Tableau d'objets de navigation { label, icon, path/id, roles }
  // L'Admin voit UNIQUEMENT : Tableau de bord, Contrôle d'accès, Adhérents, Notifications/Historique, Ouvrages, Favoris, Aide.
  // L'Admin n'a PAS accès aux tâches de comptoir : Suivi des prêts, Scanner un livre, À traiter aujourd'hui.
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      roles: ['BIBLIOTHECAIRE', 'ADMIN'],
    },
    {
      id: 'catalogue',
      label: 'Ouvrages',
      icon: BookOpen,
      roles: ['ETUDIANT', 'BIBLIOTHECAIRE', 'ADMIN', 'VISITEUR'],
    },
    {
      id: 'emprunts',
      label: isStudent ? 'Mes Emprunts' : 'Suivi des Prêts',
      icon: BookMarked,
      roles: ['ETUDIANT', 'BIBLIOTHECAIRE'],
    },
    {
      id: 'scanner',
      label: 'Scanner un livre',
      icon: ScanLine,
      roles: ['BIBLIOTHECAIRE'],
    },
    {
      id: 'adherents',
      label: 'Adhérents',
      icon: Users,
      roles: ['BIBLIOTHECAIRE', 'ADMIN'],
    },
    {
      id: 'acces',
      label: "Contrôle d'accès",
      icon: ShieldCheck,
      roles: ['ADMIN'],
    },
    {
      id: 'favoris',
      label: 'Mes Favoris',
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : undefined,
      roles: ['ETUDIANT', 'VISITEUR'],
    },
    {
      id: 'journal_securite',
      label: 'Journal de sécurité',
      icon: ShieldCheck,
      roles: ['ADMIN'],
    },
    {
      id: 'notifications',
      label: isLibrarian ? 'Historique des envois' : 'Notifications',
      icon: isLibrarian ? Send : Bell,
      badge: isLibrarian ? undefined : (unreadNotifs > 0 ? unreadNotifs : undefined),
      roles: ['ETUDIANT', 'BIBLIOTHECAIRE'],
    },
    {
      id: 'aide',
      label: 'Aide & Règles',
      icon: HelpCircle,
      roles: ['ETUDIANT', 'BIBLIOTHECAIRE', 'ADMIN', 'VISITEUR'],
    },
  ];

  // Filtrage strict selon le rôle
  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleSelect = (viewId: AppNavView) => {
    setActiveView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-2xs lg:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Barre latérale */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col justify-between transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Logo de l'application */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
            <div 
              onClick={() => handleSelect('catalogue')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  BiblioTech
                </span>
                <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-0.5">
                  BU Université
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation verticale filtrée par rôles */}
          <nav className="p-3 space-y-1">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profil utilisateur & Pass QR en bas de sidebar */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.prenom}
                  className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.prenom} {currentUser.nom}
                  </p>
                  <span className="inline-block text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {isStudent && (
                <button
                  onClick={() => setStudentQrModalOpen(true)}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-500" />
                  <span>Mon Pass Portique</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Mode Visiteur</p>
              <p className="text-[11px]">Consultez le catalogue librement</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
