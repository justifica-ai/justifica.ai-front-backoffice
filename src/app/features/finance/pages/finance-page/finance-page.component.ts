import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-finance-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Financeiro</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Gestão financeira em construção.</p>
  `,
})
export class FinancePageComponent {}
