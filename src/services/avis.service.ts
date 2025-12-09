import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Avis } from 'src/models/Avis.model';

@Injectable({
  providedIn: 'root'
})

export class AvisService {
  private apiUrl = 'http://192.168.2.138/Avis'; // Remplacez par l'URL de votre API

    constructor(private http: HttpClient) { }

    getAvis(): Observable<any[]> {
        // 1. Récupérer le token depuis localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token non trouvé');
    }

    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

      return this.http.get<any[]>(`${this.apiUrl}`, { headers });
    }

    /**
     * Récupère un avis spécifique par son ID
     */
    getAvisById(id: string): Observable<any[]> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

      return this.http.get<any[]>(`${this.apiUrl}/${id}`,{headers});
    }

    /**
     * Crée un nouvel avis
     */
    createAvis(avis: any): Observable<any> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
      return this.http.post<any>(`${this.apiUrl}`, avis,{headers});
    }

    /**
     * Met à jour un avis existant
     */
    updateAvis(id: any, avis: Partial<any>): Observable<any> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
      return this.http.put<any>(`${this.apiUrl}/avis/${id}`, avis,{headers});
    }

    getAvisByUserId(userId: string): Observable<any> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
      return this.http.get(`${this.apiUrl}/avis/utilisateur/${userId}`,{headers});
    }

    /**
     * Supprime un avis
     */
    deleteAvis(id: string): Observable<void> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
      return this.http.delete<void>(`${this.apiUrl}/avis/${id}`,{headers});
    }

    /**
     * Récupère les avis par utilisateur
     */
    getAvisByUser(userId: string): Observable<Avis[]> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
      return this.http.get<Avis[]>(`${this.apiUrl}/user/${userId}`,{headers});
    }

    /**
     * Récupère les avis avec une évaluation minimale
     */
    getAvisByMinRating(minRating: number): Observable<Avis[]> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
      return this.http.get<Avis[]>(`${this.apiUrl}?minRating=${minRating}`,{headers});
    }

    /**
     * Approuve un avis (pour l'admin)
     */
    approveAvis(id: string): Observable<Avis> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
      return this.http.patch<Avis>(`${this.apiUrl}/${id}/approve`, {},{headers});
    }

    /**
     * Rejette un avis (pour l'admin)
     */
    rejectAvis(id: string): Observable<Avis> {
        const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
      return this.http.patch<Avis>(`${this.apiUrl}/${id}/reject`, {},{headers});
    }

   getManyFormations(times: number) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    console.error('Token non trouvé');
    return; // On arrête proprement la fonction
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  for (let i = 0; i < times; i++) {
    this.http.get(this.apiUrl, { headers }).subscribe({
      next: (res) => console.log(`Réponse ${i + 1}:`, res),
      error: (err) => console.error(`Erreur ${i + 1}:`, err)
    });
  }
}




}
