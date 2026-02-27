import { Routes } from '@angular/router';

export const affiliatesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/affiliates-page/affiliates-page.component').then(
        (m) => m.AffiliatesPageComponent,
      ),
  },
];
