import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Chat } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly url = 'http://localhost:3000/api/v0/rooms';

  constructor(private http: HttpClient) { }

  create(room :any): Observable<any> {
    return this.http.post<any>(this.url, room);
  }

  getChatRooms(userId: any): Observable<any[]> {
    return this.http.get<any[]>(this.url + `/${userId}`);
  }

  getRoom(roomId: any): Observable<any> {
    return this.http.get<any>(this.url + `/${roomId}/participants`);
  }

  participate(roomId: any, user: any): Observable<any> {
    return this.http.post<any>(this.url + `/${roomId}/participate`, user);
  }
}
