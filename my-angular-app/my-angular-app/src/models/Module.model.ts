import { Lecon } from "./Lecon.model";


export interface Module {
  titre: string;
  _id: string;
  lecons: Lecon[]; // Tableau d'objets Lecon
  isAddingLecon?: boolean;
}
