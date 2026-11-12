/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookCover } from '../../components/BookCover';
import { Ouvrage } from '../../types';
import { 
  BookOpen, 
  ScanLine, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Info,
  Search, 
  Sparkles,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';

export const BookScannerView: React.FC = () => {
  const { books, loans, returnLoan, markFinePaid, showToast } = useApp();
  const [scanInput, setScanInput] = useState('');
  
  // États demandés : scannedBook et statusMessage
  const [scannedBook, setScannedBook] = useState<Ouvrage | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'neutral' | 'info' | 'warning' | 'error' | 'success';
    text: string;
  } | null>({
    type: 'neutral',
    text: 'Scannez un livre ou saisissez son code',
  });

  // Recherche d'un livre et mise à jour des états
  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setScannedBook(null);
      setStatusMessage({
        type: 'neutral',
        text: 'Scannez un livre ou saisissez son code',
      });
      return;
    }

    const foundBook = books.find(
      b => b.isbn.toLowerCase() === trimmed.toLowerCase() || 
           b.id.toLowerCase() === trimmed.toLowerCase() || 
           b.titre.toLowerCase().includes(trimmed.toLowerCase())
    );

    if (!foundBook) {
      setScannedBook(null);
      // ROUGE réservé exclusivement aux vraies erreurs (Code introuvable)
      setStatusMessage({
        type: 'error',
        text: 'Livre introuvable, vérifiez le code',
      });
    } else {
      setScannedBook(foundBook);
      // Message adapté au statut du livre
      if (foundBook.disponibilite === 'En rayon') {
        if (foundBook.exemplairesDisponibles > 0) {
          setStatusMessage({
            type: 'success',
            text: 'Livre en rayon : prêt pour un nouveau prêt',
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: 'Prêt en cours : prêt à être retourné',
          });
        }
      } else {
        setStatusMessage({
          type: 'warning',
          text: 'Livre épuisé : réservation en attente',
        });
      }
    }

    setScanInput('');
  };

  // Trouver si le livre scanné a un prêt actif
  const activeLoan = scannedBook 
    ? loans.find(l => l.ouvrageId === scannedBook.id && (l.statut === 'En cours' || l.statut === 'En attente de retrait'))
    : null;

  // Réinitialisation après une action réussie
  const resetScannerState = () => {
    setScannedBook(null);
    setStatusMessage({
      type: 'neutral',
      text: 'Scannez un livre ou saisissez son code',
    });
    setScanInput('');
  };

  // Action : Enregistrer un prêt
  const handleRegisterLoan = () => {
    if (!scannedBook || scannedBook.disponibilite !== 'En rayon') return;

    showToast(`Prêt enregistré pour « ${scannedBook.titre} ».`, 'success');
    resetScannerState();
  };

  // Action : Enregistrer un retour
  const handleRegisterReturn = () => {
    if (!scannedBook || !activeLoan) return;

    if (!activeLoan.amendePayee && activeLoan.amende > 0) {
      showToast("Encaissez d'abord l'amende avant de valider le retour.", 'error');
      return;
    }

    returnLoan(activeLoan.id);
    showToast(`Retour enregistré avec succès pour « ${scannedBook.titre} ».`, 'success');
    resetScannerState();
  };

  // Icône et styles selon le type de message d'état
  const renderStatusBanner = () => {
    if (!statusMessage) return null;

    switch (statusMessage.type) {
      case 'success':
        return (
          <div className="p-4 rounded-2xl flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs font-bold">{statusMessage.text}</p>
          </div>
        );
      case 'info':
        return (
          <div className="p-4 rounded-2xl flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 animate-in fade-in">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-xs font-bold">{statusMessage.text}</p>
          </div>
        );
      case 'warning':
        return (
          <div className="p-4 rounded-2xl flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs font-bold">{statusMessage.text}</p>
          </div>
        );
      case 'error':
        return (
          <div className="p-4 rounded-2xl flex items-center gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 animate-in fade-in">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-xs font-bold">{statusMessage.text}</p>
          </div>
        );
      default:
        return (
          <div className="p-4 rounded-2xl flex items-center gap-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <ScanLine className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-xs font-medium">{statusMessage.text}</p>
          </div>
        );
    }
  };

  // Conditions d'activation des boutons
  const canLoan = scannedBook !== null && scannedBook.disponibilite === 'En rayon';
  const canReturn = scannedBook !== null && activeLoan !== null;

  // Subtextes sous boutons désactivés
  const getLoanDisabledSubtext = () => {
    if (!scannedBook) return null;
    if (scannedBook.disponibilite === 'Épuisé') return 'Ce livre est épuisé';
    return null;
  };

  const getReturnDisabledSubtext = () => {
    if (!scannedBook) return null;
    if (!activeLoan) return 'Aucun prêt actif pour ce livre';
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ScanLine className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Scanner un livre</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enregistrement rapide des retours physiques et prêts d'ouvrages au comptoir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne de gauche : Lecteur code-barres / Caméra et Saisie */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
            {/* Zone visuelle du lecteur de code-barres */}
            <div className="relative aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center border-2 border-slate-800">
              <div className="absolute inset-8 border border-blue-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-3/4 h-24 border-2 border-dashed border-blue-400/80 rounded-lg flex items-center justify-center">
                  <div className="w-full h-0.5 bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse" />
                </div>
              </div>

              <div className="z-10 text-slate-400 space-y-2">
                <ScanLine className="w-10 h-10 mx-auto text-blue-400 animate-pulse" />
                <p className="text-xs font-semibold text-slate-200">
                  Lecteur de code-barres ou ISBN actif
                </p>
                <p className="text-[11px] text-slate-500">
                  Positionnez le code-barres de l'ouvrage sous le faisceau
                </p>
              </div>
            </div>

            {/* Saisie manuelle avec bouton « Rechercher » (Point 4) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Saisie manuelle : Code ISBN, Identifiant ou Titre de l'ouvrage
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(scanInput)}
                    placeholder="Ex: 978-0132350884 ou Clean Code"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                {/* Renommé en « Rechercher » (Point 4) */}
                <button
                  type="button"
                  onClick={() => handleSearch(scanInput)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  Rechercher
                </button>
              </div>
            </div>

            {/* BOUTONS D'ACTION : « Enregistrer un retour » et « Enregistrer un prêt » (Point 2) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bouton 1 : Enregistrer un prêt */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={handleRegisterLoan}
                    disabled={!canLoan}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 ${
                      canLoan
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Enregistrer un prêt</span>
                  </button>
                  {getLoanDisabledSubtext() && (
                    <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                      {getLoanDisabledSubtext()}
                    </p>
                  )}
                </div>

                {/* Bouton 2 : Enregistrer un retour */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={handleRegisterReturn}
                    disabled={!canReturn}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 ${
                      canReturn
                        ? 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Enregistrer un retour</span>
                  </button>
                  {getReturnDisabledSubtext() && (
                    <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                      {getReturnDisabledSubtext()}
                    </p>
                  )}
                </div>
              </div>

              {/* Si amende impayée sur l'emprunt actif */}
              {activeLoan && !activeLoan.amendePayee && activeLoan.amende > 0 && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-purple-800 dark:text-purple-300 font-semibold">
                    Amende de retard : {activeLoan.amende.toFixed(2)} DH
                  </span>
                  <button
                    onClick={() => markFinePaid(activeLoan.id)}
                    className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-xs"
                  >
                    Encaisser l'amende
                  </button>
                </div>
              )}
            </div>

            {/* Simulation rapide en 1 clic */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simuler la recherche d'un livre du catalogue :</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {books.slice(0, 3).map(book => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSearch(book.isbn)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs text-left hover:border-blue-500 transition-colors"
                  >
                    <p className="font-bold truncate">{book.titre}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{book.isbn}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Panneau de détails ou État vide (Point 1 & 3) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Bannière de message de statut selon la règle 1 */}
          {renderStatusBanner()}

          {scannedBook ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5 animate-in fade-in">
              {/* Détails du livre */}
              <div className="flex gap-4">
                <div className="w-20 shrink-0">
                  <BookCover
                    src={scannedBook.couvertureUrl}
                    alt={scannedBook.titre}
                    title={scannedBook.titre}
                    className="w-20 h-28 rounded-xl shadow-xs"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    {scannedBook.categorie}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {scannedBook.titre}
                  </h3>
                  <p className="text-xs text-slate-500">{scannedBook.auteur} ({scannedBook.anneePublication})</p>
                  <p className="text-xs font-mono text-slate-400">ISBN : {scannedBook.isbn}</p>
                </div>
              </div>

              {/* Fiche détaillée et emprunteur le cas échéant */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Disponibilité catalogue :</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                    scannedBook.disponibilite === 'En rayon' && scannedBook.exemplairesDisponibles > 0
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {scannedBook.disponibilite} ({scannedBook.exemplairesDisponibles} ex.)
                  </span>
                </div>

                {activeLoan && (
                  <>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Adhérent emprunteur :</span>
                      <strong className="text-slate-800 dark:text-slate-200">{activeLoan.etudiantNomComplet}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">N° Carte BU :</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{activeLoan.etudiantCarte}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Date de retour prévue :</span>
                      <span className="font-mono">{new Date(activeLoan.dateRetourPrevue).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* État vide simple (Point 3) */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 text-center text-slate-400 space-y-2 shadow-xs">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Aucun livre scanné
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
