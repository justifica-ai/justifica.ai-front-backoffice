import { Routes } from '@angular/router';

export const infractionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/infractions-list-page/infractions-list-page.component').then(
        (m) => m.InfractionsListPageComponent,
      ),
  },
];
