/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Ouvrage } from '../../types';
import { BookCover } from '../../components/BookCover';
import { 
  X, 
  Heart, 
  Plus, 
  Check, 
  BookmarkPlus, 
  MapPin, 
  Barcode, 
  Calendar, 
  Layers,
  Coins
} from 'lucide-react';

interface BookDetailModalProps {
  book: Ouvrage | null;
  onClose: () => void;
  onEdit?: (book: Ouvrage) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose, onEdit }) => {
  const { 
    selection, 
    addToSelection, 
    favorites, 
    toggleFavorite, 
    reserveBook, 
    currentUser,
    userHasFines,
    checkCanAdd,
    showToast
  } = useApp();

  if (!book) return null;

  const inSelection = selection.includes(book.id);
  const isFavorite = favorites.includes(book.id);
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLibrarian = currentUser?.role === 'BIBLIOTHECAIRE';

  const handleSelectionAction = () => {
    if (userHasFines) {
      showToast('Réglez votre amende pour emprunter de nouveaux livres.', 'error');
      return;
    }
    if (!inSelection && !checkCanAdd()) {
      showToast('Vous pouvez emprunter 3 livres maximum.', 'error');
      return;
    }
    addToSelection(book.id);
    onClose();
  };

  const handleReservationAction = () => {
    if (userHasFines) {
      showToast('Réglez votre amende pour emprunter de nouveaux livres.', 'error');
      return;
    }
    if (!checkCanAdd()) {
      showToast('Vous pouvez emprunter 3 livres maximum.', 'error');
      return;
    }
    reserveBook(book.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
            Fiche Ouvrage BU
          </span>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <button
                onClick={() => toggleFavorite(book.id)}
                className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors ${
                  isFavorite
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
                title="Ajouter aux favoris"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {/* Couverture avec composant BookCover */}
            <div className="sm:col-span-1 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <BookCover
                src={book.couvertureUrl}
                alt={book.titre}
                title={book.titre}
                className="w-full aspect-3/4 object-cover"
              />
            </div>

            {/* Infos clés */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {book.categorie}
                </span>

                {book.disponibilite === 'En rayon' && book.exemplairesDisponibles > 0 ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 whitespace-nowrap shrink-0">
                    En rayon ({book.exemplairesDisponibles})
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 whitespace-nowrap shrink-0">
                    Épuisé
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {book.titre}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                Auteur : <span className="font-semibold text-slate-900 dark:text-white">{book.auteur}</span>
              </p>

              {/* Grille de métadonnées simples */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-400">ISBN</p>
                    <p className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate">{book.isbn}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Publication</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{book.anneePublication}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-400">Emplacement</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{book.emplacement}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Exemplaires</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {book.exemplairesDisponibles} / {book.exemplairesTotal} en stock
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Présentation de l'ouvrage
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {book.description}
            </p>
          </div>

          {/* Avertissement amende */}
          {!isAdmin && userHasFines && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Réglez votre amende pour emprunter de nouveaux livres.</span>
            </div>
          )}

          {/* Règles de prêt */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <span>Durée d'emprunt : <strong>14 jours</strong> (limite de 3 livres maximum).</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">Retrait sous 48h</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {isLibrarian && onEdit ? (
            <button
              onClick={() => {
                onClose();
                onEdit(book);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              Modifier la fiche
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Fermer
            </button>

            {!isAdmin && (
              book.disponibilite === 'En rayon' ? (
                <button
                  type="button"
                  onClick={handleSelectionAction}
                  disabled={userHasFines}
                  className={`py-2.5 px-5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors ${
                    userHasFines
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {inSelection ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Dans ma sélection</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Ajouter à ma sélection</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReservationAction}
                  disabled={userHasFines}
                  className={`py-2.5 px-5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors ${
                    userHasFines
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Réserver cet ouvrage</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
