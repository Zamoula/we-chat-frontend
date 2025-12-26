import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ThemeService, THEMES } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  isDarkMode: boolean;
  themes = Object.keys(THEMES);
  currentTheme: string;

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    this.currentTheme = this.themeService.getStoredTheme();
    this.isDarkMode = this.themeService.isDarkMode();
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

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}
