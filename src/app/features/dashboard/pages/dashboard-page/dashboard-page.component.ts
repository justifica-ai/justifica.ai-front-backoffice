import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Dashboard</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Visão geral do sistema em construção.</p>
  `,
})
export class DashboardPageComponent {}
