import { Routes } from '@angular/router';

export const appealsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/appeals-list-page/appeals-list-page.component').then(
        (m) => m.AppealsListPageComponent,
      ),
  },
];
