import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routing').then((m) => m.authRoutes),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'patient',
        canActivate: [authGuard],
        data: {
          menu: {
            label: 'Pacientes',
            icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            order: 3,
          },
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/patient/patient.component').then(
                (m) => m.PatientComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/patient/patient-detail/patient-detail.component'
              ).then((m) => m.PatientDetailComponent),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import(
                './features/patient/patient-detail/patient-detail.component'
              ).then((m) => m.PatientDetailComponent),
          },
        ],
      },
      {
        path: 'reminder',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reminder/reminder.component').then(
            (m) => m.ReminderComponent
          ),
        data: {
          menu: {
            label: 'Recordatorios',
            icon: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
            order: 3,
          },
        },
      },
      {
        path: 'calendar',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/calendar/calendar.component').then(
            (m) => m.CalendarComponent
          ),
        data: {
          menu: {
            label: 'Calendario',
            icon: 'M8 2v2m8-2v2M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
            order: 2,
          },
        },
      },
      {
        path: 'sessions',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/session/session.component').then(
            (m) => m.SessionComponent
          ),
        data: {
          menu: {
            label: 'Sesiones',
            icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
            order: 4,
          },
        },
      },
      {
        path: 'billing',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/billing/billing.component').then(
            (m) => m.BillingComponent
          ),
        data: {
          menu: {
            label: 'Facturación',
            icon: 'M21 15.999h-3M21 15.999v-3M21 15.999l-4-4M3 8.999h3M3 8.999v3M3 8.999l4 4M12 2.999c-1.5 0-3 1.69-3 3.5s1.5 3.5 3 3.5 3-1.69 3-3.5-1.5-3.5-3-3.5z',
            order: 5,
          },
        },
      },
      {
        path: 'clinics',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/clinics/clinics.component').then(
            (m) => m.ClinicsComponent
          ),
        data: {
          menu: {
            label: 'Clínicas',
            icon: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
            order: 7,
          },
        },
      },
      {
        path: 'configuration',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/configuration/configuration.component').then(
            (m) => m.ConfigurationComponent
          ),
        data: {
          menu: {
            label: 'Configuración',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
            order: 8,
          },
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'calendar',
  },
];
