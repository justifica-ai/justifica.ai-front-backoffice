import { Routes } from '@angular/router';

export const aiRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/ai-page/ai-page.component').then((m) => m.AiPageComponent),
  },
];
