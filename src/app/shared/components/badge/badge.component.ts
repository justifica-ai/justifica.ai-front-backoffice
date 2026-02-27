import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + colorClass()">
      {{ label() }}
    </span>
  `,
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly colorClass = input<string>('bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300');
}
