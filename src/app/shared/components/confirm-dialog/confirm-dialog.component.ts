import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 transition-opacity"
          (click)="cancel()"
          (keydown.escape)="cancel()"
          role="presentation"
        ></div>
        <!-- Dialog -->
        <div
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          role="alertdialog"
          [attr.aria-labelledby]="'confirm-title'"
          [attr.aria-describedby]="'confirm-desc'"
        >
          <h3 id="confirm-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ title() }}
          </h3>
          <p id="confirm-desc" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ message() }}
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              (click)="cancel()"
              class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="confirm()"
              [class]="destructive()
                ? 'px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors'
                : 'px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors'"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly title = input<string>('Confirmar ação');
  readonly message = input<string>('Tem certeza que deseja continuar?');
  readonly confirmLabel = input<string>('Confirmar');
  readonly destructive = input<boolean>(false);
  readonly open = signal(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  show(): void {
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }

  confirm(): void {
    this.open.set(false);
    this.confirmed.emit();
  }

  cancel(): void {
    this.open.set(false);
    this.cancelled.emit();
  }
}
