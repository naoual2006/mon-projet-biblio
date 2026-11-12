/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Emprunt, EmpruntStatut } from '../../types';
import { BookCover } from '../../components/BookCover';
import { 
  BookMarked, 
  AlertTriangle, 
  Coins, 
  CheckCircle2, 
  Calendar, 
  QrCode, 
  ChevronRight, 
  X,
  Search,
  Filter,
  RotateCcw,
  Check
} from 'lucide-react';

export const LoansView: React.FC = () => {
  const { 
    loans, 
    users,
    currentUser, 
    prolongLoan, 
    returnLoan, 
    requestReturn,
    markFinePaid,
    confirmPickup,
    setStudentQrModalOpen, 
    setActiveView,
    reservations 
  } = useApp();

  const isStaff = currentUser?.role === 'BIBLIOTHECAIRE' || currentUser?.role === 'ADMIN';

  // State pour le suivi des prêts (Bibliothécaire/Admin)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'En cours' | 'Retour à valider' | 'En retard' | 'Rendu'>('Tous');

  // Modal détail
  const [selectedLoanForDetail, setSelectedLoanForDetail] = useState<Emprunt | null>(null);
  const [finePaymentModalLoan, setFinePaymentModalLoan] = useState<Emprunt | null>(null);
  const [showHistoryLimit, setShowHistoryLimit] = useState(10);

  // Écouteur pour fermer la modale de paiement avec la touche Échap (PROBLÈME 1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFinePaymentModalLoan(null);
      }
    };
    if (finePaymentModalLoan) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [finePaymentModalLoan]);

  // Fonction de gestion du clic sur le retour par l'étudiant
  const handleReturnClick = (loan: Emprunt) => {
    const now = new Date();
    const dueDate = new Date(loan.dateRetourPrevue);
    let fineAmount = loan.amende;

    if (fineAmount === 0 && now > dueDate && !loan.amendePayee) {
      const diffTime = Math.abs(now.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = Number((diffDays * 5.00).toFixed(2));
    }

    if (fineAmount > 0 && !loan.amendePayee) {
      setFinePaymentModalLoan({ ...loan, amende: fineAmount });
    } else {
      requestReturn(loan.id);
    }
  };

  // Pour l'étudiant : uniquement ses propres emprunts
  // Pour le bibliothécaire : TOUS les emprunts (Règle 1)
  const displayedLoans = useMemo(() => {
    if (!isStaff) {
      if (!currentUser) return [];
      return loans.filter(l => l.etudiantId === currentUser.id);
    }

    // Vue Bibliothécaire / Admin : tous les adhérents avec recherche et filtre par statut
    return loans.filter(loan => {
      // Filtre par statut
      if (statusFilter !== 'Tous' && loan.statut !== statusFilter) {
        return false;
      }

      // Recherche par nom d'adhérent ou carte ou titre
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = loan.etudiantNomComplet.toLowerCase().includes(q);
        const matchCard = loan.etudiantCarte.toLowerCase().includes(q);
        const matchBook = loan.ouvrageTitre.toLowerCase().includes(q);
        if (!matchName && !matchCard && !matchBook) return false;
      }

      return true;
    });
  }, [loans, isStaff, currentUser, statusFilter, searchTerm]);

  // Données statistiques pour l'étudiant
  const studentLoans = useMemo(() => {
    if (!currentUser) return [];
    return loans.filter(l => l.etudiantId === currentUser.id);
  }, [loans, currentUser]);

  const empruntsEnCours = useMemo(() => {
    return studentLoans.filter(l => l.statut === 'En cours' || l.statut === 'En attente de retrait' || l.statut === 'Retour à valider');
  }, [studentLoans]);

  const empruntsEnRetard = useMemo(() => {
    const now = new Date();
    return studentLoans.filter(l => l.statut === 'En cours' && new Date(l.dateRetourPrevue) < now);
  }, [studentLoans]);

  const totalAmendes = useMemo(() => {
    return studentLoans.reduce((acc, curr) => {
      if (!curr.amendePayee && curr.amende > 0) {
        return acc + curr.amende;
      }
      return acc;
    }, 0);
  }, [studentLoans]);

  const historiqueEmprunts = useMemo(() => {
    return studentLoans.filter(l => l.statut === 'Rendu');
  }, [studentLoans]);

  const calculateDaysLeft = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  const getProlongationStatus = (loan: Emprunt) => {
    if (loan.prolonge) {
      return { canProlong: false, reason: 'Prolongation déjà effectuée' };
    }
    const isOverdue = new Date() > new Date(loan.dateRetourPrevue);
    if (isOverdue) {
      return { canProlong: false, reason: 'Échéance de retour dépassée' };
    }
    const isReserved = reservations.some(
      r => r.ouvrageId === loan.ouvrageId && r.statut === 'En attente'
    );
    if (isReserved) {
      return { canProlong: false, reason: 'Réservé par un autre étudiant' };
    }
    return { canProlong: true, reason: '' };
  };

  // ========================================================
  // 1. VUE BIBLIOTHÉCAIRE / ADMIN : « Suivi des prêts » (Règle 1)
  // ========================================================
  if (isStaff) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <BookMarked className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Suivi des prêts</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Registre global des emprunts de tous les adhérents de la bibliothèque.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 self-start sm:self-auto">
            {displayedLoans.length} prêt{displayedLoans.length > 1 ? 's' : ''} répertorié{displayedLoans.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Barre de recherche par adhérent & filtre statut */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom d'adhérent, carte BU ou titre..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-[11px] text-slate-400 hover:text-slate-600"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Tous">Tous</option>
              <option value="En cours">En cours</option>
              <option value="Retour à valider">Retour à valider</option>
              <option value="En retard">En retard</option>
              <option value="Rendu">Rendu</option>
            </select>

            {(searchTerm || statusFilter !== 'Tous') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('Tous');
                }}
                className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tableau 5 colonnes : Adhérent, Ouvrage, Date retour prévue, Statut, Action (Règle 1) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Adhérent</th>
                  <th className="px-4 py-3">Ouvrage</th>
                  <th className="px-4 py-3">Date retour prévue</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedLoans.map(loan => {
                  const daysLeft = calculateDaysLeft(loan.dateRetourPrevue);
                  const isLate = loan.statut === 'En cours' && daysLeft < 0;
                  const isFineUnpaid = !loan.amendePayee && loan.amende > 0;

                  return (
                    <tr
                      key={loan.id}
                      onClick={() => setSelectedLoanForDetail(loan)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Colonne 1 : Adhérent */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {users.find(u => u.id === loan.etudiantId)?.prenom ? `${users.find(u => u.id === loan.etudiantId)?.prenom} ${users.find(u => u.id === loan.etudiantId)?.nom}` : loan.etudiantNomComplet}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {users.find(u => u.id === loan.etudiantId)?.carteEtudiante || loan.etudiantCarte}
                        </p>
                      </td>

                      {/* Colonne 2 : Ouvrage */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-10 rounded overflow-hidden shrink-0 shadow-2xs">
                            <BookCover
                              src={loan.ouvrageCouverture}
                              alt=""
                              title={loan.ouvrageTitre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                              {loan.ouvrageTitre}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{loan.ouvrageAuteur}</p>
                          </div>
                        </div>
                      </td>

                      {/* Colonne 3 : Date de retour prévue */}
                      <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {new Date(loan.dateRetourPrevue).toLocaleDateString('fr-FR')}
                      </td>

                      {/* Colonne 4 : Statut */}
                      <td className="px-4 py-3.5">
                        {loan.statut === 'Rendu' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Rendu
                          </span>
                        ) : loan.statut === 'Retour à valider' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                            Retour à valider
                          </span>
                        ) : loan.statut === 'En attente de retrait' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            En attente de retrait
                          </span>
                        ) : isLate ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            En retard {loan.amende > 0 ? `(${loan.amende.toFixed(2)} DH)` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            En cours
                          </span>
                        )}
                      </td>

                      {/* Colonne 5 : Action (Règle 2 : Valider le retour désactivé si amende impayée) */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        {loan.statut === 'En attente de retrait' ? (
                          <button
                            onClick={() => confirmPickup(loan.id)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                          >
                            Confirmer retrait
                          </button>
                        ) : loan.statut === 'Rendu' ? (
                          <span className="text-slate-400 text-xs font-mono">-</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {isFineUnpaid && (
                              <button
                                onClick={() => markFinePaid(loan.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 font-semibold text-xs transition-colors"
                              >
                                Encaisser ({loan.amende.toFixed(2)} DH)
                              </button>
                            )}

                            <button
                              onClick={() => returnLoan(loan.id)}
                              disabled={isFineUnpaid}
                              title={isFineUnpaid ? "Encaissez d'abord l'amende" : "Valider le retour"}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                                isFineUnpaid
                                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                                  : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900'
                              }`}
                            >
                              Valider retour
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {displayedLoans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                      Aucun prêt trouvé pour les critères sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Détail */}
        {selectedLoanForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  Détail du prêt
                </span>
                <button
                  onClick={() => setSelectedLoanForDetail(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-20 rounded-xl overflow-hidden shrink-0 shadow-xs border border-slate-100 dark:border-slate-700">
                  <BookCover
                    src={selectedLoanForDetail.ouvrageCouverture}
                    alt=""
                    title={selectedLoanForDetail.ouvrageTitre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedLoanForDetail.ouvrageTitre}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedLoanForDetail.ouvrageAuteur}</p>
                  <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 mt-1">
                    Prêt #{selectedLoanForDetail.id}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Adhérent emprunteur</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLoanForDetail.etudiantNomComplet} ({selectedLoanForDetail.etudiantCarte})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date d'emprunt</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(selectedLoanForDetail.dateSortie).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date limite de retour</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {new Date(selectedLoanForDetail.dateRetourPrevue).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {selectedLoanForDetail.dateRetourEffective && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Restitué le</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {new Date(selectedLoanForDetail.dateRetourEffective).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Amende de retard</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedLoanForDetail.amende.toFixed(2)} DH {selectedLoanForDetail.amendePayee ? '(Réglée)' : '(Non payée)'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLoanForDetail(null)}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // 2. VUE ÉTUDIANT : « Mes emprunts » (uniquement les siens)
  // ========================================================
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookMarked className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Mes Emprunts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Suivi en temps réel de vos prêts de livres, délais de restitution et amendes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStudentQrModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Mon Pass Portique QR</span>
          </button>
        </div>
      </div>

      {/* 3 GRANDES CARTES CHIFFRÉES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Carte 1 : Emprunts en cours */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Emprunts en cours
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {empruntsEnCours.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Sur 3 livres autorisés
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookMarked className="w-6 h-6" />
          </div>
        </div>

        {/* Carte 2 : En retard */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              En retard
            </p>
            <p className={`text-3xl font-black mt-1 ${empruntsEnRetard.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {empruntsEnRetard.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {empruntsEnRetard.length > 0 ? 'À rapporter sans délai' : 'Aucun retard actif'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            empruntsEnRetard.length > 0 
              ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400' 
              : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Carte 3 : Mes amendes (total en €) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mes amendes (total)
            </p>
            <p className={`text-3xl font-black mt-1 ${totalAmendes > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {totalAmendes.toFixed(2)} DH
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              5,00 DH / jour de retard
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION : EMPRUNTS EN COURS ET EN RETARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Livres actuellement en votre possession</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {empruntsEnCours.length + empruntsEnRetard.length}
            </span>
          </h2>
          <button
            onClick={() => setActiveView('catalogue')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Chercher un autre livre</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {empruntsEnCours.length === 0 && empruntsEnRetard.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Vous n'avez aucun emprunt en cours
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Explorez le catalogue pour trouver un livre à emprunter.
            </p>
            <button
              onClick={() => setActiveView('catalogue')}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Parcourir le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...empruntsEnRetard, ...empruntsEnCours].map(loan => {
              const daysLeft = calculateDaysLeft(loan.dateRetourPrevue);
              const isLate = daysLeft < 0;
              const { canProlong, reason } = getProlongationStatus(loan);

              return (
                <div
                  key={loan.id}
                  onClick={() => setSelectedLoanForDetail(loan)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 ${
                    isLate 
                      ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20' 
                      : 'border-slate-200/90 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-22 rounded-xl overflow-hidden shrink-0 shadow-xs border border-slate-100 dark:border-slate-700">
                      <BookCover
                        src={loan.ouvrageCouverture}
                        alt={loan.ouvrageTitre}
                        title={loan.ouvrageTitre}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {loan.statut === 'Retour à valider' ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                            Retour à valider par le bibliothécaire
                          </span>
                        ) : loan.statut === 'En attente de retrait' ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            En attente de retrait au comptoir
                          </span>
                        ) : isLate ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 animate-pulse">
                            En retard ({Math.abs(daysLeft)} jour{Math.abs(daysLeft) > 1 ? 's' : ''})
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            En cours ({daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {loan.ouvrageTitre}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {loan.ouvrageAuteur}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                          Retour prévu : <strong className="text-slate-700 dark:text-slate-200">{new Date(loan.dateRetourPrevue).toLocaleDateString('fr-FR')}</strong>
                        </span>
                      </div>

                      {loan.amende > 0 && (
                        <div className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          <span>Amende : {loan.amende.toFixed(2)} DH</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="text-left">
                      {!canProlong && reason && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                          {reason}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {canProlong && loan.statut === 'En cours' && (
                        <button
                          type="button"
                          onClick={() => prolongLoan(loan.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
                          title="Prolonger de 7 jours"
                        >
                          Prolonger (+7 jours)
                        </button>
                      )}

                      {loan.statut === 'Retour à valider' ? (
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
                          Retour à valider par le bibliothécaire
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReturnClick(loan)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          Rendre l'ouvrage
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION : HISTORIQUE DES EMPRUNTS ÉTUDIANT */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Historique des emprunts restitués</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {historiqueEmprunts.length}
            </span>
          </h2>
        </div>

        {historiqueEmprunts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            Aucun historique de restitution pour le moment.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Ouvrage</th>
                    <th className="px-4 py-3">Date Sortie</th>
                    <th className="px-4 py-3">Date Retour</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Amende</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {historiqueEmprunts.slice(0, showHistoryLimit).map(loan => (
                    <tr
                      key={loan.id}
                      onClick={() => setSelectedLoanForDetail(loan)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-10 rounded overflow-hidden shrink-0 shadow-2xs">
                            <BookCover
                              src={loan.ouvrageCouverture}
                              alt=""
                              title={loan.ouvrageTitre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                              {loan.ouvrageTitre}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{loan.ouvrageAuteur}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono">
                        {new Date(loan.dateSortie).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono">
                        {loan.dateRetourEffective
                          ? new Date(loan.dateRetourEffective).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Rendu
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        {loan.amende > 0 ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className={!loan.amendePayee ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                              {loan.amende.toFixed(2)} DH
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-sans font-semibold ${
                                loan.amendePayee 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}>
                                {loan.amendePayee ? 'Payée' : 'Impayée'}
                              </span>
                              {!loan.amendePayee && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFinePaymentModalLoan(loan);
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold transition-colors"
                                >
                                  Payer
                                </button>
                              )}
                            </div>
                          </div>
                        ) : '0,00 DH'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {historiqueEmprunts.length > 10 && showHistoryLimit < historiqueEmprunts.length && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  onClick={() => setShowHistoryLimit(prev => prev + 10)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Voir plus d'anciens emprunts...
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Détail */}
      {selectedLoanForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Fiche Récapitulative du Prêt
              </h2>
              <button
                onClick={() => setSelectedLoanForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-20 rounded-xl overflow-hidden shrink-0 shadow-xs border border-slate-100 dark:border-slate-700">
                  <BookCover
                    src={selectedLoanForDetail.ouvrageCouverture}
                    alt=""
                    title={selectedLoanForDetail.ouvrageTitre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedLoanForDetail.ouvrageTitre}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedLoanForDetail.ouvrageAuteur}</p>
                  <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 mt-1">
                    Prêt #{selectedLoanForDetail.id}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut actuel</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedLoanForDetail.statut}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date d'emprunt</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(selectedLoanForDetail.dateSortie).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date limite de retour</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {new Date(selectedLoanForDetail.dateRetourPrevue).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {selectedLoanForDetail.dateRetourEffective && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Restitué le</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {new Date(selectedLoanForDetail.dateRetourEffective).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Amende de retard</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedLoanForDetail.amende.toFixed(2)} DH
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLoanForDetail(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Simulation Règlement d'amende (PROBLÈME 1 : Touche Échap & Simulation) */}
      {finePaymentModalLoan && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setFinePaymentModalLoan(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setFinePaymentModalLoan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Règlement de l'amende de retard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                L'ouvrage <strong className="text-slate-800 dark:text-slate-200">« {finePaymentModalLoan.ouvrageTitre} »</strong> présente une amende de retard. L'amende doit être réglée en ligne (simulation de paiement) ou directement au comptoir pour valider la restitution.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-1">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Montant de l'amende à régler :</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {finePaymentModalLoan.amende.toFixed(2)} DH
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFinePaymentModalLoan(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const loanId = finePaymentModalLoan.id;
                  markFinePaid(loanId);
                  requestReturn(loanId);
                  setFinePaymentModalLoan(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4" />
                <span>Payer maintenant ({finePaymentModalLoan.amende.toFixed(2)} DH)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
