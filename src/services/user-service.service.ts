import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from 'src/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private apiUrl = 'http://localhost:3000/users';  // L'URL de votre API

  constructor(private http: HttpClient) { }


  getUserDetails(userId: string): Observable<any> {
    const token = localStorage.getItem('authToken');

             if (!token) {
               throw new Error('Token non trouvé');
             }

             // 2. Créer les en-têtes avec le token
             const headers = new HttpHeaders({
               'Authorization': `Bearer ${token}`
             });
    return this.http.get(`${this.apiUrl}/${userId}`,{headers});
  }
  getUser(): Observable<any> {
    const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.get(`${this.apiUrl}`,{headers});
  }


  updateUser(userId: string, userData: any): Observable<any> {
    const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.put(`${this.apiUrl}/${userId}`, userData,{headers});
  }

  updateQuizEvaluation(data: {
    userId: string;
    formationId: string;
    quizId: string;
    evaluation: number;
  }): Observable<any> {
    const { userId, ...body } = data; // Extraire userId pour l'URL
    const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.put<any>(`${this.apiUrl}/update-quiz-evaluation/${userId}`, body,{headers});
  }

  // Méthode pour enregistrer un utilisateur
  registerUser(formData: FormData): Observable<any> {
    const token = localStorage.getItem('authToken');


         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.post<any>(`${this.apiUrl}/register`, formData,{headers});
  }

  getUserEvaluationsWithDetails(userId: string): Observable<any[]> {
    const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/evaluations`,{headers});
  }

  getQuizzes(userId: string, formationId: string): Observable<any> {
    const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.get<any>(`${this.apiUrl}/getQuizzes/${userId}/${formationId}`,{headers});
  }

  updateQuizAvancement(data: { userId: string, quizId: string, evaluation: number }): Observable<any> {
    const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.put<any>(`${this.apiUrl}/quiz-progress`, data,{headers});
  }
  loginUser(email: string, password: string): Observable<any> {
    const token = localStorage.getItem('authToken');

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password,headers })
      .pipe(
        catchError(error => {
          throw error;  // Gestion des erreurs
        })
      );
  }

  // Méthode pour stocker le token dans le localStorage
  storeToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  // Méthode pour récupérer le token du localStorage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  forgotPassword(email: string): Observable<any> {
    const token = localStorage.getItem('authToken');


         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email,headers });
  }

  // 2. Vérification du code de réinitialisation
  verifyResetCode(email: string, code: string): Observable<any> {
    const token = localStorage.getItem('authToken');



         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
    return this.http.post<any>(`${this.apiUrl}/verify-reset-code`, { email, code,headers });
  }

  // 3. Réinitialisation du mot de passe
  // 3. Réinitialisation du mot de passe avec le code de vérification
resetPassword(email: string, code: string, newPassword: string): Observable<any> {
  const token = localStorage.getItem('authToken');


         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.post<any>(`${this.apiUrl}/reset-password`, { email, code, newPassword,headers });
}


logout(): Observable<any> {
  const token = localStorage.getItem('authToken');


         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.post<any>(`${this.apiUrl}/logout`, {headers}) // Ajout d'un body vide pour éviter les erreurs
    .pipe(
      catchError(error => {
        console.error("Erreur lors de la déconnexion :", error);
        return throwError(() => new Error('Échec de la déconnexion'));
      })
    );
}

deleteUser(id: string): Observable<any> {
  const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.delete(`${this.apiUrl}/${id}`,{headers});
}
checkEmailExists(email: string): Observable<boolean> {
  const token = localStorage.getItem('authToken');


         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.get<boolean>(`http://localhost:3000/users/check-email?email=${email}`,{headers});
}

toggleUserStatus(userId: string): Observable<any> {
  const token = localStorage.getItem('authToken');



         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.patch<any>(`${this.apiUrl}/${userId}/toggle-status`, {headers});
}

updateUserPhoto(userId: string, formData: FormData): Observable<any> {
  const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.patch<any>(`${this.apiUrl}/${userId}/update-photo`, formData,{headers});
}

updateAvancement(userId: string, leconId: any, moduleId: any, progres: number): Observable<any> {
  const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.put(`${this.apiUrl}/avancement/${userId}/${leconId}/${moduleId}`, {progres},{headers});
}

findProgresByIdModuleIdLecon(userId: string, moduleId: string, leconId: string): Observable<any> {
  const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.get(`${this.apiUrl}/progres/${userId}/${moduleId}/${leconId}`,{headers});
}

findProgresByIdUser(userId: string): Observable<any> {
  const token = localStorage.getItem('authToken');

         if (!token) {
           throw new Error('Token non trouvé');
         }

         // 2. Créer les en-têtes avec le token
         const headers = new HttpHeaders({
           'Authorization': `Bearer ${token}`
         });
  return this.http.get(`${this.apiUrl}/progresUser/${userId}`,{headers});
}
}
