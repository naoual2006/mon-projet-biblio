/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ETUDIANT' | 'BIBLIOTHECAIRE' | 'ADMIN';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  carteEtudiante: string;
  role: UserRole;
  avatar?: string;
  filiere?: string;
  dateInscription: string;
  statut: 'Actif' | 'Suspendu';
}

export type BookCategory = 
  | 'Informatique' 
  | 'Littérature' 
  | 'Droit' 
  | 'Sciences' 
  | 'Économie' 
  | 'Histoire' 
  | 'Philosophie';

export type BookDisponibilite = 'En rayon' | 'Épuisé';

export interface Ouvrage {
  id: string;
  titre: string;
  auteur: string;
  isbn: string;
  categorie: BookCategory;
  anneePublication: number;
  disponibilite: BookDisponibilite;
  exemplairesDisponibles: number;
  exemplairesTotal: number;
  couvertureUrl: string;
  description: string;
  emplacement: string;
  empruntsTotal: number;
  estNouveaute?: boolean;
}

export type EmpruntStatut = 
  | 'En attente de retrait' 
  | 'En cours' 
  | 'Retour à valider'
  | 'Rendu';

export interface Emprunt {
  id: string;
  ouvrageId: string;
  ouvrageTitre: string;
  ouvrageCouverture: string;
  ouvrageAuteur: string;
  etudiantId: string;
  etudiantNomComplet: string;
  etudiantCarte: string;
  dateSortie: string; // ISO string
  dateRetourPrevue: string; // ISO string
  dateRetourEffective?: string | null;
  statut: EmpruntStatut;
  prolonge: boolean; // 1 prolongation unique (+7 jours)
  amende: number; // 0.50 € par jour de retard
  amendePayee: boolean;
  dateRetraitLimite?: string; // 48h après validation
}

export interface Reservation {
  id: string;
  ouvrageId: string;
  ouvrageTitre: string;
  ouvrageCouverture: string;
  etudiantId: string;
  etudiantNomComplet: string;
  etudiantEmail: string;
  dateDemande: string;
  statut: 'En attente' | 'Disponible' | 'Terminée' | 'Annulée';
}

export interface AccesPassage {
  id: string;
  etudiantId: string;
  nomComplet: string;
  carteEtudiante: string;
  role: UserRole;
  heureEntree: string; // HH:mm ou Date ISO
  heureSortie: string | null;
  methode: 'Carte' | 'QR Code';
  autorise: boolean;
  motifRefus?: string;
  noteMaintenance?: string;
}

export interface ConnexionError {
  id: string;
  date: string;
  carteMasquee: string;
  motif: string;
}

export interface AppNotification {
  id: string;
  destinataireId: string;
  destinataireNom?: string;
  destinataireEmail?: string;
  titre: string;
  date: string;
  lue: boolean;
  targetView?: AppNavView;
  type?: 'emprunt_confirme' | 'retrait_pret' | 'rappel_2jours' | 'retard' | 'reservation_dispo' | 'retour_valide' | 'amende';
  evenementType?: 'Retard' | 'Rappel' | 'Retour' | 'Disponibilité' | 'Emprunt';
  statutEnvoi?: 'Envoyé' | 'Échec';
  message?: string;
  gmailPreview?: {
    from: string;
    to: string;
    subject: string;
    body: string;
    date: string;
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type AppNavView = 
  | 'catalogue' 
  | 'dashboard' 
  | 'emprunts' 
  | 'traiter' 
  | 'scanner' 
  | 'adherents' 
  | 'acces' 
  | 'journal_securite'
  | 'notifications' 
  | 'aide' 
  | 'favoris';
