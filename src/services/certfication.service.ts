import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Certificat {
  _id?: string;
  idUser: string;
  idFormation: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CertificatService {
  private apiUrl = 'http://localhost:3000/certificats';

  constructor(private http: HttpClient) {}

  createCertificat(formData: FormData, idUser: string, idFormation: string): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Construct URL with params
    const url = `${this.apiUrl}/${idUser}/${idFormation}`;

    // Envoyer le formulaire avec l'image à l'URL
    return this.http.post<any>(url, formData,{headers});
  }

  replaceStudentName(certifId: any, newName: string): Observable<{ imagePath: string }> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<{ imagePath: string }>(
      `${this.apiUrl}/${certifId}/replace-name`,
      { newName },
      {headers}
    );
  }



  getAllCertificats(): Observable<Certificat[]> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Certificat[]>(this.apiUrl,{headers});
  }


  getCertificatById(id: string): Observable<Certificat> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Certificat>(`${this.apiUrl}/${id}`,{headers});
  }

  updateCertificat(id: string, certificat: Certificat): Observable<Certificat> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Certificat>(`${this.apiUrl}/${id}`, certificat,{headers});
  }

  deleteCertificat(id: string): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/${id}`,{headers});
  }

  getCertifByIdFormation(idFormation: any): Observable<any> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/${idFormation}`,{headers});
  }


  updateCertifiedPersonValueByIdFormation(idFormation: string, valeur: string): Observable<any> {
      const token = localStorage.getItem('authToken');


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = { valeur };

    return this.http.put(
      `${this.apiUrl}/certif/${idFormation}/`,
      body,
      { headers }
    );
  }
}
