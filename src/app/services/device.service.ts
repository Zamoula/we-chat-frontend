import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeviceService {

  constructor(private http: HttpClient) { }

  getDeviceInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const vendor = navigator.vendor;

    return {
      userAgent: ua,
      platform: platform,
      vendor: vendor,
      isMobile: /Mobi|Android/i.test(ua)
    };
  }

  getDevices(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/api/v0/users/devices');
  }
}
