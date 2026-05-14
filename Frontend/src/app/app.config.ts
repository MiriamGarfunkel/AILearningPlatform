import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // וודאי שיש סוגריים מסולסלים
import { provideHttpClient } from '@angular/common/http'; // חשוב מאוד בשביל ה-API!

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};