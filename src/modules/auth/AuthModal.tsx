/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { 
  X, 
  Sparkles, 
  ShieldCheck,
  BookOpen,
  Mail,
  AlertCircle
} from 'lucide-react';

const DEMO_MODE = true; // Activable pour la démonstration rapide

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, users, login, showToast, recordConnexionError } = useApp();

  const [emailInput, setEmailInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setEmailInput('');
    setErrorMsg(null);
  };

  const handleGoogleLogin = (emailToTest?: string) => {
    setErrorMsg(null);
    const email = (emailToTest || emailInput).trim().toLowerCase();

    if (!email || !email.includes('@')) {
      const msg = 'Veuillez saisir une adresse email valide.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    const matchedUser = users.find(u => u.email.toLowerCase() === email);

    if (!matchedUser) {
      const msg = 'Ce compte Google n’est pas autorisé. Contactez la bibliothèque.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      recordConnexionError(email, msg);
      return;
    }

    if (matchedUser.statut === 'Suspendu') {
      const msg = 'Compte suspendu. Contactez la bibliothèque.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      recordConnexionError(email, msg);
      return;
    }

    login(matchedUser);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Connexion BiblioTech
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authentification universitaire par Google
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Adresse e-mail Google (Gmail ou universitaire) *
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGoogleLogin();
                  }
                }}
                placeholder="omar.elfassi@gmail.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 outline-none transition-all ${
                  errorMsg
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {errorMsg && (
              <div className="flex items-start gap-1.5 pt-1 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white shadow-xs cursor-pointer transition-all"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuer avec Google</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <span>
              Google certifie l'identité universitaire et achemine les notifications de prêt. Aucun mot de passe requis.
            </span>
          </div>

          {/* Profils de démonstration (visibles si DEMO_MODE) */}
          {DEMO_MODE && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Comptes Google de démonstration :</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput(users[0].email);
                    handleGoogleLogin(users[0].email);
                  }}
                  className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Étudiant</p>
                  <p className="text-[10px] text-slate-400 truncate">Omar El Fassi</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput(users[1].email);
                    handleGoogleLogin(users[1].email);
                  }}
                  className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Bibliothécaire</p>
                  <p className="text-[10px] text-slate-400 truncate">Salma Bennani</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput(users[2].email);
                    handleGoogleLogin(users[2].email);
                  }}
                  className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-400 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Admin</p>
                  <p className="text-[10px] text-slate-400 truncate">Karim Tazi</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
