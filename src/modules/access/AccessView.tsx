/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AccesPassage } from '../../types';
import { 
  Users, 
  History, 
  Download, 
  FileText, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Sparkles, 
  Wrench,
  AlertTriangle,
  X
} from 'lucide-react';

export const AccessView: React.FC = () => {
  const { accessPassages, verifyAndRecordAccess, recordExit, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'presents' | 'historique' | 'scanner'>('presents');
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'refused';
    user?: any;
    motif?: string;
    timestamp?: string;
  }>({ status: 'idle' });

  const [historyLimit, setHistoryLimit] = useState(10);
  const [selectedPassageForDetail, setSelectedPassageForDetail] = useState<AccesPassage | null>(null);

  // Règle 5 : Interrupteur « Mode maintenance » (désactivé par défaut)
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [manualExitModalPassage, setManualExitModalPassage] = useState<AccesPassage | null>(null);
  const [manualExitMotif, setManualExitMotif] = useState<string>('');

  // Présents actuels en salle (autorisés et sans heure de sortie)
  const presentsActuels = useMemo(() => {
    return accessPassages.filter(p => p.autorise && p.heureSortie === null);
  }, [accessPassages]);

  // Usagers portique (tous les passages autorisés du jour)
  const usagersPortique = useMemo(() => {
    return accessPassages.filter(p => p.autorise);
  }, [accessPassages]);

  // Historique complet des passages
  const passageHistory = useMemo(() => {
    return accessPassages;
  }, [accessPassages]);

  // Exécution d'un scan (simulation ou frappe de carte/QR)
  const handleExecuteScan = (identifier: string, methode: 'Carte' | 'QR Code' = 'QR Code') => {
    if (!identifier.trim()) return;

    const result = verifyAndRecordAccess(identifier, methode);
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (result.autorise) {
      setScanResult({
        status: 'success',
        user: result.user,
        timestamp: nowTime,
      });
      showToast(`Accès autorisé : ${result.user?.prenom} ${result.user?.nom}`, 'success');
    } else {
      setScanResult({
        status: 'refused',
        user: result.user,
        motif: result.motifRefus || 'Identifiant non valide',
        timestamp: nowTime,
      });
      showToast(`Accès refusé : ${result.motifRefus || 'Carte inconnue'}`, 'error');
    }

    setScanInput('');
  };

  // Validation d'une sortie manuelle en mode maintenance (Règle 5)
  const handleConfirmManualExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualExitModalPassage) return;
    if (!manualExitMotif.trim()) {
      showToast('Le motif de sortie est obligatoire en mode maintenance.', 'error');
      return;
    }

    recordExit(manualExitModalPassage.id, manualExitMotif.trim());
    setManualExitModalPassage(null);
    setManualExitMotif('');
  };

  // Export CSV fonctionnel
  const handleExportCSV = () => {
    const headers = ['Nom Complet', 'Carte BU', 'Rôle', 'Heure Entrée', 'Heure Sortie', 'Méthode', 'Statut', 'Motif Refus / Note'];
    const rows = accessPassages.map(p => [
      `"${p.nomComplet}"`,
      `"${p.carteEtudiante}"`,
      `"${p.role}"`,
      `"${p.heureEntree}"`,
      `"${p.heureSortie || 'Présent dans la BU'}"`,
      `"${p.methode}"`,
      `"${p.autorise ? 'AUTORISÉ' : 'REFUSÉ'}"`,
      `"${p.noteMaintenance || p.motifRefus || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `acces_bu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV téléchargé avec succès.');
  };

  // Export PDF / Impression universelle
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Veuillez autoriser les fenêtres pop-up pour générer le PDF.', 'error');
      return;
    }

    const presentsRows = presentsActuels.map(p => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.nomComplet}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${p.carteEtudiante}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.role}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.heureEntree}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.methode}</td>
      </tr>
    `).join('');

    const historyRows = passageHistory.map(p => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.nomComplet}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.heureEntree}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.heureSortie || 'En cours'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.methode}</td>
        <td style="padding: 8px; border: 1px solid #ddd; color: ${p.autorise ? '#16a34a' : '#dc2626'}; font-weight: bold;">
          ${p.autorise ? 'AUTORISÉ' : 'REFUSÉ'} ${p.noteMaintenance ? `(${p.noteMaintenance})` : ''}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport d'accès BU - ${new Date().toLocaleDateString('fr-FR')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
            p { font-size: 12px; color: #64748b; margin-top: 0; }
            h2 { font-size: 15px; margin-top: 25px; margin-bottom: 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
            th { background: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
            <div>
              <h1>Bibliothèque Universitaire • Registre d'Accès</h1>
              <p>Édité le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div style="text-align: right; font-size: 12px; font-weight: bold; color: #2563eb;">
              ${presentsActuels.length} personne(s) actuellement en salle
            </div>
          </div>

          <h2>1. Liste des personnes actuellement en salle (${presentsActuels.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Nom & Prénom</th>
                <th>N° Carte</th>
                <th>Rôle</th>
                <th>Heure d'entrée</th>
                <th>Méthode</th>
              </tr>
            </thead>
            <tbody>
              ${presentsRows || '<tr><td colspan="5" style="text-align: center; padding: 12px;">Aucune personne présente actuellement.</td></tr>'}
            </tbody>
          </table>

          <h2>2. Historique des passages du jour (${passageHistory.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Usager</th>
                <th>Entrée</th>
                <th>Sortie</th>
                <th>Méthode</th>
                <th>Résultat</th>
              </tr>
            </thead>
            <tbody>
              ${historyRows}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Fenêtre d’impression PDF générée.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Contrôle d'accès</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervision de la jauge en temps réel, tourniquets QR Code et gestion des flux.
          </p>
        </div>

        {/* Boutons Exporter CSV et PDF */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Exporter en PDF</span>
          </button>
        </div>
      </div>

      {/* 2 Chiffres simples en haut */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Présents actuellement en salle
            </p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {presentsActuels.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Capacité autorisée : 150 places
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total des passages aujourd'hui
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {passageHistory.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Entrées validées et refusées
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* RÈGLE 5 : INTERRUPTEUR « MODE MAINTENANCE » */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            maintenanceMode 
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Mode maintenance portique
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                maintenanceMode 
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {maintenanceMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Autorise l'enregistrement de sorties manuelles avec motif obligatoire lors de dysfonctionnements de tourniquet.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-600"></div>
        </label>
      </div>

      {/* Onglets de navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('presents')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'presents'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personnes enregistrées ({presentsActuels.length} en salle)</span>
        </button>

        <button
          onClick={() => setActiveTab('historique')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'historique'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historique des passages</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'scanner'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Scanner QR Portique</span>
        </button>
      </div>

      {/* CONTENU ONGLET 1 : USAGERS PORTIQUE & STATUT SORTIE (Règle 5) */}
      {activeTab === 'presents' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                {/* 5 colonnes max : Usager, N° Carte, Rôle, Heure Entrée, Statut */}
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Usager</th>
                    <th className="px-4 py-3">N° Carte</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Heure Entrée</th>
                    <th className="px-4 py-3 text-right">Statut & Portique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usagersPortique.map(p => {
                    const isEnSalle = p.heureSortie === null;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          {p.nomComplet}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {p.carteEtudiante}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {p.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-200">
                          {p.heureEntree}
                        </td>

                        {/* Règle 5 : Remplacement du bouton manuel par un badge de statut : « En salle » ou « Sorti automatiquement » */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isEnSalle ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                En salle
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Sorti automatiquement ({p.heureSortie})
                              </span>
                            )}

                            {/* Règle 5 : Si le Mode maintenance est activé et la personne est en salle, bouton de sortie manuelle */}
                            {maintenanceMode && isEnSalle && (
                              <button
                                onClick={() => {
                                  setManualExitModalPassage(p);
                                  setManualExitMotif('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold shadow-2xs transition-colors"
                              >
                                <span>Enregistrer une sortie manuelle</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {usagersPortique.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                        Aucun passage enregistré aujourd'hui.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : HISTORIQUE DES PASSAGES (Tableau max 5 colonnes) */}
      {activeTab === 'historique' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Usager</th>
                    <th className="px-4 py-3">Heure Entrée</th>
                    <th className="px-4 py-3">Heure Sortie</th>
                    <th className="px-4 py-3">Méthode</th>
                    <th className="px-4 py-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {passageHistory.slice(0, historyLimit).map(p => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPassageForDetail(p)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {p.nomComplet}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">{p.carteEtudiante}</p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-200">
                        {p.heureEntree}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {p.heureSortie || (p.autorise ? 'En salle' : '-')}
                        {p.noteMaintenance && (
                          <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-sans font-medium">
                            Sortie manuelle
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                          {p.methode === 'QR Code' ? <QrCode className="w-3.5 h-3.5 text-blue-500" /> : <CreditCard className="w-3.5 h-3.5 text-purple-500" />}
                          <span>{p.methode}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {p.autorise ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Accès autorisé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            <XCircle className="w-3 h-3" />
                            Accès refusé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {passageHistory.length > 10 && historyLimit < passageHistory.length && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  onClick={() => setHistoryLimit(prev => prev + 10)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Voir plus de passages...
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 3 : SCANNER QR PORTIQUE */}
      {activeTab === 'scanner' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Portique Tourniquet - Lecteur de Badge & QR Code
              </h2>
              <p className="text-xs text-slate-500">
                Pointez la caméra vers le pass de l'étudiant ou saisissez le code manuellement.
              </p>
            </div>

            {/* Zone visuelle de scan */}
            <div className="relative aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center border-2 border-slate-800">
              <div className="absolute inset-8 border border-blue-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-blue-400/80 rounded-xl animate-pulse" />
              </div>

              {scanResult.status === 'success' && (
                <div className="z-10 p-6 rounded-2xl bg-emerald-600 text-white shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-2 text-white" />
                  <p className="text-2xl font-black uppercase tracking-wider">
                    ACCÈS AUTORISÉ
                  </p>
                  <p className="text-base font-bold mt-1">
                    {scanResult.user?.prenom} {scanResult.user?.nom}
                  </p>
                  <p className="text-xs text-emerald-100 font-mono mt-0.5">
                    {scanResult.user?.carteEtudiante} • {scanResult.timestamp}
                  </p>
                  <p className="text-[11px] text-emerald-200 mt-2 bg-emerald-700/60 py-1 px-2 rounded-lg">
                    Portique 1 déverrouillé
                  </p>
                </div>
              )}

              {scanResult.status === 'refused' && (
                <div className="z-10 p-6 rounded-2xl bg-rose-600 text-white shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                  <XCircle className="w-16 h-16 mx-auto mb-2 text-white" />
                  <p className="text-2xl font-black uppercase tracking-wider">
                    ACCÈS REFUSÉ
                  </p>
                  <p className="text-sm font-semibold mt-1 text-rose-100">
                    {scanResult.motif}
                  </p>
                  <p className="text-xs text-rose-200 font-mono mt-1">
                    {scanResult.timestamp}
                  </p>
                  <p className="text-[11px] text-rose-200 mt-2 bg-rose-700/60 py-1 px-2 rounded-lg">
                    Veuillez vous diriger vers le comptoir d'accueil
                  </p>
                </div>
              )}

              {scanResult.status === 'idle' && (
                <div className="z-10 text-slate-400 space-y-2">
                  <QrCode className="w-12 h-12 mx-auto text-slate-500 animate-bounce" />
                  <p className="text-xs font-medium">En attente d'un badge ou d'un pass QR...</p>
                </div>
              )}
            </div>

            {/* Saisie manuelle pour le test */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Test manuel : Scanner ou taper un n° de carte
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteScan(scanInput)}
                  placeholder="Ex. ETU-2024-1042"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleExecuteScan(scanInput)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Valider
                </button>
              </div>
            </div>

            {/* Boutons d'essais rapides pour la démo */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simuler des cas réels en 1 clic :</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteScan('ETU-2024-1042', 'QR Code')}
                  className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 text-xs text-left hover:bg-emerald-100 transition-colors"
                >
                  <p className="font-bold">✓ Étudiant en règle</p>
                  <p className="text-[11px] opacity-80">Omar El Fassi (Autorisé)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteScan('ETU-2021-9934', 'Carte')}
                  className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs text-left hover:bg-rose-100 transition-colors"
                >
                  <p className="font-bold">✗ Carte suspendue</p>
                  <p className="text-[11px] opacity-80">Kenza Tazi (Refusé)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteScan('INCONNU-999', 'Carte')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs text-left hover:bg-slate-100 transition-colors"
                >
                  <p className="font-bold">✗ Badge inconnu</p>
                  <p className="text-[11px] opacity-80">Numéro non répertorié</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RÈGLE 5 : MODAL DE CONFIRMATION AVEC MOTIF OBLIGATOIRE (Mode maintenance) */}
      {manualExitModalPassage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Enregistrer une sortie manuelle
                  </h3>
                  <span className="text-[10px] font-semibold text-amber-600">Mode maintenance actif</span>
                </div>
              </div>
              <button
                onClick={() => setManualExitModalPassage(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Usager :</span>
                <span className="font-bold text-slate-900 dark:text-white">{manualExitModalPassage.nomComplet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">N° Carte BU :</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{manualExitModalPassage.carteEtudiante}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heure d'entrée :</span>
                <span className="font-mono">{manualExitModalPassage.heureEntree}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmManualExit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motif obligatoire de la sortie *
                </label>
                <textarea
                  required
                  rows={3}
                  value={manualExitMotif}
                  onChange={(e) => setManualExitMotif(e.target.value)}
                  placeholder="Précisez la raison : ex. Badge oublié, carte démagnétisée, anomalie tourniquet, sortie exceptionnelle..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
                {!manualExitMotif.trim() && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    * Le motif est obligatoire pour valider la sortie et sera inscrit dans l'historique.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setManualExitModalPassage(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!manualExitMotif.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  Confirmer la sortie manuelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détail d'un passage historique */}
      {selectedPassageForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Détail du Passage au Tourniquet
            </h3>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Usager</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPassageForDetail.nomComplet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Identifiant</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedPassageForDetail.carteEtudiante}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heure Entrée</span>
                <span className="font-mono">{selectedPassageForDetail.heureEntree}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heure Sortie</span>
                <span className="font-mono">{selectedPassageForDetail.heureSortie || 'Toujours en salle'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Méthode</span>
                <span>{selectedPassageForDetail.methode}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Résultat</span>
                <span className={`font-bold ${selectedPassageForDetail.autorise ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedPassageForDetail.autorise ? 'AUTORISÉ' : 'REFUSÉ'}
                </span>
              </div>
              {selectedPassageForDetail.noteMaintenance && (
                <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-lg">
                  Sortie manuelle (maintenance) : {selectedPassageForDetail.noteMaintenance}
                </div>
              )}
              {selectedPassageForDetail.motifRefus && !selectedPassageForDetail.noteMaintenance && (
                <div className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 p-2 rounded-lg">
                  Motif : {selectedPassageForDetail.motifRefus}
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedPassageForDetail(null)}
              className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
