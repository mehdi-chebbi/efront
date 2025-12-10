// src/app/models/avis.model.ts

export interface UserReference {
  _id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  photo?: string;
}

export interface AvisMetadata {
  ip?: string;
  navigateur?: string;
}

export type AvisStatus = 'en_attente' | 'approuve' | 'rejete';

export interface Avis {
  _id: string;
  utilisateur: any; // Peut être l'ID ou l'objet utilisateur peuplé
  evaluation: number;
  commentaire: string;
  dateCreation: Date | string;
  statut: AvisStatus;
  metadonnees?: AvisMetadata;
}

// Pour la création d'un nouvel avis (sans _id et avec des champs optionnels)
export interface NewAvis {
  utilisateur: string;
  evaluation: number;
  commentaire: string;
  statut?: AvisStatus;
  metadonnees?: AvisMetadata;
}

// Pour les filtres de recherche
export interface AvisFilter {
  minRating?: number;
  maxRating?: number;
  statut?: AvisStatus;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
}
