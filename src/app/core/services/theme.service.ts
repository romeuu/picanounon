import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'picanounon-theme';

  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.THEME_KEY, currentTheme);
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }

  private getInitialTheme(): Theme {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.THEME_KEY) as Theme;
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark';
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }
}
