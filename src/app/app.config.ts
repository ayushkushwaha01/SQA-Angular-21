// import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
// import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

// import { routes } from './app.routes';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { OverlayContainer } from '@angular/cdk/overlay';
// import { CustomOverlayContainer } from './theme/utils/custom-overlay-container';
// import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { UsersData } from '@data/users-data';
// import { provideHttpClient, withFetch } from '@angular/common/http';
// import { CalendarModule, DateAdapter } from 'angular-calendar';
// import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// export const appConfig: ApplicationConfig = {
//   providers: [
//      provideRouter(
//       routes,
//       withPreloading(PreloadAllModules),  
//     ),
//     provideAnimationsAsync(),
//     provideHttpClient(),
//     importProvidersFrom(InMemoryWebApiModule.forRoot(UsersData, { delay: 1000 })),
//     importProvidersFrom(CalendarModule.forRoot({
//       provide: DateAdapter,
//       useFactory: adapterFactory
//     })),
//     { provide: OverlayContainer, useClass: CustomOverlayContainer },
//   ]
// };



import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AuthInterceptor } from './shared/auth.interceptor';
import { CustomOverlayContainer } from './theme/utils/custom-overlay-container';
 
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; 
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),  // comment this line for enable lazy-loading
      withHashLocation()
    ),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    
    // 🔥 1. Added withInterceptorsFromDi() so your Error Interceptor can work later!
    provideHttpClient(withInterceptorsFromDi()), 
    
    // 🔥 2. REMOVED the InMemoryWebApiModule so real API calls can go through!
    // importProvidersFrom(InMemoryWebApiModule.forRoot(UsersData, { delay: 1000 })),
    
    importProvidersFrom(CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })),
    { provide: OverlayContainer, useClass: CustomOverlayContainer },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ]
};