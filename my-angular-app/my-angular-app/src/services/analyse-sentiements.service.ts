import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, catchError, of } from "rxjs";
import { forkJoin } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AnalyseSentiementsService {
  private apiUrl = 'http://127.0.0.1:5001/analyse_sentiment';

  constructor(private http: HttpClient) {}

  analyserCommentaire(commentaire: any): Observable<any> {
    const payload = { text: commentaire };
    return this.http.post<{result: any}>(this.apiUrl, payload).pipe(
      map(response => {
        const resultText = response.result;
        if (resultText.includes('Positif')) return 'positif';
        if (resultText.includes('Négatif')) return 'negatif';
        if (resultText.includes('Neutre')) return 'neutre';
        return 'inconnu';
      }),
      catchError(() => of('inconnu')) // Gérer les erreurs en retournant 'inconnu'
    );
  }
    // Nouvelle fonction qui filtre uniquement les commentaires positifs

}
