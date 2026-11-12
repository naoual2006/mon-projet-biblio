/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  AlertTriangle, 
  Bookmark, 
  Coins, 
  Check, 
  CheckCircle2, 
  Clock, 
  Users, 
  ShieldCheck,
  Send,
  AlertCircle,
  BarChart2,
  CalendarCheck
} from 'lucide-react';

export const LibrarianDashboard: React.FC = () => {
  const { 
    currentUser,
    users,
    loans, 
    reservations, 
    accessPassages,
    connexionErrors,
    confirmPickup, 
    returnLoan, 
    markFinePaid, 
    cancelReservation,
    notifications,
    setActiveView,
    setSecurityFilter
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  // --- DONNÉES DU TABLEAU DE BORD ADMIN (Règle 4) ---
  const totalUsers = users.length;
  const nbEtudiants = useMemo(() => users.filter(u => u.role === 'ETUDIANT').length, [users]);
  const nbBiblios = useMemo(() => users.filter(u => u.role === 'BIBLIOTHECAIRE').length, [users]);
  const nbAdmins = useMemo(() => users.filter(u => u.role === 'ADMIN').length, [users]);

  const presentsEnCeMoment = useMemo(() => {
    return accessPassages.filter(p => p.autorise && p.heureSortie === null).length;
  }, [accessPassages]);

  const notifsEnEchec = useMemo(() => {
    return notifications.filter(n => n.statutEnvoi === 'Échec');
  }, [notifications]);

  const cinqDernieresErreurs = useMemo(() => {
    return connexionErrors.slice(0, 5);
  }, [connexionErrors]);

  // --- DONNÉES DU TABLEAU DE BORD BIBLIOTHÉCAIRE ---
  const [activeTab, setActiveTab] = useState<'tous' | 'retraits' | 'retours' | 'retards' | 'reservations'>('tous');
  const [confirmCancelResId, setConfirmCancelResId] = useState<string | null>(null);

  const empruntsEnCours = useMemo(() => {
    return loans.filter(l => l.statut === 'En cours');
  }, [loans]);

  const retoursAValider = useMemo(() => {
    return loans.filter(l => l.statut === 'Retour à valider');
  }, [loans]);

  const empruntsEnRetard = useMemo(() => {
    const now = new Date();
    return loans.filter(l => l.statut === 'En cours' && new Date(l.dateRetourPrevue) < now);
  }, [loans]);

  const reservationsEnAttente = useMemo(() => {
    return reservations.filter(r => r.statut === 'En attente' || r.statut === 'Disponible');
  }, [reservations]);

  const amendesNonPayees = useMemo(() => {
    return loans.filter(l => !l.amendePayee && l.amende > 0);
  }, [loans]);

  const totalMontantAmendesNonPayees = useMemo(() => {
    return amendesNonPayees.reduce((acc, l) => acc + l.amende, 0);
  }, [amendesNonPayees]);

  const retraitsEnAttente = useMemo(() => {
    return loans.filter(l => l.statut === 'En attente de retrait');
  }, [loans]);

  const monthlyData = [
    { mois: 'Juin', total: 42 },
    { mois: 'Juil', total: 28 },
    { mois: 'Août', total: 19 },
    { mois: 'Sept', total: 85 },
    { mois: 'Oct', total: 110 },
    { mois: 'Nov', total: 64 },
  ];
  const maxMonthly = Math.max(...monthlyData.map(m => m.total));

  const topCategories = [
    { nom: 'Informatique', emprunts: 165 },
    { nom: 'Littérature', emprunts: 107 },
    { nom: 'Sciences', emprunts: 94 },
    { nom: 'Histoire', emprunts: 88 },
    { nom: 'Économie', emprunts: 77 },
  ];

  // =========================================================================
  // VUE ADMINISTRATEUR (Règle 1, 2, 4)
  // =========================================================================
  if (isAdmin) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* En-tête Administrateur (Règle 1) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Tableau de bord Administrateur</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Supervision générale du système, des accès portique, des adhérents et des alertes.
            </p>
          </div>

          <button
            onClick={() => setActiveView('adherents')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Users className="w-4 h-4" />
            <span>Gérer les adhérents</span>
          </button>
        </div>

        {/* 4 CARTES DE CHIFFRES SIMPLES CLIQUABLES (Règle 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Carte 1 : Nombre total d'utilisateurs */}
          <div
            onClick={() => setActiveView('adherents')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Total utilisateurs
              </p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {totalUsers}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {nbEtudiants} Étudiants • {nbBiblios} Bibliothécaires • {nbAdmins} Admins
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Carte 2 : Personnes présentes en ce moment */}
          <div
            onClick={() => setActiveView('acces')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-emerald-400 dark:hover:border-emerald-500 cursor-pointer transition-all group"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Présents en salle
              </p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {presentsEnCeMoment}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                En salle de lecture • Capacité 150
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Carte 3 : Erreurs de connexion récentes */}
          <div
            onClick={() => { setActiveView('journal_securite'); setSecurityFilter('Échec'); }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-rose-400 dark:hover:border-rose-500 cursor-pointer transition-all group"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Erreurs de connexion
              </p>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {connexionErrors.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Cartes invalides ou expirées
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Carte 4 : Nombre d'envois de notifications en échec */}
          <div
            onClick={() => setActiveView('notifications')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer transition-all group"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Envois en échec
              </p>
              <p className={`text-3xl font-black mt-1 ${notifsEnEchec.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {notifsEnEchec.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {notifsEnEchec.length === 0 ? 'Aucune anomalie d’envoi' : 'Avis automatiques à renvoyer'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Send className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Section détaillée : 5 dernières erreurs de connexion (Règle 4) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5 dernières erreurs de connexion récentes
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Journal de sécurité
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            {cinqDernieresErreurs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Aucune erreur de connexion récente</p>
                <p className="text-slate-400 mt-0.5">Toutes les tentatives de scan et de connexion sont valides.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Date & Heure</th>
                      <th className="px-4 py-3">Numéro de carte masqué</th>
                      <th className="px-4 py-3">Motif de refus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cinqDernieresErreurs.map((err) => (
                      <tr key={err.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                          {new Date(err.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {err.carteMasquee}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            {err.motif}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VUE BIBLIOTHÉCAIRE (Règle 1, inchangée avec section « À traiter »)
  // =========================================================================
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* En-tête Bibliothécaire */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Tableau de bord du Bibliothécaire</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervision des prêts, validation des retraits et gestion du comptoir de prêt.
          </p>
        </div>

        <button
          onClick={() => setActiveView('catalogue')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Gérer le catalogue</span>
        </button>
      </div>

      {/* 4 GRANDES CARTES DE CHIFFRES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              +{retraitsEnAttente.length} en attente de retrait
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Carte 2 : Emprunts en retard */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Emprunts en retard
            </p>
            <p className={`text-3xl font-black mt-1 ${empruntsEnRetard.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {empruntsEnRetard.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Relances à effectuer
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Carte 3 : Réservations en attente */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Réservations
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {reservationsEnAttente.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Sur livres épuisés
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>

        {/* Carte 4 : Amendes non payées */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Amendes non payées
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {totalMontantAmendesNonPayees.toFixed(2)} DH
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {amendesNonPayees.length} dossier(s) en attente
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION : « À TRAITER AUJOURD'HUI » (Réservée au Bibliothécaire) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              À traiter aujourd'hui au comptoir
            </h2>
          </div>

          {/* Onglets de filtrage */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('tous')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'tous'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveTab('retraits')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'retraits'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Retraits ({retraitsEnAttente.length})
            </button>
            <button
              onClick={() => setActiveTab('retours')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'retours'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Retours à valider ({retoursAValider.length})
            </button>
            <button
              onClick={() => setActiveTab('retards')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'retards'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Retards ({empruntsEnRetard.length})
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'reservations'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Réservations ({reservationsEnAttente.length})
            </button>
          </div>
        </div>

        {/* Liste À traiter */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Retours à valider */}
            {(activeTab === 'tous' || activeTab === 'retours') && retoursAValider.map(loan => (
              <div key={loan.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                        Retour soumis par l'étudiant
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Carte: {loan.etudiantCarte}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {loan.ouvrageTitre}
                    </p>
                    <p className="text-xs text-slate-500">
                      Restitué par : <strong className="text-slate-700 dark:text-slate-300">{loan.etudiantNomComplet}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => returnLoan(loan.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Valider le retour</span>
                  </button>
                </div>
              </div>
            ))}
            {/* 1. Retraits à valider (sélection étudiante) */}
            {(activeTab === 'tous' || activeTab === 'retraits') && retraitsEnAttente.map(loan => (
              <div key={loan.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                        Retrait à valider (48h)
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Carte: {loan.etudiantCarte}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {loan.ouvrageTitre}
                    </p>
                    <p className="text-xs text-slate-500">
                      Demandé par : <strong className="text-slate-700 dark:text-slate-300">{loan.etudiantNomComplet}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => confirmPickup(loan.id)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirmer le retrait</span>
                  </button>
                </div>
              </div>
            ))}

            {/* 2. Emprunts en retard */}
            {(activeTab === 'tous' || activeTab === 'retards') && empruntsEnRetard.map(loan => {
              const fineUnpaid = !loan.amendePayee && loan.amende > 0;
              return (
                <div key={loan.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                          Retard actif • Amende : {loan.amende.toFixed(2)} DH
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {loan.etudiantCarte}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {loan.ouvrageTitre}
                      </p>
                      <p className="text-xs text-slate-500">
                        Lecteur : <strong className="text-slate-700 dark:text-slate-300">{loan.etudiantNomComplet}</strong> • Échéance : {new Date(loan.dateRetourPrevue).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 self-end sm:self-auto">
                    {fineUnpaid && (
                      <button
                        onClick={() => markFinePaid(loan.id)}
                        className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold transition-colors"
                      >
                        Encaisser amende ({loan.amende.toFixed(2)} DH)
                      </button>
                    )}
                    <div className="flex flex-col items-end">
                      <button
                        onClick={() => returnLoan(loan.id)}
                        disabled={fineUnpaid}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                          fineUnpaid
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900'
                        }`}
                      >
                        Valider le retour
                      </button>
                      {fineUnpaid && (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                          Encaissez d'abord l'amende
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 3. Réservations à gérer */}
            {(activeTab === 'tous' || activeTab === 'reservations') && reservationsEnAttente.map(res => (
              <div key={res.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <Bookmark className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        res.statut === 'Disponible' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200' 
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                      }`}>
                        {res.statut === 'Disponible' ? 'Ouvrage prêt au comptoir' : 'En attente de retour physique'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {res.ouvrageTitre}
                    </p>
                    <p className="text-xs text-slate-500">
                      Demandé par : <strong className="text-slate-700 dark:text-slate-300">{res.etudiantNomComplet}</strong> ({res.etudiantEmail})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-slate-400 font-mono hidden md:inline mr-1">
                    Réservé le {new Date(res.dateDemande).toLocaleDateString('fr-FR')}
                  </span>
                  {confirmCancelResId === res.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          cancelReservation(res.id);
                          setConfirmCancelResId(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        Confirmer l'annulation
                      </button>
                      <button
                        onClick={() => setConfirmCancelResId(null)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancelResId(res.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                    >
                      Annuler la réservation
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* État vide si aucune tâche */}
            {((activeTab === 'tous' && retraitsEnAttente.length === 0 && retoursAValider.length === 0 && empruntsEnRetard.length === 0 && reservationsEnAttente.length === 0) ||
              (activeTab === 'retraits' && retraitsEnAttente.length === 0) ||
              (activeTab === 'retours' && retoursAValider.length === 0) ||
              (activeTab === 'retards' && empruntsEnRetard.length === 0) ||
              (activeTab === 'reservations' && reservationsEnAttente.length === 0)) && (
              <div className="p-10 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Rien à traiter aujourd'hui</p>
                <p className="text-slate-400 mt-0.5">Aucun retrait en attente, retard urgent ou réservation active.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION : STATISTIQUES SIMPLES (Uniquement pour le Bibliothécaire) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Stat 1 : Emprunts par mois (barres simples avec nombre au-dessus) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Emprunts par mois (Semestre en cours)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Total semestre : 348</span>
          </div>

          <p className="text-xs text-slate-500">
            Nombre simple d'ouvrages empruntés par les étudiants chaque mois.
          </p>

          {/* Barres simples et lisibles */}
          <div className="flex items-end justify-between gap-3 pt-6 h-48 px-2 border-b border-slate-200 dark:border-slate-800">
            {monthlyData.map(item => {
              const heightPercent = Math.round((item.total / maxMonthly) * 100);
              return (
                <div key={item.mois} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-xs font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                    {item.total}
                  </span>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 rounded-t-lg transition-all"
                  />

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
                    {item.mois}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stat 2 : Top 5 des catégories les plus empruntées */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Top 5 des catégories les plus empruntées
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Volume annuel</span>
          </div>

          <p className="text-xs text-slate-500">
            Classement selon le nombre total de sorties enregistrées en BU.
          </p>

          <div className="space-y-3 pt-2">
            {topCategories.map((cat, idx) => (
              <div
                key={cat.nom}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {cat.nom}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {cat.emprunts}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1">emprunts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
