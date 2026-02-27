import { Routes } from '@angular/router';

export const couponsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/coupons-page/coupons-page.component').then(
        (m) => m.CouponsPageComponent,
      ),
  },
];
