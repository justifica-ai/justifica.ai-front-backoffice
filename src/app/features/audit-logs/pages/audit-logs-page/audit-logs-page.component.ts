import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminAuditLogsService } from '../../services/admin-audit-logs.service';
import {
  AuditLogListItem,
  AuditLogDetail,
  AUDIT_ACTIONS,
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_COLORS,
  AuditAction,
} from '../../models/audit-log.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import type { Pagination } from '../../../../shared/models/pagination.model';

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [FormsModule, PaginationComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Logs de Auditoria</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Rastreie todas as ações realizadas na plataforma.
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <!-- Action filter -->
          <div>
            <label for="filter-action" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Ação</label>
            <select
              id="filter-action"
              class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              [ngModel]="filterAction()"
              (ngModelChange)="onActionFilterChange($event)"
            >
              <option value="">Todas</option>
              @for (action of auditActions; track action) {
                <option [value]="action">{{ getActionLabel(action) }}</option>
              }
            </select>
          </div>

          <!-- Resource type filter -->
          <div>
            <label for="filter-resource" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Recurso</label>
            <input
              id="filter-resource"
              type="text"
              placeholder="Ex: vehicle, profile"
              class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              [ngModel]="filterResourceType()"
              (ngModelChange)="onResourceTypeChange($event)"
            />
          </div>

          <!-- From date -->
          <div>
            <label for="filter-from" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">De</label>
            <input
              id="filter-from"
              type="date"
              class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              [ngModel]="filterFrom()"
              (ngModelChange)="onFromChange($event)"
            />
          </div>

          <!-- To date -->
          <div>
            <label for="filter-to" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Até</label>
            <input
              id="filter-to"
              type="date"
              class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              [ngModel]="filterTo()"
              (ngModelChange)="onToChange($event)"
            />
          </div>

          <!-- Clear filters -->
          <div class="flex items-end">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              (click)="clearFilters()"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div class="animate-pulse divide-y divide-gray-100 dark:divide-gray-700">
            @for (s of skeletonRows; track s) {
              <div class="flex items-center gap-4 px-6 py-4">
                <div class="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div class="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div class="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div class="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
          <button
            type="button"
            class="mt-3 text-sm font-medium text-red-600 underline hover:text-red-700 dark:text-red-400"
            (click)="loadLogs()"
          >
            Tentar novamente
          </button>
        </div>
      }

      <!-- Table -->
      @if (!loading() && !error()) {
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                <tr>
                  <th class="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Data/Hora</th>
                  <th class="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Ação</th>
                  <th class="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Recurso</th>
                  <th class="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">ID Recurso</th>
                  <th class="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Usuário</th>
                  <th class="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">IP</th>
                  <th class="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Detalhes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                @for (log of logs(); track log.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td class="whitespace-nowrap px-6 py-3 text-gray-600 dark:text-gray-400">
                      {{ formatDate(log.createdAt) }}
                    </td>
                    <td class="px-6 py-3">
                      <app-badge [label]="getActionLabel(log.action)" [colorClass]="getActionColor(log.action)"></app-badge>
                    </td>
                    <td class="px-6 py-3 text-gray-700 dark:text-gray-300">{{ log.resourceType }}</td>
                    <td class="px-6 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {{ log.resourceId ? truncateId(log.resourceId) : '—' }}
                    </td>
                    <td class="px-6 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {{ log.userId ? truncateId(log.userId) : '—' }}
                    </td>
                    <td class="whitespace-nowrap px-6 py-3 text-gray-500 dark:text-gray-400">
                      {{ log.ipAddress ?? '—' }}
                    </td>
                    <td class="px-6 py-3">
                      <button
                        type="button"
                        class="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        (click)="toggleDetail(log.id)"
                      >
                        {{ expandedLogId() === log.id ? 'Fechar' : 'Ver' }}
                      </button>
                    </td>
                  </tr>
                  @if (expandedLogId() === log.id) {
                    <tr>
                      <td colspan="7" class="bg-gray-50 px-6 py-4 dark:bg-gray-900/30">
                        @if (detailLoading()) {
                          <div class="flex items-center gap-2 text-sm text-gray-500">
                            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></span>
                            Carregando detalhes...
                          </div>
                        } @else if (detailError()) {
                          <p class="text-sm text-red-500">{{ detailError() }}</p>
                        } @else if (logDetail()) {
                          <div class="space-y-3">
                            <!-- User Agent -->
                            @if (logDetail()!.userAgent) {
                              <div>
                                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">User Agent:</span>
                                <p class="mt-0.5 text-xs text-gray-600 dark:text-gray-400 break-all">{{ logDetail()!.userAgent }}</p>
                              </div>
                            }

                            <!-- Changes / Diff -->
                            @if (logDetail()!.changes) {
                              <div>
                                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Alterações:</span>
                                <pre class="mt-1 overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">{{ formatChanges(logDetail()!.changes) }}</pre>
                              </div>
                            }

                            <!-- Metadata -->
                            @if (logDetail()!.metadata) {
                              <div>
                                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Metadados:</span>
                                <pre class="mt-1 overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">{{ formatChanges(logDetail()!.metadata) }}</pre>
                              </div>
                            }

                            @if (!logDetail()!.changes && !logDetail()!.metadata && !logDetail()!.userAgent) {
                              <p class="text-sm text-gray-500">Nenhum detalhe adicional disponível.</p>
                            }
                          </div>
                        }
                      </td>
                    </tr>
                  }
                } @empty {
                  <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      Nenhum log encontrado para os filtros selecionados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (pagination()) {
            <app-pagination
              [pagination]="pagination()!"
              (pageChange)="onPageChange($event)"
            ></app-pagination>
          }
        </div>
      }
    </div>
  `,
})
export class AuditLogsPageComponent implements OnInit {
  private readonly auditLogsService = inject(AdminAuditLogsService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly logs = signal<AuditLogListItem[]>([]);
  readonly pagination = signal<Pagination | null>(null);

  readonly filterAction = signal<string>('');
  readonly filterResourceType = signal<string>('');
  readonly filterFrom = signal<string>('');
  readonly filterTo = signal<string>('');

  readonly expandedLogId = signal<string | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly logDetail = signal<AuditLogDetail | null>(null);

  readonly auditActions = AUDIT_ACTIONS;
  readonly skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8];

  private currentPage = 1;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: Record<string, string | number> = {
      page: this.currentPage,
      limit: 20,
    };

    const action = this.filterAction();
    if (action) {
      query['action'] = action;
    }
    const resourceType = this.filterResourceType();
    if (resourceType) {
      query['resourceType'] = resourceType;
    }
    const from = this.filterFrom();
    if (from) {
      query['from'] = `${from}T00:00:00.000Z`;
    }
    const to = this.filterTo();
    if (to) {
      query['to'] = `${to}T23:59:59.999Z`;
    }

    this.auditLogsService.listLogs(query as unknown as import('../../models/audit-log.model').AdminAuditLogsListQuery).subscribe({
      next: (response) => {
        this.logs.set([...response.data]);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os logs. Verifique sua conexão.');
        this.loading.set(false);
      },
    });
  }

  onActionFilterChange(value: string): void {
    this.filterAction.set(value);
    this.currentPage = 1;
    this.loadLogs();
  }

  onResourceTypeChange(value: string): void {
    this.filterResourceType.set(value);
    this.currentPage = 1;
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => this.loadLogs(), 400);
  }

  onFromChange(value: string): void {
    this.filterFrom.set(value);
    this.currentPage = 1;
    this.loadLogs();
  }

  onToChange(value: string): void {
    this.filterTo.set(value);
    this.currentPage = 1;
    this.loadLogs();
  }

  clearFilters(): void {
    this.filterAction.set('');
    this.filterResourceType.set('');
    this.filterFrom.set('');
    this.filterTo.set('');
    this.currentPage = 1;
    this.loadLogs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  toggleDetail(logId: string): void {
    if (this.expandedLogId() === logId) {
      this.expandedLogId.set(null);
      this.logDetail.set(null);
      this.detailError.set(null);
      return;
    }

    this.expandedLogId.set(logId);
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.logDetail.set(null);

    this.auditLogsService.getLogById(logId).subscribe({
      next: (detail) => {
        this.logDetail.set(detail);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailError.set('Erro ao carregar detalhes do log.');
        this.detailLoading.set(false);
      },
    });
  }

  getActionLabel(action: string): string {
    return AUDIT_ACTION_LABELS[action] ?? action;
  }

  getActionColor(action: string): string {
    return AUDIT_ACTION_COLORS[action] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  truncateId(id: string): string {
    if (id.length <= 12) {
      return id;
    }
    return id.substring(0, 8) + '…';
  }

  formatChanges(data: unknown): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }
}
