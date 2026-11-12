/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookCover } from '../../components/BookCover';
import { 
  Bookmark, 
  X, 
  Trash2, 
  Clock, 
  ArrowRight, 
  Coins
} from 'lucide-react';

export const SelectionDrawer: React.FC = () => {
  const { 
    selectionDrawerOpen, 
    setSelectionDrawerOpen, 
    selection, 
    books, 
    removeFromSelection, 
    clearSelection, 
    validateSelection,
    currentUser,
    userHasFines,
    loans,
    reservations,
    cancelLoanRequest,
    cancelReservation
  } = useApp();

  if (!selectionDrawerOpen) return null;

  const selectedBooks = books.filter(b => selection.includes(b.id));

  const userLoansEnAttente = currentUser 
    ? loans.filter(l => l.etudiantId === currentUser.id && l.statut === 'En attente de retrait')
    : [];

  const userReservationsEnAttente = currentUser
    ? reservations.filter(r => r.etudiantId === currentUser.id && (r.statut === 'En attente' || r.statut === 'Disponible'))
    : [];

  const empruntsActifsCount = currentUser 
    ? loans.filter(l => l.etudiantId === currentUser.id && (l.statut === 'En cours' || l.statut === 'En attente de retrait')).length
    : 0;

  const totalAvecSelection = empruntsActifsCount + selection.length;
  const isOverLimit = totalAvecSelection > 3;

  const hasAnyItems = selectedBooks.length > 0 || userLoansEnAttente.length > 0 || userReservationsEnAttente.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectionDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-in slide-in-from-right duration-250"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Mes réservations
                </h2>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className={`font-semibold ${totalAvecSelection >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {selection.length} livre{selection.length > 1 ? 's' : ''} en sélection
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">• Max 3</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectionDrawerOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fermer mes réservations"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corps de liste */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!hasAnyItems ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-500 dark:text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <Bookmark className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    Vos réservations sont vides
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Parcourez le catalogue pour ajouter des livres à votre sélection ou réserver des ouvrages épuisés.
                  </p>
                </div>
                <button
                  onClick={() => setSelectionDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Explorer le catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Sélection en cours */}
                {selectedBooks.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Ma sélection (Prêt immédiat)</span>
                      <button
                        onClick={clearSelection}
                        className="text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Vider</span>
                      </button>
                    </div>

                    {selectedBooks.map(book => (
                      <div
                        key={book.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs flex items-center gap-3.5"
                      >
                        <BookCover
                          src={book.couvertureUrl}
                          alt={book.titre}
                          title={book.titre}
                          className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-xs border border-slate-100 dark:border-slate-700"
                        />

                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {book.categorie}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-1">
                            {book.titre}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {book.auteur}
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            ✓ En rayon ({book.exemplairesDisponibles} ex.)
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromSelection(book.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Retirer de la sélection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. À retirer au comptoir (demande d'emprunt validée) */}
                {userLoansEnAttente.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      À retirer au comptoir ({userLoansEnAttente.length})
                    </div>

                    {userLoansEnAttente.map(loan => (
                      <div
                        key={loan.id}
                        className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/30 shadow-xs flex items-center gap-3.5"
                      >
                        <BookCover
                          src={loan.ouvrageCouverture}
                          alt=""
                          title={loan.ouvrageTitre}
                          className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-xs border border-slate-100 dark:border-slate-700"
                        />

                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            À retirer au comptoir
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-1">
                            {loan.ouvrageTitre}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {loan.ouvrageAuteur}
                          </p>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 font-mono">
                            Retrait sous 48h au comptoir BU
                          </p>
                        </div>

                        <button
                          onClick={() => cancelLoanRequest(loan.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold transition-colors shrink-0"
                          title="Annuler la demande"
                        >
                          Annuler
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. En attente de disponibilité (réservation d'un livre épuisé) */}
                {userReservationsEnAttente.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      En attente de disponibilité ({userReservationsEnAttente.length})
                    </div>

                    {userReservationsEnAttente.map(res => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/30 shadow-xs flex items-center gap-3.5"
                      >
                        <BookCover
                          src={res.ouvrageCouverture}
                          alt=""
                          title={res.ouvrageTitre}
                          className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-xs border border-slate-100 dark:border-slate-700"
                        />

                        <div className="min-w-0 flex-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            res.statut === 'Disponible' 
                              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
                              : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                          }`}>
                            {res.statut === 'Disponible' ? 'Disponible au comptoir' : 'En attente de disponibilité'}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-1">
                            {res.ouvrageTitre}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Réservé le {new Date(res.dateDemande).toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        <button
                          onClick={() => cancelReservation(res.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold transition-colors shrink-0"
                          title="Annuler la réservation"
                        >
                          Annuler
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Avertissement amende */}
                {userHasFines && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                    <Coins className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Emprunt bloqué</p>
                      <p className="mt-0.5">Réglez votre amende pour emprunter de nouveaux livres.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer & Bouton « Demander l'emprunt » */}
          {selectedBooks.length > 0 && (
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <button
                type="button"
                onClick={validateSelection}
                disabled={userHasFines || isOverLimit}
                className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  userHasFines || isOverLimit
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-75'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                <span>
                  {userHasFines
                    ? 'Réglez votre amende pour emprunter'
                    : isOverLimit
                    ? 'Limite de 3 livres atteinte'
                    : currentUser
                    ? `Demander l'emprunt (${selectedBooks.length} livre${selectedBooks.length > 1 ? 's' : ''})`
                    : 'Se connecter et demander l’emprunt'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Retrait sous 48 h au comptoir central avec votre carte BU.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
