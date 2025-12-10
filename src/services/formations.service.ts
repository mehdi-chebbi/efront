
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Formation } from 'src/models/Formation.model';
import { Module } from 'src/models/Module.model';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import { Quiz } from 'src/models/Quiz.model';

@Injectable({
  providedIn: 'root'
})
export class FormationsService {
 private apiUrl = 'http://192.168.2.139/formations';  // L'URL de votre API

  constructor(private http: HttpClient) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../../../assets/pdf.worker.js';

   }

  getFormations(): Observable<Formation[]> {
      const token = localStorage.getItem('authToken');


        // 2. Créer les en-têtes avec le token
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
    return this.http.get<Formation[]>(`${this.apiUrl}/formations`,{headers}).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    return throwError(() => new Error('Erreur de récupération des formations.'));
  }
  getFormationsWithModules(formationIds: string[]): Observable<any[]> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any[]>(`${this.apiUrl}/formations/modules`, { ids: formationIds},{headers});
  }
  getFormationById(id: any): Observable<Formation> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Formation>(`${this.apiUrl}/${id}`,{headers});
  }

  addFormation(formationData: any): Observable<Formation> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Formation>(`${this.apiUrl}/AjouterFormation`,formationData,{headers});
  }

  addModuleToFormation(formationId: any, titre: string): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const moduleData = { titre };

    // Envoi de la requête POST pour ajouter un module à la formation
    return this.http.post<any>(`http://192.168.2.139/modules/AjouterModule/${formationId}`, moduleData,{headers});
  }

  deleteModule(formationId: any, moduleId: any): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<any>(`http://192.168.2.139/modules/delete/${formationId}/${moduleId}`,{headers});
  }

  updateModule(moduleId: any, titre: string): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const moduleData = { titre };
    return this.http.put<any>(`http://192.168.2.139/modules/update/${moduleId}`, moduleData,{headers});
  }



  addLecon(moduleId: string, titre: string,description : string, contenu: string | File, type: 'text' | 'video' | 'PDF' | 'PPT'): Observable<any> {
     const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('type', type);
    formData.append('description', description);

    // Si le type est 'text', ajouter le texte dans 'contenu', sinon ajouter le fichier
    if (type === 'text') {
      formData.append('contenu', contenu as string);
    } else {
      formData.append('file', contenu as File); // Ajoute le fichier
    }
    // Envoi des données via POST
    return this.http.post(`http://192.168.2.139/Lecon/AddLecon/${moduleId}`, formData,{headers});
  }

  deleteFormation(formationId: string): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/delete/${formationId}`,{headers});
  }
  updateFormation(id: string, formData: FormData): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/update/${id}`, formData,{headers});
  }

  deleteLecon(moduleId: any, leconId: any): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<any>(`http://192.168.2.139/Lecon/deleteLecon/${moduleId}/${leconId}`,{headers});
  }
  updateLecon(leconId: any, titre: string, type: string, contenu: any,progres :any): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('type', type);
    formData.append('progres', progres.toString());

    if (type === 'text') {
      formData.append('contenu', contenu);
    } else {
      formData.append('file', contenu);
    }

    return this.http.put<any>(`http://192.168.2.139/lecon/updatelecons/${leconId}`, formData,{headers});
  }

  getLeconsByModule(moduleId: any): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`http://192.168.2.139/lecon/getLeconsByModule/${moduleId}`,{headers});
  }
  getLeconById(moduleId: string, leconId: string): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`http://192.168.2.139/lecon/${moduleId}/lecons/${leconId}`,{headers});
  }

  extractTextFromPdf(pdfUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      loadingTask.promise
        .then((pdf: PDFDocumentProxy) => {
          const numPages = pdf.numPages;
          let textContent = '';

          const pagePromises: Promise<void>[] = [];
          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const pagePromise = pdf.getPage(pageNum).then((page) => {
              return page.getTextContent().then((text) => {
                textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
              });
            });
            pagePromises.push(pagePromise);
          }

          Promise.all(pagePromises)
            .then(() => resolve(textContent))
            .catch((err) => reject('Erreur lors de l\'extraction du texte des pages: ' + err));
        })
        .catch((error) => {
          reject('Erreur lors du chargement du PDF: ' + error);
        });
    });
  }

  ajouterUnQuiz(formationId: string, quiz: any): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/${formationId}/quiz`, quiz,{headers}).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }
  getQuizzesByFormationId(idformation: any): Observable<any[]> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}/${idformation}`,{headers});
  }

  updateQuizByIdFormation(idformation: any, idquiz: any, quizData: any): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(`${this.apiUrl}/formationsQuizUpdate/${idformation}/${idquiz}`, quizData,{headers});
  }


  getModulesByFormationId(id:   any): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/modulesList/${id}`,{headers});
  }

}
