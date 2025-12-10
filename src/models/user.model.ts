export interface User {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'administrateur' | 'formateur' | 'apprenant' | 'partenaire';
  Langue: 'Fr' | 'En';
  photo?: string;  // Optionnel si la photo n'est pas toujours présente
  phone?: string;  // Optionnel
  organisation?: string;  // Optionnel
  poste?: string;  // Optionnel
  adresse?: string;  // Optionnel
  isActive?: boolean;  // Optionnel
  resetToken?: string;  // Optionnel, si vous gérez le reset du mot de passe
  resetTokenExpire?: Date;  // Optionnel
}
