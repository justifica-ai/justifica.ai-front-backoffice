import { Routes } from '@angular/router';

export const affiliatesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/affiliates-list-page/affiliates-list-page.component').then(
        (m) => m.AffiliatesListPageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/affiliate-detail-page/affiliate-detail-page.component').then(
        (m) => m.AffiliateDetailPageComponent,
      ),
  },
];
