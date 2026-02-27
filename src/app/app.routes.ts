import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ═══════ Auth (público) ═══════
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // ═══════ Admin (autenticado + role admin/super_admin) ═══════
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'appeals',
        loadChildren: () =>
          import('./features/appeals/appeals.routes').then((m) => m.appealsRoutes),
      },
      {
        path: 'finance',
        loadChildren: () =>
          import('./features/finance/finance.routes').then((m) => m.financeRoutes),
      },
      {
        path: 'infractions',
        loadChildren: () =>
          import('./features/infractions/infractions.routes').then((m) => m.infractionsRoutes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.settingsRoutes),
      },
      {
        path: 'audit-logs',
        loadChildren: () =>
          import('./features/audit-logs/audit-logs.routes').then((m) => m.auditLogsRoutes),
      },
      {
        path: 'ai',
        loadChildren: () =>
          import('./features/ai/ai.routes').then((m) => m.aiRoutes),
      },
      {
        path: 'affiliates',
        loadChildren: () =>
          import('./features/affiliates/affiliates.routes').then((m) => m.affiliatesRoutes),
      },
      {
        path: 'coupons',
        loadChildren: () =>
          import('./features/coupons/coupons.routes').then((m) => m.couponsRoutes),
      },
    ],
  },

  // ═══════ Fallback ═══════
  { path: '**', redirectTo: '' },
];
