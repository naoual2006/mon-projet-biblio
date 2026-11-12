/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Star, Reply, CornerUpRight, Trash2, ShieldCheck } from 'lucide-react';

export const GmailModal: React.FC = () => {
  const { gmailModalNotification, setGmailModalNotification } = useApp();

  if (!gmailModalNotification || !gmailModalNotification.gmailPreview) return null;

  const { from, to, subject, body, date } = gmailModalNotification.gmailPreview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* En-tête style Gmail */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Gmail</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Notification Universitaire
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Simulation d’email envoyé</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGmailModalNotification(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu du mail */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Sujet */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {subject}
            </h2>
            <Star className="w-5 h-5 text-amber-400 shrink-0 fill-amber-400 mt-1" />
          </div>

          {/* Expéditeur & Destinataire */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                BU
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {from}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  À : <span className="font-mono">{to}</span>
                </p>
              </div>
            </div>
            <div className="text-right text-slate-400 font-mono text-[11px]">
              {date}
            </div>
          </div>

          {/* Corps de l'email */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
            <pre className="font-sans text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {body}
            </pre>
          </div>

          {/* Badge de sécurité */}
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Message chiffré et certifié conforme par le service documentaire universitaire.</span>
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGmailModalNotification(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              Répondre (simulation)
            </button>
            <button
              onClick={() => setGmailModalNotification(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <CornerUpRight className="w-3.5 h-3.5" />
              Transférer
            </button>
          </div>
          <button
            onClick={() => setGmailModalNotification(null)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium rounded-lg transition-colors"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
