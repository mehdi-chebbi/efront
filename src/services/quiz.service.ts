import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://192.168.2.138/Quiz'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer un quiz par son ID
  getQuizById(id: string): Observable<any> {
    const token = localStorage.getItem('authToken');

             if (!token) {
               throw new Error('Token non trouvé');
             }

             // 2. Créer les en-têtes avec le token
             const headers = new HttpHeaders({
               'Authorization': `Bearer ${token}`
             });
    return this.http.get(`${this.apiUrl}/${id}`,{headers});
  }
  // Méthode pour supprimer un quiz
  deleteQuiz(quizId: string): Observable<any> {
    const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.delete(`${this.apiUrl}/supprimer/${quizId}`,{headers});
  }

}
