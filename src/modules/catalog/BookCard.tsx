/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Ouvrage } from '../../types';
import { BookCover } from '../../components/BookCover';
import { Heart, Plus, Check, BookmarkPlus, Eye } from 'lucide-react';

interface BookCardProps {
  book: Ouvrage;
  onOpenDetails: (book: Ouvrage) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onOpenDetails }) => {
  const { 
    selection, 
    addToSelection, 
    favorites, 
    toggleFavorite, 
    reserveBook, 
    userHasFines,
    checkCanAdd,
    showToast,
    currentUser
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';
  const inSelection = selection.includes(book.id);
  const isFavorite = favorites.includes(book.id);

  // Badge de disponibilité coloré
  const renderDisponibiliteBadge = () => {
    if (book.disponibilite === 'En rayon' && book.exemplairesDisponibles > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>En rayon ({book.exemplairesDisponibles})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        <span>Épuisé</span>
      </span>
    );
  };

  const handleSelectionAction = () => {
    if (userHasFines) {
      showToast('Vous avez une amende impayée. Réglez-la pour réserver un livre.', 'error');
      return;
    }
    if (!inSelection && !checkCanAdd()) {
      showToast('Vous pouvez emprunter 3 livres maximum.', 'error');
      return;
    }
    addToSelection(book.id);
  };

  const handleReservationAction = () => {
    if (userHasFines) {
      showToast('Vous avez une amende impayée. Réglez-la pour réserver un livre.', 'error');
      return;
    }
    if (!checkCanAdd()) {
      showToast('Vous pouvez emprunter 3 livres maximum.', 'error');
      return;
    }
    reserveBook(book.id);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Haut de la carte avec composant BookCover */}
      <div 
        className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" 
        onClick={() => onOpenDetails(book)}
      >
        <BookCover
          src={book.couvertureUrl}
          alt={book.titre}
          title={book.titre}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />

        {/* Badges catégorie & nouveau (sans chevauchement avec le cœur) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pr-12 pointer-events-none">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-800 dark:text-slate-100 shadow-xs">
            {book.categorie}
          </span>
          {book.estNouveaute && (
            <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-blue-600 text-white shadow-xs">
              Nouveau
            </span>
          )}
        </div>

        {/* Bouton Favori (Masqué pour l'ADMIN) */}
        {!isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(book.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors shadow-xs z-10 ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/90 dark:text-rose-400'
                : 'bg-white/85 dark:bg-slate-900/85 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Corps descriptif allégé */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            {renderDisponibiliteBadge()}
          </div>

          <h3 
            onClick={() => onOpenDetails(book)}
            className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {book.titre}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            de <span className="font-medium text-slate-700 dark:text-slate-300">{book.auteur}</span>
          </p>
        </div>

        {/* Boutons d'actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          {!isAdmin ? (
            <button
              type="button"
              onClick={book.disponibilite === 'En rayon' ? handleSelectionAction : handleReservationAction}
              disabled={userHasFines}
              title={userHasFines ? "Vous avez une amende impayée. Réglez-la pour réserver un livre." : ""}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap ${
                userHasFines
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-70'
                  : book.disponibilite === 'En rayon'
                  ? (inSelection ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {book.disponibilite === 'En rayon' ? (
                inSelection ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Réserver</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Réserver</span>
                  </>
                )
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Réserver</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenDetails(book)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors truncate"
            >
              Consulter la fiche
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenDetails(book)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Consulter la fiche détaillée"
            aria-label="Détails"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
