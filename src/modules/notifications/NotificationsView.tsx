/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, ArrowRight, RotateCw, CheckCircle2, XCircle, Send } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    currentUser, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    resendNotification,
    setActiveView 
  } = useApp();

  const isStaff = currentUser?.role === 'BIBLIOTHECAIRE' || currentUser?.role === 'ADMIN';

  // Notifications pour l'utilisateur
  const userNotifications = useMemo(() => {
    if (!currentUser) return notifications;
    if (isStaff) {
      return notifications;
    }
    return notifications.filter(
      n => n.destinataireId === currentUser.id || n.destinataireEmail === currentUser.email
    );
  }, [notifications, currentUser, isStaff]);

  const unreadCount = userNotifications.filter(n => !n.lue).length;

  const handleVoirClick = (notifId: string, targetView?: string) => {
    markNotificationAsRead(notifId);
    if (targetView) {
      setActiveView(targetView as any);
    } else {
      setActiveView('emprunts');
    }
  };

  // --- VUE BIBLIOTHÉCAIRE / ADMIN : « HISTORIQUE DES ENVOIS » (Règle 6) ---
  if (isStaff) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Historique des envois</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Registre des avis automatiques expédiés aux adhérents (Retards, Rappels, Retours, Disponibilités).
            </p>
          </div>
        </div>

        {/* Tableau Historique des envois (4 colonnes + action) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Destinataire</th>
                  <th className="px-4 py-3">Type d'événement</th>
                  <th className="px-4 py-3">Date d'envoi</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userNotifications.map(notif => {
                  const eventType = notif.evenementType || (
                    notif.titre.toLowerCase().includes('retard') ? 'Retard' :
                    notif.titre.toLowerCase().includes('rappel') ? 'Rappel' :
                    notif.titre.toLowerCase().includes('disponible') ? 'Disponibilité' :
                    notif.titre.toLowerCase().includes('rendu') ? 'Retour' : 'Rappel'
                  );
                  const isEchec = notif.statutEnvoi === 'Échec';

                  return (
                    <tr key={notif.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* 1. Destinataire */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {notif.destinataireNom || 'Adhérent BU'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {notif.destinataireEmail || 'contact@etudiant.univ.fr'}
                        </p>
                      </td>

                      {/* 2. Type d'événement */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                          eventType === 'Retard' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                          eventType === 'Disponibilité' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                          eventType === 'Retour' ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' :
                          'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        }`}>
                          {eventType}
                        </span>
                      </td>

                      {/* 3. Date */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {new Date(notif.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* 4. Statut */}
                      <td className="px-4 py-3.5">
                        {isEchec ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Échec
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Envoyé
                          </span>
                        )}
                      </td>

                      {/* 5. Action (Renvoyer si Échec) */}
                      <td className="px-4 py-3.5 text-right">
                        {isEchec ? (
                          <button
                            onClick={() => resendNotification(notif.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Renvoyer</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- VUE ÉTUDIANT : « NOTIFICATIONS ET ALERTES » ---
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Suivi synthétique de vos démarches et échéances en cours.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        {userNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              Aucune notification reçue pour le moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {userNotifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                  !notif.lue
                    ? 'bg-blue-50/40 dark:bg-blue-950/20'
                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Titre court et Date uniquement */}
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  {!notif.lue ? (
                    <span 
                      className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" 
                      title="Non lue" 
                    />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-transparent shrink-0" />
                  )}

                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {notif.titre}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {new Date(notif.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Bouton « Voir » */}
                <button
                  onClick={() => handleVoirClick(notif.id, notif.targetView)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <span>Voir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
