import { Routes } from '@angular/router';

export const auditLogsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/audit-logs-page/audit-logs-page.component').then(
        (m) => m.AuditLogsPageComponent,
      ),
  },
];
