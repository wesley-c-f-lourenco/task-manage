import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PerfilService } from '../services/perfil.service';

export const perfilGuard: CanActivateFn = () => {
  const perfilService = inject(PerfilService);
  const router = inject(Router);

  if (perfilService.temPerfil()) {
    return true;
  }
  return router.createUrlTree(['/perfil']);
};