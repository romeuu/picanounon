import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { routes } from './app.routes';

registerLocaleData(localeEs);
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withXhr(), withInterceptors([loadingInterceptor])),
  ],
};

