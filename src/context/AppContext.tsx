/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Ouvrage, 
  Emprunt, 
  Reservation, 
  AccesPassage, 
  AppNotification, 
  ToastMessage, 
  AppNavView, 
  UserRole,
  ConnexionError
} from '../types';
import { 
  USERS,
  INITIAL_USERS, 
  INITIAL_BOOKS, 
  INITIAL_LOANS, 
  INITIAL_RESERVATIONS, 
  INITIAL_ACCESS_PASSAGES, 
  INITIAL_NOTIFICATIONS,
  INITIAL_CONNEXION_ERRORS
} from '../data/mockData';

// Règle 8 : Fonction de vérification de la limite de 3 livres
export const peutAjouter = (
  user: User | null,
  currentSelection: string[],
  userLoans: Emprunt[]
): boolean => {
  if (!user) {
    return currentSelection.length < 3;
  }
  const empruntsActifs = userLoans.filter(
    l => l.etudiantId === user.id && (l.statut === 'En cours' || l.statut === 'En attente de retrait')
  ).length;

  return (empruntsActifs + currentSelection.length) < 3;
};

// Règle 6a : Vérification des amendes impayées
export const hasUnpaidFines = (user: User | null, userLoans: Emprunt[]): boolean => {
  if (!user) return false;
  return userLoans.some(l => l.etudiantId === user.id && !l.amendePayee && l.amende > 0);
};

interface AppContextType {
  currentUser: User | null;
  users: User[];
  books: Ouvrage[];
  loans: Emprunt[];
  reservations: Reservation[];
  accessPassages: AccesPassage[];
  notifications: AppNotification[];
  selection: string[]; // Remplacement de cart par selection (Règle 1)
  favorites: string[];
  toasts: ToastMessage[];
  activeView: AppNavView;
  setActiveView: (view: AppNavView) => void;
  securityFilter: 'Tous' | 'Réussi' | 'Échec';
  setSecurityFilter: (filter: 'Tous' | 'Réussi' | 'Échec') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  selectionDrawerOpen: boolean;
  setSelectionDrawerOpen: (open: boolean) => void;
  studentQrModalOpen: boolean;
  setStudentQrModalOpen: (open: boolean) => void;
  gmailModalNotification: AppNotification | null;
  setGmailModalNotification: (notif: AppNotification | null) => void;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Ma sélection & Favoris (Règle 1 & 8)
  addToSelection: (bookId: string) => void;
  removeFromSelection: (bookId: string) => void;
  clearSelection: () => void;
  validateSelection: () => void;
  toggleFavorite: (bookId: string) => void;
  checkCanAdd: () => boolean;
  userHasFines: boolean;
  userTotalUnpaidFines: number;
  payAllUserFines: () => void;
  
  // Ouvrages
  addBook: (bookData: Omit<Ouvrage, 'id' | 'empruntsTotal'>) => void;
  updateBook: (book: Ouvrage) => void;
  deleteBook: (bookId: string) => void;
  reserveBook: (bookId: string) => void;
  
  // Emprunts
  prolongLoan: (loanId: string) => void;
  requestReturn: (loanId: string) => void;
  returnLoan: (loanId: string) => void;
  confirmPickup: (loanId: string) => void;
  markFinePaid: (loanId: string) => void;
  
  cancelReservation: (reservationId: string) => void;
  cancelLoanRequest: (loanId: string) => void;
  resendNotification: (notifId: string) => void;
  scanBook: (isbnOrId: string, action: 'emprunt' | 'retour') => { success: boolean; message: string; book?: Ouvrage };
  
  // Accès Portique (Réservé à l'Administrateur - Règle 4 & 5)
  verifyAndRecordAccess: (identifier: string, methode: 'Carte' | 'QR Code') => {
    autorise: boolean;
    user?: User;
    motifRefus?: string;
  };
  recordExit: (passageId: string, motifManuel?: string) => void;
  
  // Erreurs de connexion récentes (Admin - Règle 4)
  connexionErrors: ConnexionError[];
  recordConnexionError: (rawCard: string, motif: string) => void;

