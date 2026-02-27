import { Routes } from '@angular/router';

export const financeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/finance-page/finance-page.component').then(
        (m) => m.FinancePageComponent,
      ),
  },
];
