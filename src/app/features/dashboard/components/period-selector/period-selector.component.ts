import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';

export type PeriodValue = '7d' | '30d' | '90d';

const PERIOD_OPTIONS: { label: string; value: PeriodValue }[] = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
];

@Component({
  selector: 'app-period-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1" role="radiogroup" aria-label="Período">
      @for (option of options; track option.value) {
        <button
          type="button"
          [class]="getButtonClasses(option.value)"
          [attr.aria-checked]="selected() === option.value"
          role="radio"
          (click)="select(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class PeriodSelectorComponent {
  readonly periodChange = output<PeriodValue>();
  readonly selected = signal<PeriodValue>('30d');
  readonly options = PERIOD_OPTIONS;

  select(value: PeriodValue): void {
    this.selected.set(value);
    this.periodChange.emit(value);
  }

  getButtonClasses(value: PeriodValue): string {
    const base = 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors';
    if (this.selected() === value) {
      return `${base} bg-white dark:bg-gray-700 text-brand-700 dark:text-brand-300 shadow-sm`;
    }
    return `${base} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`;
  }
}
