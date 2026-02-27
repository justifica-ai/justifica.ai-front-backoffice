import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ label() }}</span>
        @if (variationPercent() !== null && variationPercent() !== undefined) {
          <span
            class="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
            [class]="variationPercent()! >= 0
              ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
          >
            @if (variationPercent()! >= 0) {
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            }
            {{ formatVariation(variationPercent()!) }}
          </span>
        }
      </div>
      <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ value() }}</p>
      @if (subtitle()) {
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ subtitle() }}</p>
      }
    </div>
  `,
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly variationPercent = input<number | null>(null);
  readonly subtitle = input<string>('');

  formatVariation(percent: number): string {
    const abs = Math.abs(percent);
    return `${abs.toFixed(1)}%`;
  }
}
