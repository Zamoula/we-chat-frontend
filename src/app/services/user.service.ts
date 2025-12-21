import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly url = 'http://localhost:3000/api/v0/users';
  
  constructor(private http: HttpClient) { }

  getInfo(): Observable<any> {
    return this.http.get<any>(this.url + '/info');
  }
}
