import { Routes } from '@angular/router';
import { perfilGuard } from './core/guards/perfil.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'perfil',
    pathMatch: 'full',
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
  },
  {
    path: 'dashboard',
    canActivate: [perfilGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'perfil',
  },
];