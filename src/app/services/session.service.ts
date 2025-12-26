import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:3000/api/v0/authenticate';

@Injectable({ providedIn: 'root' })
export class SessionService {

    constructor(private http: HttpClient) { }

    getSessions(): Observable<any[]> {
        return this.http.get<any[]>(BASE_URL + '/sessions');
    }

    terminateSession(sessionId: string): Observable<void> {
        return this.http.delete<void>(BASE_URL + `/me/devices/${sessionId}`);
    }

    terminateCurrentSession(): Observable<void> {
        return this.http.post<void>(BASE_URL + '/logout', {});
    }

    terminateAllSessions(): Observable<void> {
        return this.http.post<void>(BASE_URL + '/logout-all', {});
    }
  
}