  // Utilisateurs (Règle 5)
  updateUserRole: (targetUserId: string, newRole: UserRole) => void;
  addUser: (userData: Omit<User, 'id' | 'dateInscription'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  
  // Notifications
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Point 1 : Versioning des données enregistrées dans le navigateur (nettoyage automatique des anciennes données)
  useEffect(() => {
    const DATA_VERSION = 'bibliotech_v6_morocco_v1';
    const savedVersion = localStorage.getItem('bibliotech_data_version');
    if (savedVersion !== DATA_VERSION) {
      localStorage.clear();
      localStorage.setItem('bibliotech_data_version', DATA_VERSION);
      window.location.reload();
    }
  }, []);

  // Dark mode (synchronisé avec html class)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bibliotech_dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Session utilisateur : enregistre uniquement l'identifiant (user.id)
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('bibliotech_v6_user_id');
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bibliotech_v6_users');
    return saved ? JSON.parse(saved) : USERS;
  });

  // Obtenir toujours les données les plus à jour de l'utilisateur depuis la source unique `users`
  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find(u => u.id === currentUserId) || null;
  }, [currentUserId, users]);

  // Si l'utilisateur enregistré n'est pas dans la liste des usagers, retour automatique au mode visiteur
  useEffect(() => {
    if (currentUserId && !users.some(u => u.id === currentUserId)) {
      setCurrentUserId(null);
      localStorage.removeItem('bibliotech_v6_user_id');
      setActiveView('catalogue');
    }
  }, [currentUserId, users]);

  const [books, setBooks] = useState<Ouvrage[]>(() => {
    const saved = localStorage.getItem('bibliotech_v6_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [loans, setLoans] = useState<Emprunt[]>(() => {
    const saved = localStorage.getItem('bibliotech_v6_loans');
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('bibliotech_v6_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [accessPassages, setAccessPassages] = useState<AccesPassage[]>(() => {
    const saved = localStorage.getItem('bibliotech_v6_accesses');
    return saved ? JSON.parse(saved) : INITIAL_ACCESS_PASSAGES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('bibliotech_v6_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Ma Sélection
  const [selection, setSelection] = useState<string[]>(() => {
    const savedSelection = localStorage.getItem('bibliotech_v6_selection');
    if (savedSelection) {
      try { return JSON.parse(savedSelection); } catch { /* ignore */ }
    }
    return [];
  });

  // Favoris
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('bibliotech_v6_favs');
    return saved ? JSON.parse(saved) : [];
  });

  // Erreurs de connexion récentes (Admin)
  const [connexionErrors, setConnexionErrors] = useState<ConnexionError[]>(() => {
    const saved = localStorage.getItem('bibliotech_v6_connexion_errors');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_CONNEXION_ERRORS;
  });

  useEffect(() => {
    localStorage.setItem('bibliotech_v6_connexion_errors', JSON.stringify(connexionErrors));
  }, [connexionErrors]);

  const recordConnexionError = (rawCard: string, motif: string) => {
    const cardTrimmed = rawCard.trim().toUpperCase();
    let masked = 'ETU-2024-****';
    if (cardTrimmed.length >= 8) {
      masked = cardTrimmed.slice(0, 8) + '****';
    } else if (cardTrimmed.length > 0) {
      masked = cardTrimmed + '-****';
    }
    const newErr: ConnexionError = {
      id: `err-${Date.now()}`,
      date: new Date().toISOString(),
      carteMasquee: masked,
      motif,
    };
    setConnexionErrors(prev => [newErr, ...prev.slice(0, 19)]);
  };

  // États d'interface
  const [activeView, setActiveView] = useState<AppNavView>('catalogue');
  const [securityFilter, setSecurityFilter] = useState<'Tous' | 'Réussi' | 'Échec'>('Tous');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [selectionDrawerOpen, setSelectionDrawerOpen] = useState<boolean>(false);
  const [studentQrModalOpen, setStudentQrModalOpen] = useState<boolean>(false);
  const [gmailModalNotification, setGmailModalNotification] = useState<AppNotification | null>(null);

  // Synchronisation du dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('bibliotech_dark', String(darkMode));
  }, [darkMode]);

  // Persistance dans localStorage
  useEffect(() => {
    localStorage.setItem('bibliotech_v6_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bibliotech_v6_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('bibliotech_v6_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('bibliotech_v6_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('bibliotech_v6_accesses', JSON.stringify(accessPassages));
  }, [accessPassages]);

  useEffect(() => {
    localStorage.setItem('bibliotech_v6_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bibliotech_v6_selection', JSON.stringify(selection));
  }, [selection]);

  useEffect(() => {
    localStorage.setItem('bibliotech_v6_favs', JSON.stringify(favorites));
  }, [favorites]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Gestion des Toasts courts et lisibles
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Indicateur si l'utilisateur actuel a une amende impayée (Règle 6a)
  const userHasFines = hasUnpaidFines(currentUser, loans);

  const userTotalUnpaidFines = useMemo(() => {
    if (!currentUser) return 0;
    return loans
      .filter(l => l.etudiantId === currentUser.id && !l.amendePayee && l.amende > 0)
      .reduce((sum, l) => sum + l.amende, 0);
  }, [loans, currentUser]);

  const payAllUserFines = () => {
    if (!currentUser) return;
    setLoans(prev => prev.map(l => {
      if (l.etudiantId === currentUser.id && !l.amendePayee && l.amende > 0) {
        return { ...l, amendePayee: true };
      }
      return l;
    }));
    showToast('Amende réglée avec succès ! Vos droits de réservation sont réactivés.', 'success');
  };

  // Vérification si l'utilisateur peut ajouter un livre
  const checkCanAdd = () => {
    return peutAjouter(currentUser, selection, loans);
  };

  // Connexion (enregistre uniquement user.id dans la session)
  const login = (user: User) => {
    setCurrentUserId(user.id);
    localStorage.setItem('bibliotech_v6_user_id', user.id);
    setAuthModalOpen(false);

    // Si l'utilisateur avait des articles dans sa sélection avant connexion
    if (selection.length > 0) {
      showToast(`Bon retour, ${user.prenom} ! Vos réservations vous attendent.`, 'success');
      setSelectionDrawerOpen(true);
    } else {
      showToast(`Bienvenue, ${user.prenom} ! Connecté en tant que ${user.role.toLowerCase()}.`, 'success');
    }
  };

  // Déconnexion
  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem('bibliotech_v6_user_id');
    setActiveView('catalogue');
    showToast('Vous êtes déconnecté.', 'info');
  };

  // Ajouter à mes réservations (Règle 1, 6a, 8)
  const addToSelection = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Règle 6a : Si l'étudiant a une amende impayée (> 0), désactiver et avertir
    if (userHasFines) {
      showToast('Réglez votre amende pour emprunter de nouveaux livres.', 'error');
      return;
    }

    if (book.disponibilite === 'Épuisé') {
      showToast('Cet ouvrage est épuisé. Utilisez le bouton Réserver.', 'error');
      return;
    }

    // Si déjà dans la sélection, on le retire
    if (selection.includes(bookId)) {
      removeFromSelection(bookId);
      return;
    }

    // Règle 8 : Vérifier la limite de 3 livres (emprunts en cours + sélection < 3)
    if (!checkCanAdd()) {
      showToast('Vous pouvez emprunter 3 livres maximum.', 'error');
      return;
    }

    setSelection(prev => [...prev, bookId]);
    showToast(`« ${book.titre} » ajouté à vos réservations.`);
  };

  const removeFromSelection = (bookId: string) => {
    setSelection(prev => prev.filter(id => id !== bookId));
    showToast('Ouvrage retiré de vos réservations.', 'info');
  };

  const clearSelection = () => {
    setSelection([]);
  };

  // Validation : « Demander l'emprunt » (Règle 1, 6a, 8)
  const validateSelection = () => {
    if (selection.length === 0) {
      showToast('Vos réservations sont vides. Parcourez le catalogue.', 'info');
      return;
    }

    if (!currentUser) {
      showToast('Veuillez vous connecter pour demander l’emprunt.', 'info');
      setAuthModalOpen(true);
      return;
    }

    // Règle 6a : amende impayée
    if (userHasFines) {
      showToast('Réglez votre amende pour emprunter de nouveaux livres.', 'error');
      return;
    }

    // Règle 8 : emprunts en cours + sélection <= 3
    const empruntsActifs = loans.filter(
      l => l.etudiantId === currentUser.id && (l.statut === 'En cours' || l.statut === 'En attente de retrait')
    ).length;

    if (empruntsActifs + selection.length > 3) {
      showToast('Vous pouvez emprunter 3 livres maximum.', 'error');
      return;
    }

    // Création des emprunts en statut "En attente de retrait" (retrait sous 48h)
    const now = new Date();
    const retraitLimite = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const retourPrevue = new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000);

    const selectedBooks = books.filter(b => selection.includes(b.id));

    const newLoans: Emprunt[] = selectedBooks.map((b, idx) => ({
      id: `emp-auto-${Date.now()}-${idx}`,
      ouvrageId: b.id,
      ouvrageTitre: b.titre,
      ouvrageCouverture: b.couvertureUrl,
      ouvrageAuteur: b.auteur,
      etudiantId: currentUser.id,
      etudiantNomComplet: `${currentUser.prenom} ${currentUser.nom}`,
      etudiantCarte: currentUser.carteEtudiante,
      dateSortie: now.toISOString(),
      dateRetourPrevue: retourPrevue.toISOString(),
      dateRetourEffective: null,
      statut: 'En attente de retrait',
      prolonge: false,
      amende: 0,
      amendePayee: false,
      dateRetraitLimite: retraitLimite.toISOString(),
    }));

    // Mise à jour de la disponibilité des ouvrages
    setBooks(prev => prev.map(book => {
      if (selection.includes(book.id)) {
        const remaining = Math.max(0, book.exemplairesDisponibles - 1);
        return {
          ...book,
          exemplairesDisponibles: remaining,
          disponibilite: remaining === 0 ? 'Épuisé' : 'En rayon',
          empruntsTotal: book.empruntsTotal + 1,
        };
      }
      return book;
    }));

    setLoans(prev => [...newLoans, ...prev]);

    // Règle 7 : Notification sans doublon (titre court, date, lien de redirection)
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      destinataireId: currentUser.id,
      destinataireEmail: currentUser.email,
      titre: `Action requise : retrait au comptoir sous 48h (${selectedBooks.length} ouvrage${selectedBooks.length > 1 ? 's' : ''})`,
      date: now.toISOString(),
      lue: false,
      targetView: 'emprunts',
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Vider la sélection & fermer le volet
    setSelection([]);
    setSelectionDrawerOpen(false);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    showToast('Demande d’emprunt validée ! Vos livres sont mis de côté au comptoir pendant 48h.', 'success');
  };

  // Favoris
  const toggleFavorite = (bookId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(bookId);
      if (exists) {
        showToast('Retiré des favoris.', 'info');
        return prev.filter(id => id !== bookId);
      } else {
        showToast('Ajouté à vos favoris.');
        return [...prev, bookId];
      }
    });
  };

  // Réservation d'un livre épuisé (Règle 1, 6a, 8)
  const reserveBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (!currentUser) {
      showToast('Connectez-vous pour réserver cet ouvrage.', 'info');
      setAuthModalOpen(true);
      return;
    }

    // Règle 6a : amende impayée
    if (userHasFines) {
      showToast('Réglez votre amende pour emprunter de nouveaux livres.', 'error');
      return;
    }

    // Règle 8 : Limite de 3 livres appliquée à la réservation
    const empruntsActifs = loans.filter(
      l => l.etudiantId === currentUser.id && (l.statut === 'En cours' || l.statut === 'En attente de retrait')
    ).length;

    if (empruntsActifs + selection.length >= 3) {
      showToast('Vous pouvez emprunter 3 livres maximum.', 'error');
      return;
    }

    const alreadyReserved = reservations.some(
      r => r.ouvrageId === bookId && r.etudiantId === currentUser.id && r.statut === 'En attente'
    );

    if (alreadyReserved) {
      showToast('Vous avez déjà une réservation en attente pour ce livre.', 'info');
      return;
    }

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      ouvrageId: book.id,
      ouvrageTitre: book.titre,
      ouvrageCouverture: book.couvertureUrl,
      etudiantId: currentUser.id,
      etudiantNomComplet: `${currentUser.prenom} ${currentUser.nom}`,
      etudiantEmail: currentUser.email,
      dateDemande: new Date().toISOString(),
      statut: 'En attente',
    };

    setReservations(prev => [newRes, ...prev]);

    // Règle 7 : Notification sans doublon
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      destinataireId: currentUser.id,
      destinataireEmail: currentUser.email,
      titre: `Réservation enregistrée : « ${book.titre} »`,
      date: new Date().toISOString(),
      lue: false,
      targetView: 'emprunts',
    };

    setNotifications(prev => [notif, ...prev]);
    showToast('Livre réservé. Vous serez notifié dès son retour.', 'success');
  };

  // Prolonger un emprunt (+7 jours, 1 seule fois, Règle 6b)
  const prolongLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    if (loan.prolonge) {
      showToast('Prolongation déjà effectuée.', 'error');
      return;
    }

    // Vérifier si la date de retour est dépassée
    const isOverdue = new Date() > new Date(loan.dateRetourPrevue);
    if (isOverdue) {
      showToast('Échéance dépassée : impossible de prolonger un livre en retard.', 'error');
      return;
    }

    // Vérifier si un autre étudiant a réservé ce livre
    const hasReservation = reservations.some(
      r => r.ouvrageId === loan.ouvrageId && r.statut === 'En attente'
    );

    if (hasReservation) {
      showToast('Prolongation impossible : cet ouvrage est réservé par un autre étudiant.', 'error');
      return;
    }

    const currentDue = new Date(loan.dateRetourPrevue);
    const newDue = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000);

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          prolonge: true,
          dateRetourPrevue: newDue.toISOString(),
          statut: 'En cours',
        };
      }
      return l;
    }));

    showToast('Prêt prolongé de 7 jours avec succès !', 'success');
  };

  // Rendre un livre (Bibliothécaire ou validation étudiant - Règle 2)
  const returnLoan = (loanId: string) => {
    // Règle 2 Admin : Pas de tâches de comptoir pour l'admin
    if (currentUser?.role === 'ADMIN') {
      showToast("Action réservée au bibliothécaire.", 'error');
      return;
    }

    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    // Règle 2 : Garde stricte dans la fonction (refus si amende impayée)
    if (!loan.amendePayee && loan.amende > 0) {
      showToast("Encaissez d'abord l'amende avant de valider le retour.", 'error');
      return;
    }

    const returnDate = new Date();
    const dueDate = new Date(loan.dateRetourPrevue);

    let fine = loan.amende;
    let finePaid = loan.amendePayee;

    // Si l'amende n'était pas déjà réglée, on la calcule au moment de la restitution
    if (!loan.amendePayee) {
      if (returnDate > dueDate) {
        const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        fine = Number((diffDays * 5.00).toFixed(2));
        finePaid = fine === 0;
      } else {
        finePaid = true;
      }
    }

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          statut: 'Rendu',
          dateRetourEffective: returnDate.toISOString(),
          amende: fine,
          amendePayee: finePaid,
        };
      }
      return l;
    }));

    // Réservation en attente éventuelle
    const pendingResIndex = reservations.findIndex(
      r => r.ouvrageId === loan.ouvrageId && r.statut === 'En attente'
    );

    if (pendingResIndex !== -1) {
      const res = reservations[pendingResIndex];
      setReservations(prev => prev.map((r, i) => i === pendingResIndex ? { ...r, statut: 'Disponible' } : r));

      const notifRes: AppNotification = {
        id: `notif-${Date.now()}-res`,
        destinataireId: res.etudiantId,
        destinataireNom: res.etudiantNomComplet,
        destinataireEmail: res.etudiantEmail,
        titre: `Action requise : « ${res.ouvrageTitre} » disponible au comptoir`,
        evenementType: 'Disponibilité',
        statutEnvoi: 'Envoyé',
        date: returnDate.toISOString(),
        lue: false,
        targetView: 'emprunts',
      };
      setNotifications(prev => [notifRes, ...prev]);
    } else {
      setBooks(prev => prev.map(b => {
        if (b.id === loan.ouvrageId) {
          const newCopies = b.exemplairesDisponibles + 1;
          return {
            ...b,
            exemplairesDisponibles: newCopies,
            disponibilite: 'En rayon',
          };
        }
        return b;
      }));
    }

    if (fine > 0) {
      showToast(`Livre restitué avec retard. Amende calculée : ${fine.toFixed(2)} DH`, 'info');
    } else {
      showToast('Livre restitué avec succès. Merci !', 'success');
    }
  };

  // Règle 3 : Annuler une réservation
  const cancelReservation = (reservationId: string) => {
    setReservations(prev => prev.filter(r => r.id !== reservationId));
    showToast('Réservation annulée avec succès.', 'info');
  };

  const cancelLoanRequest = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan || loan.statut !== 'En attente de retrait') return;

    setLoans(prev => prev.filter(l => l.id !== loanId));
    setBooks(prev => prev.map(b => {
      if (b.id === loan.ouvrageId) {
        const newCopies = Math.min(b.exemplairesTotal, b.exemplairesDisponibles + 1);
        return {
          ...b,
          exemplairesDisponibles: newCopies,
          disponibilite: 'En rayon',
        };
      }
      return b;
    }));
    showToast('Demande de retrait annulée avec succès.', 'info');
  };

  // Règle 6 : Renvoyer une notification en échec
  const resendNotification = (notifId: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notifId) {
        return {
          ...n,
          statutEnvoi: 'Envoyé',
          date: new Date().toISOString(),
        };
      }
      return n;
    }));
    showToast('Notification renvoyée avec succès.', 'success');
  };

  // Règle 4 : Scanner un livre (emprunt ou retour) - Ne gère QUE les livres
  const scanBook = (isbnOrId: string, action: 'emprunt' | 'retour') => {
    const trimmed = isbnOrId.trim();
    const book = books.find(
      b => b.isbn.toLowerCase() === trimmed.toLowerCase() || 
           b.id.toLowerCase() === trimmed.toLowerCase() || 
           b.titre.toLowerCase().includes(trimmed.toLowerCase())
    );

    if (!book) {
      showToast('Ouvrage non trouvé dans le fonds documentaire', 'error');
      return { success: false, message: 'Ouvrage non trouvé' };
    }

    if (action === 'retour') {
      const activeLoan = loans.find(
        l => l.ouvrageId === book.id && l.statut === 'En cours'
      );
      if (!activeLoan) {
        showToast(`Aucun prêt actif trouvé pour « ${book.titre} »`, 'info');
        return { success: false, message: 'Aucun prêt actif pour ce livre', book };
      }
      if (!activeLoan.amendePayee && activeLoan.amende > 0) {
        showToast("Encaissez d'abord l'amende avant de valider le retour.", 'error');
        return { success: false, message: 'Amende impayée à encaisser', book };
      }
      returnLoan(activeLoan.id);
      return { success: true, message: `Retour enregistré pour « ${book.titre} »`, book };
    } else {
      if (book.disponibilite !== 'En rayon') {
        showToast(`« ${book.titre} » n'est pas disponible en rayon (${book.disponibilite})`, 'error');
        return { success: false, message: 'Ouvrage indisponible', book };
      }
      showToast(`Ouvrage « ${book.titre} » prêt pour l'emprunt`, 'success');
      return { success: true, message: 'Ouvrage disponible en rayon', book };
    }
  };

  // Confirmer le retrait au comptoir (Bibliothécaire)
  const confirmPickup = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const now = new Date();
    const returnDue = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          statut: 'En cours',
          dateSortie: now.toISOString(),
          dateRetourPrevue: returnDue.toISOString(),
          dateRetraitLimite: undefined,
        };
      }
      return l;
    }));

    showToast('Retrait confirmé ! Prêt en cours pour 14 jours.', 'success');
  };

  // Demander le retour d'un livre (Étudiant -> passe au statut 'Retour à valider' - Point 1)
  const requestReturn = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    if (!loan.amendePayee && loan.amende > 0) {
      showToast("Réglez d'abord votre amende avant de restituer l'ouvrage.", 'error');
      return;
    }

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          statut: 'Retour à valider',
        };
      }
      return l;
    }));

    showToast("Demande de retour enregistrée. Déposez l'ouvrage au comptoir pour validation.", 'success');
  };

  // Marquer une amende comme payée (Résout aussi les notifications liées - Point 3)
  const markFinePaid = (loanId: string) => {
    if (currentUser?.role === 'ADMIN') {
      showToast("Action réservée au bibliothécaire.", 'error');
      return;
    }

    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return { ...l, amendePayee: true };
      }
      return l;
    }));

    // Point 3 : Résoudre ou marquer comme lue la notification d'amende/retard de cet étudiant
    setNotifications(prev => prev.map(n => {
      if (
        n.destinataireId === loan.etudiantId && 
        (n.evenementType === 'Retard' || n.titre.toLowerCase().includes('amende') || n.titre.toLowerCase().includes('retard'))
      ) {
        return { ...n, lue: true };
      }
      return n;
    }));

    showToast('Amende réglée avec succès.', 'success');
  };

  // Gestion des ouvrages (Reservée aux Bibliothécaires, masquée pour Admin)
  const addBook = (bookData: Omit<Ouvrage, 'id' | 'empruntsTotal'>) => {
    if (currentUser?.role === 'ADMIN') {
      showToast("L'administrateur n'a pas accès à la gestion des ouvrages.", 'error');
      return;
    }
    const newBook: Ouvrage = {
      ...bookData,
      id: `book-${Date.now()}`,
      empruntsTotal: 0,
    };
    setBooks(prev => [newBook, ...prev]);
    showToast(`Ouvrage « ${newBook.titre} » ajouté au catalogue.`);
  };

  const updateBook = (book: Ouvrage) => {
    if (currentUser?.role === 'ADMIN') {
      showToast("L'administrateur n'a pas accès à la gestion des ouvrages.", 'error');
      return;
    }
    setBooks(prev => prev.map(b => b.id === book.id ? book : b));
    showToast(`Ouvrage « ${book.titre} » mis à jour.`);
  };

  const deleteBook = (bookId: string) => {
    if (currentUser?.role === 'ADMIN') {
      showToast("L'administrateur n'a pas accès à la gestion des ouvrages.", 'error');
      return;
    }
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setSelection(prev => prev.filter(id => id !== bookId));
    showToast('Ouvrage supprimé du catalogue.', 'info');
  };

  // Scanner d'accès et passage
  const verifyAndRecordAccess = (identifier: string, methode: 'Carte' | 'QR Code') => {
    const trimmed = identifier.trim().toUpperCase();
    const user = users.find(
      u => u.carteEtudiante.toUpperCase() === trimmed || u.id.toUpperCase() === trimmed
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (!user) {
      const passage: AccesPassage = {
        id: `acc-${Date.now()}`,
        etudiantId: 'inconnu',
        nomComplet: `Identifiant: ${trimmed}`,
        carteEtudiante: trimmed,
        role: 'ETUDIANT',
        heureEntree: timeStr,
        heureSortie: null,
        methode,
        autorise: false,
        motifRefus: 'Carte non reconnue dans l’annuaire',
      };
      setAccessPassages(prev => [passage, ...prev]);
      return { autorise: false, motifRefus: 'Carte non reconnue' };
    }

    if (user.statut === 'Suspendu') {
      const passage: AccesPassage = {
        id: `acc-${Date.now()}`,
        etudiantId: user.id,
        nomComplet: `${user.prenom} ${user.nom}`,
        carteEtudiante: user.carteEtudiante,
        role: user.role,
        heureEntree: timeStr,
        heureSortie: null,
        methode,
        autorise: false,
        motifRefus: 'Carte expirée ou compte suspendu',
      };
      setAccessPassages(prev => [passage, ...prev]);
      return { autorise: false, user, motifRefus: 'Carte expirée ou compte suspendu' };
    }

    // Accès autorisé
    const passage: AccesPassage = {
      id: `acc-${Date.now()}`,
      etudiantId: user.id,
      nomComplet: `${user.prenom} ${user.nom}`,
      carteEtudiante: user.carteEtudiante,
      role: user.role,
      heureEntree: timeStr,
      heureSortie: null,
      methode,
      autorise: true,
    };
    setAccessPassages(prev => [passage, ...prev]);
    return { autorise: true, user };
  };

  const recordExit = (passageId: string, motifManuel?: string) => {
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setAccessPassages(prev => prev.map(p => {
      if (p.id === passageId) {
        return { 
          ...p, 
          heureSortie: timeStr,
          noteMaintenance: motifManuel,
          motifRefus: motifManuel ? `Sortie manuelle (maintenance) : ${motifManuel}` : p.motifRefus,
        };
      }
      return p;
    }));
    showToast(motifManuel ? 'Sortie manuelle enregistrée avec succès.' : 'Sortie enregistrée.', 'info');
  };

  // Gestion des utilisateurs (Règle 5 : Garde de sécurité dans la fonction)
  const updateUserRole = (targetUserId: string, newRole: UserRole) => {
    // 1. Seul un Administrateur peut modifier un rôle
    if (!currentUser || currentUser.role !== 'ADMIN') {
      showToast("Action réservée à l'administrateur", 'error');
      return;
    }

    // 2. Interdire à quiconque de modifier son propre rôle
    if (currentUser.id === targetUserId) {
      showToast('Vous ne pouvez pas modifier votre propre rôle', 'error');
      return;
    }

    setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
    showToast(`Rôle mis à jour : ${newRole}`);
  };

  const addUser = (userData: Omit<User, 'id' | 'dateInscription'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      dateInscription: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    showToast(`Adhérent ${newUser.prenom} ${newUser.nom} ajouté.`);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    showToast(`Fiche de ${updatedUser.prenom} mise à jour.`);
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('Utilisateur supprimé.', 'info');
  };

  // Notifications
  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, lue: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
    showToast('Toutes les notifications sont marquées comme lues.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        books,
        loans,
        reservations,
        accessPassages,
        notifications,
        selection,
        favorites,
        toasts,
        activeView,
        setActiveView,
        securityFilter,
        setSecurityFilter,
        darkMode,
        toggleDarkMode,
        authModalOpen,
        setAuthModalOpen,
        selectionDrawerOpen,
        setSelectionDrawerOpen,
        studentQrModalOpen,
        setStudentQrModalOpen,
        gmailModalNotification,
        setGmailModalNotification,
        login,
        logout,
        showToast,
        removeToast,
        addToSelection,
        removeFromSelection,
        clearSelection,
        validateSelection,
        toggleFavorite,
        checkCanAdd,
        userHasFines,
        userTotalUnpaidFines,
        payAllUserFines,
        addBook,
        updateBook,
        deleteBook,
        reserveBook,
        prolongLoan,
        requestReturn,
        returnLoan,
        confirmPickup,
        markFinePaid,
        cancelReservation,
        cancelLoanRequest,
        resendNotification,
        scanBook,
        verifyAndRecordAccess,
        recordExit,
        connexionErrors,
        recordConnexionError,
        updateUserRole,
        addUser,
        updateUser,
        deleteUser,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
