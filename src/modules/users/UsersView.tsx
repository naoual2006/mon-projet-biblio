/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Search, 
  X, 
  Save, 
  AlertTriangle,
  Mail,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, updateUserRole, currentUser, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [carteEtudiante, setCarteEtudiante] = useState('');
  const [role, setRole] = useState<UserRole>('ETUDIANT');
  const [filiere, setFiliere] = useState('');
  const [statut, setStatut] = useState<'Actif' | 'Suspendu'>('Actif');

  // Filtrage
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.carteEtudiante.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const openAddModal = () => {
    setUserToEdit(null);
    setNom('');
    setPrenom('');
    setEmail('');
    setCarteEtudiante(`ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setRole('ETUDIANT');
    setFiliere('Licence Informatique');
    setStatut('Actif');
    setUserModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setUserToEdit(u);
    setNom(u.nom);
    setPrenom(u.prenom);
    setEmail(u.email);
    setCarteEtudiante(u.carteEtudiante);
    setRole(u.role);
    setFiliere(u.filiere || '');
    setStatut(u.statut);
    setUserModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) return;

    if (userToEdit) {
      updateUser({
        ...userToEdit,
        nom,
        prenom,
        email,
        carteEtudiante,
        role,
        filiere,
        statut,
      });
    } else {
      addUser({
        nom,
        prenom,
        email,
        carteEtudiante,
        role,
        filiere,
        statut,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      });
    }

    setUserModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Adhérents</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Annuaire des étudiants, bibliothécaires et administrateurs du système BU.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un adhérent</span>
        </button>
      </div>

      {/* Barre de recherche rapide */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom, email ou n° de carte..."
          className="w-full text-xs sm:text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
            Effacer
          </button>
        )}
      </div>

      {/* Tableau Utilisateurs (5 colonnes maximum conformément à la consigne d'utilisabilité) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* 5 colonnes max : Adhérent, Email, N° Carte, Rôle (dropdown), Actions */}
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Adhérent</th>
                <th className="px-4 py-3">Email Gmail</th>
                <th className="px-4 py-3">N° Carte BU</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(user => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUserForDetail(user)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  {/* Colonne 1 : Adhérent */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {user.prenom} {user.nom}
                        </p>
                        <p className="text-[11px] text-slate-400">{user.filiere || 'Filière générale'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Colonne 2 : Email */}
                  <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                    {user.email}
                  </td>

                  {/* Colonne 3 : N° Carte */}
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {user.carteEtudiante}
                  </td>

                  {/* Colonne 4 : Rôle (liste déroulante pour ADMIN uniquement, texte pour BIBLIOTHECAIRE) */}
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    {currentUser?.role === 'ADMIN' ? (
                      <select
                        value={user.role}
                        disabled={currentUser?.id === user.id}
                        onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                        title={currentUser?.id === user.id ? "Vous ne pouvez pas modifier votre propre rôle" : undefined}
                      >
                        <option value="ETUDIANT">Étudiant</option>
                        <option value="BIBLIOTHECAIRE">Bibliothécaire</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                    ) : (
                      <span className="inline-block px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold">
                        {user.role === 'ETUDIANT' ? 'Étudiant' : user.role === 'BIBLIOTHECAIRE' ? 'Bibliothécaire' : 'Administrateur'}
                      </span>
                    )}
                  </td>

                  {/* Colonne 5 : Actions (Modifier, Supprimer) */}
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const isSelf = user.id === currentUser?.id;
                          const isLastAdmin = users.filter(u => u.role === 'ADMIN').length === 1 && user.role === 'ADMIN';
                          if (isSelf || isLastAdmin) {
                            showToast('Impossible : dernier administrateur ou compte courant.', 'error');
                            return;
                          }
                          setDeleteConfirmId(user.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détail au clic sur la ligne */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                Fiche Profil Adhérent
              </span>
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <img
                src={selectedUserForDetail.avatar}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedUserForDetail.prenom} {selectedUserForDetail.nom}
                </h3>
                <p className="text-xs text-slate-500">{selectedUserForDetail.filiere}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1.5 ${
                  selectedUserForDetail.statut === 'Actif'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  Statut : {selectedUserForDetail.statut}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Email Universitaire :</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{selectedUserForDetail.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Numéro de carte :</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedUserForDetail.carteEtudiante}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rôle attribué :</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserForDetail.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date d'inscription :</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{selectedUserForDetail.dateInscription}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const u = selectedUserForDetail;
                  setSelectedUserForDetail(null);
                  openEditModal(u);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Modifier
              </button>
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation de suppression */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Supprimer cet adhérent ?
              </h3>
              <p className="text-xs text-slate-500">
                Cette action supprimera le compte et son historique d'accès associé.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteUser(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout / Modification Utilisateur */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {userToEdit ? 'Modifier l’adhérent' : 'Ajouter un nouvel adhérent'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Gmail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    N° Carte BU *
                  </label>
                  <input
                    type="text"
                    required
                    value={carteEtudiante}
                    onChange={(e) => setCarteEtudiante(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rôle
                  </label>
                  {currentUser?.role === 'ADMIN' ? (
                    <select
                      value={role}
                      disabled={userToEdit ? userToEdit.id === currentUser.id : false}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="ETUDIANT">Étudiant</option>
                      <option value="BIBLIOTHECAIRE">Bibliothécaire</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {role === 'ETUDIANT' ? 'Étudiant' : role === 'BIBLIOTHECAIRE' ? 'Bibliothécaire' : 'Administrateur'}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Filière d'études
                  </label>
                  <input
                    type="text"
                    value={filiere}
                    onChange={(e) => setFiliere(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Statut de la carte
                  </label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as 'Actif' | 'Suspendu')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Actif">Actif (Autorisé)</option>
                    <option value="Suspendu">Suspendu (Bloqué)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  {userToEdit ? 'Enregistrer' : 'Créer l’adhérent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
