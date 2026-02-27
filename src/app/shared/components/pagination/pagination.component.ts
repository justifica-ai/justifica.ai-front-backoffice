import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Pagination } from '../../models/pagination.model';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pagination(); as p) {
      @if (p.totalPages > 1) {
        <nav class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4" aria-label="Paginação">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {{ startItem() }} a {{ endItem() }} de {{ p.total }} resultados
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              [disabled]="p.page <= 1"
              (click)="goToPage(p.page - 1)"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              aria-label="Página anterior"
            >
              ←
            </button>
            @for (page of visiblePages(); track page) {
              @if (page === -1) {
                <span class="px-2 py-1 text-sm text-gray-400">...</span>
              } @else {
                <button
                  type="button"
                  (click)="goToPage(page)"
                  [class]="page === p.page
                    ? 'px-3 py-1.5 text-sm font-medium rounded-md bg-brand-600 text-white'
                    : 'px-3 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'"
                  [attr.aria-current]="page === p.page ? 'page' : null"
                  [attr.aria-label]="'Página ' + page"
                >
                  {{ page }}
                </button>
              }
            }
            <button
              type="button"
              [disabled]="p.page >= p.totalPages"
              (click)="goToPage(p.page + 1)"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              aria-label="Próxima página"
            >
              →
            </button>
          </div>
        </nav>
      }
    }
  `,
})
export class PaginationComponent {
  readonly pagination = input.required<Pagination>();
  readonly pageChange = output<number>();

  goToPage(page: number): void {
    const p = this.pagination();
    if (page >= 1 && page <= p.totalPages && page !== p.page) {
      this.pageChange.emit(page);
    }
  }

  startItem(): number {
    const p = this.pagination();
    return (p.page - 1) * p.limit + 1;
  }

  endItem(): number {
    const p = this.pagination();
    return Math.min(p.page * p.limit, p.total);
  }

  visiblePages(): number[] {
    const p = this.pagination();
    const total = p.totalPages;
    const current = p.page;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [1];

    if (current > 3) {
      pages.push(-1); // ellipsis
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push(-1); // ellipsis
    }

    pages.push(total);

    return pages;
  }
}
