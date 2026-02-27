import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/users-list-page/users-list-page.component').then(
        (m) => m.UsersListPageComponent,
      ),
  },
];
