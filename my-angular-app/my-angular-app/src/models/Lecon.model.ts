export interface Lecon {
duree: any;
  titre: string;
  description: string;
  progres : number ;
  _id: string;
  contenu: string; // URL du fichier ou texte brut
  type: 'text' | 'video' | 'PDF' | 'PPT';
  fichierUrl?: string; // Stocke l'URL du fichier si c'est un PDF, vidéo ou PPT

}
