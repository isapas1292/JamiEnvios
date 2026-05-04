import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: number[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getCurrentUser();

    if (user && user.rol_id && allowedRoles.includes(user.rol_id)) {
      return true;
    }

    // Si no está autenticado o no tiene el rol, redirigir al inicio o a login
    if (!user) {
      return router.parseUrl('/login');
    }
    return router.parseUrl('/');
  };
};
