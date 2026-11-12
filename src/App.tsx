/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { GmailModal } from './components/GmailModal';
import { AuthModal } from './modules/auth/AuthModal';
import { StudentQrModal } from './modules/auth/StudentQrModal';
import { SelectionDrawer } from './modules/selection/SelectionDrawer';
import { CatalogView } from './modules/catalog/CatalogView';
import { LoansView } from './modules/loans/LoansView';
import { LibrarianDashboard } from './modules/dashboard/LibrarianDashboard';
import { AccessView } from './modules/access/AccessView';
import { BookScannerView } from './modules/scanner/BookScannerView';
import { UsersView } from './modules/users/UsersView';
import { NotificationsView } from './modules/notifications/NotificationsView';
import { HelpView } from './modules/help/HelpView';
import { SecurityJournalView } from './modules/security/SecurityJournalView';

const MainLayout: React.FC = () => {
  const { activeView, currentUser } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Rendu de la vue active
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <LibrarianDashboard />;
      case 'catalogue':
        return <CatalogView favoritesOnly={false} />;
      case 'emprunts':
        return <LoansView />;
      case 'traiter':
        return <LibrarianDashboard />;
      case 'scanner':
        return <BookScannerView />;
      case 'acces':
        return <AccessView />;
      case 'journal_securite':
        return <SecurityJournalView />;
      case 'adherents':
        return <UsersView />;
      case 'favoris':
        return <CatalogView favoritesOnly={true} />;
      case 'notifications':
        return <NotificationsView />;
      case 'aide':
        return <HelpView />;
      default:
        return <CatalogView favoritesOnly={false} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      {/* Sidebar latérale */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Contenu principal décalé à droite pour accommoder la sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Barre supérieure fixe */}
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Corps de la page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modales globales & Tiroir de sélection */}
      <SelectionDrawer />
      <AuthModal />
      <StudentQrModal />
      <GmailModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
