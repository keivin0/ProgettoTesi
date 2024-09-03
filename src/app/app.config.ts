import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

// app.config.ts
import { Routes } from '@angular/router'; // Assicurati di importare Routes correttamente
import { routes } from './app-routing.module'; // Importa correttamente 'routes' da app.routes.ts

// Usa 'routes' come necessario nel tuo codice

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ],
};
