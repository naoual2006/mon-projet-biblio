/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Ouvrage, BookCategory } from '../../types';
import { BookCard } from './BookCard';
import { BookDetailModal } from './BookDetailModal';
import { BookFormModal } from './BookFormModal';
import { 
  Search, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  Plus, 
  BookOpen, 
  Layers,
  Heart,
  Coins
} from 'lucide-react';

const CATEGORIES: BookCategory[] = [
  'Informatique',
  'Littérature',
  'Droit',
  'Sciences',
  'Économie',
  'Histoire',
  'Philosophie',
];

interface CatalogViewProps {
  favoritesOnly?: boolean;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ favoritesOnly = false }) => {
  const { 
    books, 
    currentUser, 
    favorites, 
    userHasFines, 
    userTotalUnpaidFines, 
    payAllUserFines 
  } = useApp();

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDisponibilite, setSelectedDisponibilite] = useState<string>('all');

  // Modals
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Ouvrage | null>(null);
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Ouvrage | null>(null);

  const isLibrarian = currentUser?.role === 'BIBLIOTHECAIRE';
  const isAdmin = currentUser?.role === 'ADMIN';

  // Liste des années disponibles extraites des livres
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(books.map(b => b.anneePublication))).sort((a, b) => b - a);
    return years;
  }, [books]);

  // Filtrage principal
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      // Filtre favoris
      if (favoritesOnly && !favorites.includes(b.id)) {
        return false;
      }

      // Recherche texte (titre, auteur, ISBN)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = b.titre.toLowerCase().includes(q);
        const matchAuthor = b.auteur.toLowerCase().includes(q);
        const matchIsbn = b.isbn.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchIsbn) return false;
      }

      // Filtre catégorie
      if (selectedCategory !== 'all' && b.categorie !== selectedCategory) {
        return false;
      }

      // Filtre année
      if (selectedYear !== 'all' && b.anneePublication !== Number(selectedYear)) {
        return false;
      }

      // Filtre disponibilité
      if (selectedDisponibilite !== 'all' && b.disponibilite !== selectedDisponibilite) {
        return false;
      }

      return true;
    });
  }, [books, searchQuery, selectedCategory, selectedYear, selectedDisponibilite, favoritesOnly, favorites]);

  // Nouveautés (max 6)
  const nouveautes = useMemo(() => {
    return books.filter(b => b.estNouveaute || b.anneePublication >= 2023).slice(0, 6);
  }, [books]);

  // Les plus empruntés (max 6)
  const plusEmpruntes = useMemo(() => {
    return [...books].sort((a, b) => b.empruntsTotal - a.empruntsTotal).slice(0, 6);
  }, [books]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedYear !== 'all' || selectedDisponibilite !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedYear('all');
    setSelectedDisponibilite('all');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* En-tête du catalogue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {favoritesOnly ? (
              <>
                <Heart className="w-6 h-6 text-rose-500 fill-current" />
                <span>Mes Ouvrages Favoris</span>
              </>
            ) : (
              <>
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Ouvrages</span>
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {favoritesOnly
              ? `${filteredBooks.length} ouvrage${filteredBooks.length > 1 ? 's' : ''} enregistré${filteredBooks.length > 1 ? 's' : ''} dans vos favoris.`
              : `Consultez le fonds documentaire universitaire (${books.length} titres référencés).`}
          </p>
        </div>

        {isLibrarian && !favoritesOnly && (
          <button
            onClick={() => {
              setBookToEdit(null);
              setBookFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un ouvrage</span>
          </button>
        )}
      </div>

      {/* Bandeau amende impayée (Point 2) */}
      {!isAdmin && userHasFines && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-medium">
            <Coins className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Vous avez une amende impayée de <strong>{userTotalUnpaidFines.toFixed(2)} DH</strong>. Réglez-la pour réserver un livre.
            </span>
          </div>
          <button
            type="button"
            onClick={() => payAllUserFines()}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
          >
            Payer maintenant
          </button>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, auteur ou numéro ISBN..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Ligne de filtres avec liste Disponibilité */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtre Catégorie */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Catégorie :</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Toutes les catégories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filtre Année */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Année :</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Toutes</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Filtre Disponibilité */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Disponibilité :</span>
              <select
                value={selectedDisponibilite}
                onChange={(e) => setSelectedDisponibilite(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tous</option>
                <option value="En rayon">En rayon</option>
                <option value="Épuisé">Épuisé</option>
              </select>
            </div>
          </div>

          {/* Bouton Réinitialiser */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold text-xs py-1.5 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les filtres</span>
            </button>
          )}
        </div>
      </div>

      {/* Sections Nouveautés et Les plus empruntés */}
      {!hasActiveFilters && !favoritesOnly && (
        <div className="space-y-8">
          {/* Section Nouveautés (max 6) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Nouveautés universitaires
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dernières acquisitions et éditions récentes mises en rayon
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {nouveautes.length} titres
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {nouveautes.map(book => (
                <BookCard
                  key={`nouveau-${book.id}`}
                  book={book}
                  onOpenDetails={setSelectedBookForDetail}
                />
              ))}
            </div>
          </div>

          {/* Section Les plus empruntés (max 6) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Les plus empruntés
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ouvrages les plus plébiscités par les étudiants ce semestre
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                Top 6
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {plusEmpruntes.map(book => (
                <BookCard
                  key={`top-${book.id}`}
                  book={book}
                  onOpenDetails={setSelectedBookForDetail}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Titre de section du catalogue complet */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {hasActiveFilters ? 'Résultats de la recherche' : 'Tous les ouvrages en bibliothèque'}
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {filteredBooks.length} ouvrage{filteredBooks.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Grille des résultats */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Aucun résultat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Aucun ouvrage ne correspond à vos critères de recherche. Essayez de modifier les filtres ou de réinitialiser.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onOpenDetails={setSelectedBookForDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <BookDetailModal
        book={selectedBookForDetail}
        onClose={() => setSelectedBookForDetail(null)}
        onEdit={(book) => {
          setBookToEdit(book);
          setBookFormOpen(true);
        }}
      />

      <BookFormModal
        isOpen={bookFormOpen}
        onClose={() => {
          setBookFormOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
      />
    </div>
  );
};
