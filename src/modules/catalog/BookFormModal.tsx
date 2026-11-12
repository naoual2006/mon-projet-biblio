/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Ouvrage, BookCategory, BookDisponibilite } from '../../types';
import { X, Trash2, Save, AlertTriangle } from 'lucide-react';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Ouvrage | null;
}

const CATEGORIES: BookCategory[] = [
  'Informatique',
  'Littérature',
  'Droit',
  'Sciences',
  'Économie',
  'Histoire',
  'Philosophie',
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
}) => {
  const { books, addBook, updateBook, deleteBook, showToast, currentUser } = useApp();

  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [isbn, setIsbn] = useState('');
  const [categorie, setCategorie] = useState<BookCategory>('Informatique');
  const [anneePublication, setAnneePublication] = useState<number>(2024);
  const [exemplairesTotal, setExemplairesTotal] = useState<number>(3);
  const [emplacement, setEmplacement] = useState('');
  const [description, setDescription] = useState('');
  const [couvertureUrl, setCouvertureUrl] = useState('');
  
  const [isbnError, setIsbnError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (bookToEdit) {
      setTitre(bookToEdit.titre);
      setAuteur(bookToEdit.auteur);
      setIsbn(bookToEdit.isbn);
      setCategorie(bookToEdit.categorie);
      setAnneePublication(bookToEdit.anneePublication);
      setExemplairesTotal(bookToEdit.exemplairesTotal);
      setEmplacement(bookToEdit.emplacement);
      setDescription(bookToEdit.description);
      setCouvertureUrl(bookToEdit.couvertureUrl);
    } else {
      setTitre('');
      setAuteur('');
      setIsbn(`978-2${Math.floor(100000000 + Math.random() * 900000000)}`);
      setCategorie('Informatique');
      setAnneePublication(2024);
      setExemplairesTotal(3);
      setEmplacement('Rayon Informatique - B15');
      setDescription('');
      setCouvertureUrl('');
    }
    setIsbnError(null);
    setShowDeleteConfirm(false);
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !auteur.trim()) return;

    if (currentUser?.role !== 'BIBLIOTHECAIRE') {
      showToast("Action réservée au bibliothécaire.", 'error');
      return;
    }

    // Vérification ISBN unique
    const trimmedIsbn = isbn.trim();
    const isbnExists = books.some(
      b => b.isbn.trim().toLowerCase() === trimmedIsbn.toLowerCase() && (!bookToEdit || b.id !== bookToEdit.id)
    );

    if (isbnExists) {
      setIsbnError('ISBN déjà existant dans le catalogue.');
      showToast('ISBN déjà existant', 'error');
      return;
    }

    const finalCover = couvertureUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80';

    if (bookToEdit) {
      const copiesDispo = Math.min(bookToEdit.exemplairesDisponibles, exemplairesTotal);
      const dispo: BookDisponibilite = copiesDispo > 0 ? 'En rayon' : 'Épuisé';

      updateBook({
        ...bookToEdit,
        titre,
        auteur,
        isbn: trimmedIsbn,
        categorie,
        anneePublication,
        exemplairesTotal,
        exemplairesDisponibles: copiesDispo,
        disponibilite: dispo,
        emplacement: emplacement || 'Rayon Général - A01',
        description: description || 'Ouvrage documentaire pour études supérieures.',
        couvertureUrl: finalCover,
      });
      showToast(`Ouvrage « ${titre} » mis à jour avec succès.`, 'success');
    } else {
      addBook({
        titre,
        auteur,
        isbn: trimmedIsbn,
        categorie,
        anneePublication,
        exemplairesTotal,
        exemplairesDisponibles: exemplairesTotal,
        disponibilite: 'En rayon',
        emplacement: emplacement || 'Rayon Général - A01',
        description: description || 'Ouvrage documentaire pour études supérieures.',
        couvertureUrl: finalCover,
        estNouveaute: true,
      });
      showToast(`Ouvrage « ${titre} » ajouté aux nouveautés et au catalogue.`, 'success');
    }

    onClose();
  };

  const handleDelete = () => {
    if (bookToEdit) {
      deleteBook(bookToEdit.id);
      showToast('Ouvrage supprimé du catalogue.', 'info');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {bookToEdit ? 'Modifier un ouvrage' : 'Ajouter un ouvrage au catalogue'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Delete Confirmation Dialog */}
        {showDeleteConfirm ? (
          <div className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirmer la suppression
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Êtes-vous sûr de vouloir supprimer définitivement « {bookToEdit?.titre} » de la base du catalogue ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                Oui, supprimer le livre
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Titre de l'ouvrage *
              </label>
              <input
                type="text"
                required
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex. Algorithmes et Structures de données"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Titre officiel de l'ouvrage universitaire.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Auteur(s) *
                </label>
                <input
                  type="text"
                  required
                  value={auteur}
                  onChange={(e) => setAuteur(e.target.value)}
                  placeholder="Ex. Donald Knuth"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value as BookCategory)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  required
                  value={isbn}
                  onChange={(e) => {
                    setIsbn(e.target.value);
                    if (isbnError) setIsbnError(null);
                  }}
                  placeholder="978-2..."
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 outline-none ${
                    isbnError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {isbnError ? (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">{isbnError}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Numéro ISBN unique.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Année
                </label>
                <input
                  type="number"
                  value={anneePublication}
                  onChange={(e) => setAnneePublication(Number(e.target.value))}
                  min={1900}
                  max={2030}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exemplaires totaux
                </label>
                <input
                  type="number"
                  value={exemplairesTotal}
                  onChange={(e) => setExemplairesTotal(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={50}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emplacement / Rayon physique
              </label>
              <input
                type="text"
                value={emplacement}
                onChange={(e) => setEmplacement(e.target.value)}
                placeholder="Ex. Rayon Informatique - B12"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Résumé
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentation synthétique du livre..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL de l'image de couverture (facultatif)
              </label>
              <input
                type="url"
                value={couvertureUrl}
                onChange={(e) => setCouvertureUrl(e.target.value)}
                placeholder="https://... (laisser vide pour image par défaut)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Actions Form */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {bookToEdit ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{bookToEdit ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
