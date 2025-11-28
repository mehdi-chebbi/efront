import { Module } from "./Module.model";
import { Quiz } from "./Quiz.model";

export interface Formation {
  message: string | null;
  _id: string; // L'ID de la formation
  formationId?: string; // Ajouter formationId pour correspondre à la réponse de l'API
  titre: string;
  videoIntroduction: string;
  description: string;
  departement: string;
  thematique: string;
  ressource: string;
  photo: string;
  duree: string;
  responsable?: { _id: string; nom: string };
  modules: Module[];
  quiz: any [];
}
