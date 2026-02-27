import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminFinanceService } from '../../services/admin-finance.service';
import {
  TransactionListItem,
  AdminTransactionsListQuery,
  FinancialReportResponse,
  FinancialReportDaily,
  TransactionStatus,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_STATUS_COLORS,
} from '../../models/finance.model';
import { Pagination } from '../../../../shared/models/pagination.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-finance-page',
  standalone: true,
  imports: [FormsModule, PaginationComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Financeiro</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Visão geral financeira e transações</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Period selector for report -->
        <div class="flex items-center gap-2">
          <label for="reportFrom" class="sr-only">De</label>
          <input
            id="reportFrom"
            type="date"
            [ngModel]="reportFrom()"
            (ngModelChange)="onReportFromChange($event)"
            class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
            aria-label="Data início do relatório"
          />
          <span class="text-gray-400 text-sm">até</span>
          <label for="reportTo" class="sr-only">Até</label>
          <input
            id="reportTo"
            type="date"
            [ngModel]="reportTo()"
            (ngModelChange)="onReportToChange($event)"
            class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
            aria-label="Data fim do relatório"
          />
        </div>
        <button
          type="button"
          (click)="exportCsv()"
          [disabled]="reportLoading()"
          class="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Exportar CSV
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    @if (reportLoading() && !report()) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        @for (item of skeletonKpis; track item) {
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
        }
      </div>
    } @else if (reportError()) {
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center mb-6">
        <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar relatório financeiro.</p>
        <button
          type="button"
          (click)="loadReport()"
          class="mt-3 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    } @else if (report()) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Receita Bruta</p>
          <p class="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{{ formatCurrency(report()!.summary.totalGross) }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ report()!.summary.transactionCount }} transações</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Descontos</p>
          <p class="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">{{ formatCurrency(totalDiscounts()) }}</p>
          <p class="text-xs text-gray-400 mt-1">Cupons + Volume</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Taxas PSP</p>
          <p class="mt-1 text-xl font-bold text-red-600 dark:text-red-400">{{ formatCurrency(report()!.summary.totalPspFees) }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ report()!.summary.refundedCount }} reembolsos</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Receita Líquida</p>
          <p class="mt-1 text-xl font-bold text-accent-600 dark:text-accent-400">{{ formatCurrency(report()!.summary.totalNet) }}</p>
          <p class="text-xs text-gray-400 mt-1">Ticket médio: {{ formatCurrency(report()!.summary.averageTicket) }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Comissões Afiliados</p>
          <p class="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">{{ formatCurrency(report()!.summary.totalAffiliateCommissions) }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ report()!.summary.paidCount }} pagos</p>
        </div>
      </div>

      <!-- Daily Revenue Chart -->
      @if (report()!.daily.length > 0) {
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Receita Diária</h2>
          <div class="flex items-end gap-1 h-40 overflow-x-auto">
            @for (day of report()!.daily; track day.date) {
              <div
                class="flex flex-col items-center flex-shrink-0"
                [style.width.px]="chartBarWidth()"
              >
                <div
                  class="w-full bg-brand-500 dark:bg-brand-400 rounded-t transition-all hover:bg-brand-600 dark:hover:bg-brand-300"
                  [style.height.%]="getBarHeight(day)"
                  [title]="day.date + ': ' + formatCurrency(day.gross) + ' (' + day.count + ' tx)'"
                ></div>
                @if (report()!.daily.length <= 31) {
                  <span class="text-[9px] text-gray-400 mt-1 whitespace-nowrap">{{ formatShortDate(day.date) }}</span>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- By Status Summary -->
      @if (report()!.byStatus.length > 0) {
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Por Status</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            @for (item of report()!.byStatus; track item.status) {
              <div class="flex items-center gap-2">
                <app-badge [label]="getStatusLabel(item.status)" [colorClass]="getStatusColor(item.status)" />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.count }} — {{ formatCurrency(item.amount) }}</span>
              </div>
            }
          </div>
        </div>
      }
    }

    <!-- Transactions Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <!-- Filters -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label for="txSearch" class="sr-only">Buscar</label>
            <input
              id="txSearch"
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por txid, nome ou e-mail..."
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label for="txStatus" class="sr-only">Status</label>
            <select
              id="txStatus"
              [ngModel]="filterStatus()"
              (ngModelChange)="onStatusChange($event)"
              class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="processing">Processando</option>
              <option value="paid">Pago</option>
              <option value="failed">Falha</option>
              <option value="refunded">Reembolsado</option>
              <option value="expired">Expirado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div class="flex gap-2">
            <label for="txFrom" class="sr-only">De</label>
            <input
              id="txFrom"
              type="date"
              [ngModel]="filterFrom()"
              (ngModelChange)="onFilterFromChange($event)"
              class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              aria-label="Data início filtro"
            />
            <label for="txTo" class="sr-only">Até</label>
            <input
              id="txTo"
              type="date"
              [ngModel]="filterTo()"
              (ngModelChange)="onFilterToChange($event)"
              class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              aria-label="Data fim filtro"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      @if (txLoading()) {
        <div class="p-4">
          @for (row of skeletonRows; track row) {
            <div class="animate-pulse flex gap-4 py-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 flex-1"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          }
        </div>
      } @else if (txError()) {
        <div class="p-6 text-center">
          <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar transações.</p>
          <button
            type="button"
            (click)="loadTransactions()"
            class="mt-3 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700 text-left">
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">TXID</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Usuário</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Valor Bruto</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Valor Líquido</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Data</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of transactions(); track tx.id) {
                <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{{ tx.txid ?? '—' }}</td>
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-900 dark:text-gray-100">{{ tx.userName }}</div>
                    <div class="text-xs text-gray-400">{{ tx.userEmail }}</div>
                  </td>
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(tx.amountGross) }}</td>
                  <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ formatCurrency(tx.amountNet) }}</td>
                  <td class="px-4 py-3">
                    <app-badge [label]="getStatusLabel(tx.status)" [colorClass]="getStatusColor(tx.status)" />
                  </td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ formatDate(tx.createdAt) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-gray-400">Nenhuma transação encontrada.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (txPagination()) {
          <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <app-pagination [pagination]="txPagination()!" (pageChange)="onPageChange($event)" />
          </div>
        }
      }
    </div>
  `,
})
export class FinancePageComponent implements OnInit {
  private readonly financeService = inject(AdminFinanceService);
  private readonly toast = inject(ToastService);

  // Report state
  readonly report = signal<FinancialReportResponse | null>(null);
  readonly reportLoading = signal(true);
  readonly reportError = signal(false);
  readonly reportFrom = signal(this.defaultFrom());
  readonly reportTo = signal(this.defaultTo());

  // Transactions state
  readonly transactions = signal<TransactionListItem[]>([]);
  readonly txPagination = signal<Pagination | null>(null);
  readonly txLoading = signal(true);
  readonly txError = signal(false);
  readonly searchQuery = signal('');
  readonly filterStatus = signal('');
  readonly filterFrom = signal('');
  readonly filterTo = signal('');

  readonly skeletonKpis = [1, 2, 3, 4, 5];
  readonly skeletonRows = [1, 2, 3, 4, 5];

  private currentPage = 1;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly totalDiscounts = computed(() => {
    const r = this.report();
    if (!r) return '0.00';
    const coupon = parseFloat(r.summary.totalDiscountCoupon) || 0;
    const volume = parseFloat(r.summary.totalDiscountVolume) || 0;
    return (coupon + volume).toFixed(2);
  });

  readonly maxDailyGross = computed(() => {
    const r = this.report();
    if (!r || r.daily.length === 0) return 1;
    return Math.max(...r.daily.map((d) => parseFloat(d.gross) || 0), 1);
  });

  ngOnInit(): void {
    this.loadReport();
    this.loadTransactions();
  }

  loadReport(): void {
    this.reportLoading.set(true);
    this.reportError.set(false);

    const from = this.reportFrom() + 'T00:00:00Z';
    const to = this.reportTo() + 'T23:59:59Z';

    this.financeService.getFinancialReport({ from, to }).subscribe({
      next: (data) => {
        this.report.set(data);
        this.reportLoading.set(false);
      },
      error: () => {
        this.reportError.set(true);
        this.reportLoading.set(false);
        this.toast.error('Erro ao carregar relatório', 'Tente novamente.');
      },
    });
  }

  loadTransactions(): void {
    this.txLoading.set(true);
    this.txError.set(false);

    const query: AdminTransactionsListQuery = {
      page: this.currentPage,
      limit: 20,
    };

    const q = this.searchQuery();
    if (q) query.q = q;

    const status = this.filterStatus();
    if (status) query.status = status as TransactionStatus;

    const from = this.filterFrom();
    if (from) query.from = from + 'T00:00:00Z';

    const to = this.filterTo();
    if (to) query.to = to + 'T23:59:59Z';

    this.financeService.listTransactions(query).subscribe({
      next: (response) => {
        this.transactions.set([...response.data]);
        this.txPagination.set(response.pagination);
        this.txLoading.set(false);
      },
      error: () => {
        this.txError.set(true);
        this.txLoading.set(false);
        this.toast.error('Erro ao carregar transações', 'Tente novamente.');
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadTransactions();
    }, 400);
  }

  onStatusChange(value: string): void {
    this.filterStatus.set(value);
    this.currentPage = 1;
    this.loadTransactions();
  }

  onFilterFromChange(value: string): void {
    this.filterFrom.set(value);
    this.currentPage = 1;
    this.loadTransactions();
  }

  onFilterToChange(value: string): void {
    this.filterTo.set(value);
    this.currentPage = 1;
    this.loadTransactions();
  }

  onReportFromChange(value: string): void {
    this.reportFrom.set(value);
    this.loadReport();
  }

  onReportToChange(value: string): void {
    this.reportTo.set(value);
    this.loadReport();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  exportCsv(): void {
    const from = this.reportFrom() + 'T00:00:00Z';
    const to = this.reportTo() + 'T23:59:59Z';
    this.financeService.exportReportCsv(from, to);
    this.toast.success('Exportação iniciada', 'O download começará em instantes.');
  }

  getBarHeight(day: FinancialReportDaily): number {
    const gross = parseFloat(day.gross) || 0;
    const max = this.maxDailyGross();
    return Math.max((gross / max) * 100, 2);
  }

  chartBarWidth(): number {
    const r = this.report();
    if (!r || r.daily.length === 0) return 20;
    return Math.max(Math.min(800 / r.daily.length, 40), 8);
  }

  formatCurrency(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatShortDate(dateStr: string): string {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  }

  getStatusLabel(status: string): string {
    return TRANSACTION_STATUS_LABELS[status as TransactionStatus] ?? status;
  }

  getStatusColor(status: string): string {
    return TRANSACTION_STATUS_COLORS[status as TransactionStatus] ?? '';
  }

  private defaultFrom(): string {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }

  private defaultTo(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
