import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ThemeService, THEMES } from '../../services/theme.service';
import { DeviceService } from '../../services/device.service';
import { SessionService } from '../../services/session.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ButtonModule, Toast],
  providers: [MessageService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  isDarkMode: boolean;
  themes = Object.keys(THEMES);
  currentTheme: string;

  activeSessionsCount: number = 0;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private deviceService: DeviceService,
    private sessionService: SessionService
  ) {
    this.currentTheme = this.themeService.getStoredTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }
  ngOnInit(): void {
    this.sessionService.getSessions().subscribe((res: any) => {
            const data = Array.isArray(res) ? res : (res?.sessions || []);
            this.activeSessionsCount = data.filter((s: any) => !s.revoked).length;
            console.log(this.activeSessionsCount);
        });

    this.deviceService.getDevices().subscribe((devices) => {
      console.log(devices);
    });
  }

  setTheme(themeName: string) {
    this.currentTheme = themeName;
    this.themeService.setTheme(themeName);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToConnectedDevices() {
    this.router.navigate(['/connected-devices']);
  }

  navigateToActiveSessions() {
    this.router.navigate(['/active-sessions']);
  }

  logout() {
    this.sessionService.terminateCurrentSession().subscribe({
      complete: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        this.router.navigate(['/']);
      }
    });
  }
}
