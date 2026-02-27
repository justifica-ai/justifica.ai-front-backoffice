import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../constants/app-routes';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoading()) {
    return true;
  }

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([APP_ROUTES.AUTH.LOGIN]);
};
