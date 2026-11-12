/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, QrCode, Maximize2, Minimize2, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export const StudentQrModal: React.FC = () => {
  const { studentQrModalOpen, setStudentQrModalOpen, currentUser } = useApp();
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  if (!studentQrModalOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`w-full ${isZoomed ? 'max-w-xl' : 'max-w-md'} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pass Entrée Bibliothèque
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isZoomed ? "Réduire" : "Agrandir le QR Code"}
            >
              {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setStudentQrModalOpen(false);
                setIsZoomed(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 text-center space-y-5">
          {/* Badge de statut */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Accès aux portiques autorisé (Année 2026/2027)</span>
          </div>

          {/* QR Code Container */}
          <div className="flex justify-center">
            <div className={`p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-md inline-block transition-all ${isZoomed ? 'scale-110 my-4' : ''}`}>
              {/* SVG QR Code interactif haute précision */}
              <svg 
                className={`${isZoomed ? 'w-56 h-56' : 'w-44 h-44'}`}
                viewBox="0 0 160 160" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Coins de repère QR standards */}
                <rect x="10" y="10" width="40" height="40" stroke="#0f172a" strokeWidth="8" rx="4" />
                <rect x="22" y="22" width="16" height="16" fill="#0f172a" rx="2" />
                
                <rect x="110" y="10" width="40" height="40" stroke="#0f172a" strokeWidth="8" rx="4" />
                <rect x="122" y="22" width="16" height="16" fill="#0f172a" rx="2" />
                
                <rect x="10" y="110" width="40" height="40" stroke="#0f172a" strokeWidth="8" rx="4" />
                <rect x="22" y="122" width="16" height="16" fill="#0f172a" rx="2" />

                {/* Motifs de données */}
                <rect x="60" y="15" width="10" height="10" fill="#0f172a" />
                <rect x="80" y="15" width="10" height="10" fill="#0f172a" />
                <rect x="70" y="30" width="15" height="10" fill="#0f172a" />
                <rect x="60" y="45" width="10" height="15" fill="#0f172a" />

                {/* Milieu & Alignement */}
                <rect x="20" y="65" width="12" height="12" fill="#0f172a" />
                <rect x="40" y="65" width="8" height="20" fill="#0f172a" />
                <rect x="60" y="70" width="25" height="25" stroke="#0f172a" strokeWidth="6" rx="2" />
                <rect x="70" y="80" width="6" height="6" fill="#2563eb" />

                <rect x="95" y="65" width="15" height="10" fill="#0f172a" />
                <rect x="120" y="65" width="20" height="10" fill="#0f172a" />
                <rect x="100" y="85" width="12" height="15" fill="#0f172a" />
                <rect x="125" y="85" width="15" height="20" fill="#0f172a" />

                {/* Bas */}
                <rect x="60" y="115" width="15" height="10" fill="#0f172a" />
                <rect x="85" y="115" width="10" height="25" fill="#0f172a" />
                <rect x="60" y="135" width="20" height="10" fill="#0f172a" />
                <rect x="110" y="115" width="12" height="12" fill="#0f172a" />
                <rect x="130" y="115" width="12" height="25" fill="#0f172a" />
                <rect x="110" y="135" width="12" height="10" fill="#0f172a" />
              </svg>
            </div>
          </div>

          {/* Informations étudiant */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Titulaire de la carte</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {currentUser.prenom} {currentUser.nom}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Identifiant BU</p>
                <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                  {currentUser.carteEtudiante}
                </p>
              </div>
            </div>
            {currentUser.filiere && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                {currentUser.filiere}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Présentez ce QR Code face à la caméra ou à la borne d’accès des tourniquets d’entrée de la BU.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isZoomed ? 'Taille normale' : 'Agrandir pour le scan'}</span>
          </button>
          <button
            onClick={() => setStudentQrModalOpen(false)}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
