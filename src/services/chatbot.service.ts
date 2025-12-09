import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://192.168.2.139/chat'; // URL de ton API Flask

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({
      'Authorization': `Bearer ${token}`
    }) : new HttpHeaders();

    // Le corps contient uniquement le message, les headers sont passés séparément
    return this.http.post<any>(this.apiUrl, { message }, { headers });
  }
}
