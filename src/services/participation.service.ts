import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {

  private apiUrl = 'http://localhost:3000/Participation'; // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient) {}

  inscrireUtilisateurFormation(utilisateurId: string, formationId: string): Observable<any> {
      const token = localStorage.getItem('authToken');


        // 2. Créer les en-têtes avec le token
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
    return this.http.post<any>(`${this.apiUrl}/inscription/${utilisateurId}/${formationId}`, {},{headers});
  }

  checkParticipation(userId: string, formationId: string): Observable<{ isInscrit: boolean }> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<{ isInscrit: boolean }>(`${this.apiUrl}/check/${userId}/${formationId}`,{headers});
  }
  deleteParticipation(utilisateurId: string, formationId: string): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<any>(`${this.apiUrl}/desinscription/${utilisateurId}/${formationId}`,{headers});
  }


}

