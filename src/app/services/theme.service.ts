import { Injectable } from '@angular/core';

export interface ThemeColors {
  primary: string;
  secondary: string;
  primaryRgb: string;
}

export const THEMES: Record<string, ThemeColors> = {
  default: {
    primary: '#6366f1',
    secondary: '#a855f7',
    primaryRgb: '99, 102, 241'
  },
  ocean: {
    primary: '#06b6d4',
    secondary: '#10b981',
    primaryRgb: '6, 182, 212'
  }
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeKey = 'app_theme';
  private darkModeKey = 'app_dark_mode';

  constructor() {
    this.applyTheme(this.getStoredTheme());
    this.applyDarkMode(this.isDarkMode());
  }

  getStoredTheme(): string {
    const stored = localStorage.getItem(this.currentThemeKey);
    return (stored && THEMES[stored]) ? stored : 'default';
  }

  isDarkMode(): boolean {
    const stored = localStorage.getItem(this.darkModeKey);
    return stored === null ? true : stored === 'true'; // Default to dark mode
  }

  setTheme(themeName: string) {
    if (THEMES[themeName]) {
      localStorage.setItem(this.currentThemeKey, themeName);
      this.applyTheme(themeName);
    }
  }

  setDarkMode(isDark: boolean) {
    localStorage.setItem(this.darkModeKey, isDark.toString());
    this.applyDarkMode(isDark);
  }

  private applyTheme(themeName: string) {
    const theme = THEMES[themeName] || THEMES['default'];
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--primary-rgb', theme.primaryRgb);
  }

  private applyDarkMode(isDark: boolean) {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    }
  }
}
