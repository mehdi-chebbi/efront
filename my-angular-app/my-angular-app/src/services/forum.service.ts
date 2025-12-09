import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/models/user.model';

export interface ForumTopic {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: User;
  category: {
    _id: string;
    name: string;
  };
  views: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  isSticky?: boolean;
  isClosed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private baseUrl = 'http://localhost:3000/Forum'; // Remplace par l'URL correcte de ton API

  constructor(private http: HttpClient) {}

  getAllTopics(): Observable<any[]> {
     const token = localStorage.getItem('authToken');


      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

    return this.http.get<any[]>(`${this.baseUrl}`,{headers});
  }
  updateTopic(id: string, updatedData: any): Observable<any> {
  const token = localStorage.getItem('authToken');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.put<any>(`${this.baseUrl}/topicsUpdate/${id}`, updatedData, { headers });
}


// Dans votre service
incrementTopicViews(topicId: any, userId :any): Observable<any> {
   const token = localStorage.getItem('authToken');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

// À adapter selon votre système d'authentification
  return this.http.patch(`${this.baseUrl}/${topicId}/views`, { userId },{headers});
}
  // Créer un nouveau sujet
  createTopic(topicData: any): Observable<any> {
     const token = localStorage.getItem('authToken');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

    return this.http.post(`${this.baseUrl}/topics`, topicData,{headers});
  }
  getAllPostsByTopicId(topicId: string): Observable<any> {
     const token = localStorage.getItem('authToken');


  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

    return this.http.get(`${this.baseUrl}/topics/${topicId}/posts`,{headers});
  }

  // Ajouter un post à un sujet
  addPostToTopic(topicId: string, postData: any): Observable<any> {
     const token = localStorage.getItem('authToken');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });


    return this.http.post(`${this.baseUrl}/${topicId}`, postData,{headers});
  }

  deleteForumTopic(topicId: string): Observable<any> {
     const token = localStorage.getItem('authToken');



  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

    return this.http.delete(`${this.baseUrl}/topics/${topicId}`,{headers});
  }
  deletePost(topicId: string, postId: string): Observable<any> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.delete(`${this.baseUrl}/topics/${topicId}/posts/${postId}`, { headers });
}





  // Marquer un post comme solution
 markAsSolution(postId: string): Observable<any> {
  const token = localStorage.getItem('authToken');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.put<any>(`${this.baseUrl}/${postId}/solution`, {}, { headers });
}

}
