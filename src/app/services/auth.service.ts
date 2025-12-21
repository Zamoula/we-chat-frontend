import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BYPASS_AUTH } from '../contexts/auth.context';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly url = 'http://localhost:3000/api/v0/authenticate';

  constructor(private http: HttpClient) { }

  register(user: any): Observable<any> {
    return this.http.post<any>(this.url + '/register',
      user,
      {
        context: new HttpContext().set(BYPASS_AUTH, true)
      }
    );
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(this.url + '/login',
      user,
      {
        context: new HttpContext().set(BYPASS_AUTH, true)
      }
    );
  }
}
