/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SecurityJournalView: React.FC = () => {
  const { connexionErrors, accessPassages, securityFilter, setSecurityFilter } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Réussi' | 'Échec'>(securityFilter);
  const [visibleLimit, setVisibleLimit] = useState(10);

  useEffect(() => {
    setStatusFilter(securityFilter);
  }, [securityFilter]);

  // Combiner les passages d'accès et erreurs de connexion en un journal unifié
  const journalEntries = useMemo(() => {
    const passages = accessPassages.map(p => ({
      id: p.id,
      date: p.heureEntree,
      carteMasquee: p.carteEtudiante,
      motif: p.autorise ? 'Accès autorisé portique' : (p.motifRefus || 'Accès refusé'),
      resultat: p.autorise ? 'Réussi' : 'Échec',
      source: p.methode,
      nom: p.nomComplet,
    }));

    const errors = connexionErrors.map(e => ({
      id: e.id,
      date: e.date,
      carteMasquee: e.carteMasquee,
      motif: e.motif,
      resultat: 'Échec',
      source: 'Lecteur carte',
      nom: 'Inconnu',
    }));

    return [...passages, ...errors].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [accessPassages, connexionErrors]);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      if (statusFilter !== 'Tous' && entry.resultat !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        return (
          entry.carteMasquee.toLowerCase().includes(q) ||
          entry.motif.toLowerCase().includes(q) ||
          entry.nom.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [journalEntries, statusFilter, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Journal de sécurité</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Traçabilité des accès aux portiques, scans de cartes et tentatives de connexion.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 self-start sm:self-auto">
          {filteredEntries.length} événement{filteredEntries.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par carte, nom ou motif..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Résultat :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Tous">Tous</option>
            <option value="Réussi">Réussi</option>
            <option value="Échec">Échec</option>
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

      {/* Tableau (max 5 colonnes : Date, Carte masquée, Motif, Résultat, Source) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date & Heure</th>
                <th className="px-4 py-3">Carte masquée</th>
                <th className="px-4 py-3">Motif</th>
                <th className="px-4 py-3">Résultat</th>
                <th className="px-4 py-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.slice(0, visibleLimit).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                    {(() => {
                      const d = new Date(entry.date);
                      const day = d.toLocaleDateString('fr-FR', { day: 'numeric' });
                      const month = d.toLocaleDateString('fr-FR', { month: 'short' });
                      const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                      return `${day} ${month.replace('.', '')}., ${time}`;
                    })()}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                    {entry.carteMasquee.replace(/-[A-Za-z0-9]+$/, '-****')}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                    {entry.motif}
                  </td>
                  <td className="px-4 py-3.5">
                    {entry.resultat === 'Réussi' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Réussi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Échec
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                    {entry.source}
                  </td>
                </tr>
              ))}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                    Aucun événement de sécurité enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredEntries.length > visibleLimit && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={() => setVisibleLimit(prev => prev + 10)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Voir plus ({Math.max(0, filteredEntries.length - visibleLimit)} lignes de plus)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
