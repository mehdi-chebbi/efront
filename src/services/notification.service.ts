import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private socket: Socket;
  private readonly uri: string = 'http://192.168.2.138';
  private apiUrl = 'http://192.168.2.138/Notif';

  constructor(private http: HttpClient) {
    this.socket = io(this.uri);
  }


  // 🔔 Ajouter une notification
  addNotification(notificationData: {

    utilisateur: string;
    message: string;
  }): Observable<{ success: boolean; data: Notification }> {
      const token = localStorage.getItem('authToken');



        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
    return this.http.post<{ success: boolean; data: Notification }>(
      `${this.apiUrl}/addNotif`,
      notificationData,
      {headers}
    );
  }

  // 🔔 Récupérer les dernières notifications
  getNotification(): Observable<any[]> {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<{ success: boolean; data:any[] }>(
      `${this.apiUrl}/`,{headers}
    ).pipe(
      // Extraire seulement la data
      map((response: { data: any; }) => response.data)
    );
  }

  // Fonction pour envoyer une notification
  sendNotification(message: string) {
      const token = localStorage.getItem('authToken');


    // 2. Créer les en-têtes avec le token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.socket.emit('sendNotification', { message,headers });
  }

  // Fonction pour écouter les notifications
  getNotifications(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receiveNotification', (data) => {
        observer.next(data);
      });
    });
  }
}
