/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  HelpCircle, 
  Clock, 
  BookOpen, 
  Coins, 
  MapPin, 
  Mail, 
  Phone
} from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Aide & Règles</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Règles d'emprunt essentielles, horaires d'ouverture et assistance aux étudiants.
        </p>
      </div>

      {/* Les 3 Règles d'emprunt fondamentales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            3 Livres Maximum
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Chaque étudiant peut emprunter simultanément jusqu'à 3 livres. Tout ajout au-delà est refusé.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            14 Jours de Prêt
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            La durée normale d'un prêt est de 14 jours. Une prolongation unique de +7 jours est offerte.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            5,00 DH / Jour de Retard
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Une indemnité forfaitaire de 5,00 DH par jour ouvré s'applique automatiquement pour tout retard.
          </p>
        </div>
      </div>

      {/* Guide Pratique & Horaires */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Horaires d'Ouverture du Bâtiment & Comptoir</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">Du Lundi au Vendredi</p>
            <p className="text-slate-600 dark:text-slate-300 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
              08h00 — 20h00
            </p>
            <p className="text-[11px] text-slate-400">Service de prêt et retraits continus.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">Le Samedi</p>
            <p className="text-slate-600 dark:text-slate-300 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
              09h00 — 18h00
            </p>
            <p className="text-[11px] text-slate-400">Salle de travail silencieux et bornes automatiques.</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Comment fonctionne le retrait sous 48h ?
          </h3>
          <p className="leading-relaxed">
            Lorsque vous validez votre demande d'emprunt en ligne, les livres sont automatiquement mis de côté au <strong>Comptoir Central de prêt</strong>. Vous recevez un email Gmail de confirmation. Vous disposez alors de 48 heures ouvrées pour vous présenter avec votre carte étudiante ou votre pass QR d'accès. Passé ce délai, les ouvrages sont remis en rayon pour les autres étudiants.
          </p>

          <h3 className="font-bold text-slate-900 dark:text-white text-sm pt-2">
            Puis-je prolonger un emprunt ?
          </h3>
          <p className="leading-relaxed">
            Oui, une prolongation de <strong>7 jours supplémentaires</strong> est accordée en un clic, à condition que le livre ne soit pas réservé par un autre étudiant et que votre compte ne soit pas bloqué par une amende impayée.
          </p>
        </div>
      </div>

      {/* Coordonnées & Contact */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Nous Contacter & Assistance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px]">Accueil physique</p>
              <p className="font-semibold text-slate-900 dark:text-white">Comptoir Central, Hall A</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <Mail className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px]">Email Support</p>
              <p className="font-semibold text-slate-900 dark:text-white font-mono">contact-bu@bu-universite.ma</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <Phone className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px]">Standard Téléphonique</p>
              <p className="font-semibold text-slate-900 dark:text-white font-mono">+212 5 37 68 30 00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
