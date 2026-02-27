import { Component, ChangeDetectionStrategy, inject, signal, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminAffiliatesService } from '../../services/admin-affiliates.service';
import {
  AdminAffiliateListItem,
  AdminAffiliatesListQuery,
  AdminPendingWithdrawalItem,
  AdminPendingWithdrawalsQuery,
  AffiliateStatus,
  Pagination,
  AFFILIATE_STATUS_LABELS,
  AFFILIATE_STATUS_COLORS,
} from '../../models/affiliate.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { APP_ROUTES } from '../../../../core/constants/app-routes';

type ActiveTab = 'affiliates' | 'withdrawals';

@Component({
  selector: 'app-affiliates-list-page',
  standalone: true,
  imports: [FormsModule, PaginationComponent, BadgeComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Afiliados</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestão de afiliados e saques</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
      <button
        type="button"
        (click)="switchTab('affiliates')"
        [class]="activeTab() === 'affiliates'
          ? 'px-4 py-2 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
          : 'px-4 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
      >
        Afiliados
      </button>
      <button
        type="button"
        (click)="switchTab('withdrawals')"
        [class]="activeTab() === 'withdrawals'
          ? 'px-4 py-2 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
          : 'px-4 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
      >
        Saques Pendentes
      </button>
    </div>

    @if (activeTab() === 'affiliates') {
      <!-- Affiliates Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label for="search" class="sr-only">Buscar</label>
            <input
              id="search"
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por nome ou e-mail..."
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label for="status-filter" class="sr-only">Status</label>
            <select
              id="status-filter"
              [ngModel]="filterStatus()"
              (ngModelChange)="onStatusChange($event)"
              class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            @for (i of skeletonRows; track i) {
              <div class="px-4 py-3 animate-pulse flex items-center gap-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              </div>
            }
          </div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar afiliados.</p>
          <button
            type="button"
            (click)="loadAffiliates()"
            class="mt-3 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      } @else {
        <!-- Affiliates Table -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Nome</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Código</th>
                  <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Comissão</th>
                  <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Ganhos</th>
                  <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Conversões</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (affiliate of affiliates(); track affiliate.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td class="px-4 py-3">
                      <div>
                        <p class="font-medium text-gray-900 dark:text-gray-100">{{ affiliate.userName }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ affiliate.userEmail }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{{ affiliate.code }}</td>
                    <td class="px-4 py-3 text-right text-gray-900 dark:text-gray-100">{{ affiliate.commissionRate }}%</td>
                    <td class="px-4 py-3 text-right text-gray-900 dark:text-gray-100">{{ formatCurrency(affiliate.totalEarnings) }}</td>
                    <td class="px-4 py-3 text-right text-gray-900 dark:text-gray-100">{{ affiliate.totalConversions }}</td>
                    <td class="px-4 py-3">
                      <app-badge [label]="getStatusLabel(affiliate.status)" [colorClass]="getStatusColor(affiliate.status)" />
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          (click)="viewAffiliate(affiliate.id)"
                          class="px-2 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                          title="Ver detalhes"
                        >
                          Ver
                        </button>
                        @if (affiliate.status === 'pending') {
                          <button
                            type="button"
                            (click)="promptApprove(affiliate)"
                            class="px-2 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded transition-colors"
                            title="Aprovar"
                          >
                            Aprovar
                          </button>
                        }
                        @if (affiliate.status === 'active') {
                          <button
                            type="button"
                            (click)="promptSuspend(affiliate)"
                            class="px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                            title="Suspender"
                          >
                            Suspender
                          </button>
                        }
                        @if (affiliate.status === 'suspended') {
                          <button
                            type="button"
                            (click)="reactivateAffiliate(affiliate)"
                            class="px-2 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded transition-colors"
                            title="Reativar"
                          >
                            Reativar
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                      Nenhum afiliado encontrado.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        @if (pagination()) {
          <div class="mt-4">
            <app-pagination [pagination]="pagination()!" (pageChange)="onPageChange($event)" />
          </div>
        }
      }
    }

    @if (activeTab() === 'withdrawals') {
      @if (withdrawalsLoading()) {
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            @for (i of skeletonRows; track i) {
              <div class="px-4 py-3 animate-pulse flex items-center gap-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            }
          </div>
        </div>
      } @else if (withdrawalsError()) {
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar saques pendentes.</p>
          <button
            type="button"
            (click)="loadPendingWithdrawals()"
            class="mt-3 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      } @else {
        <!-- Pending Withdrawals Table -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Afiliado</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Código</th>
                  <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Valor</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Chave PIX</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Solicitado em</th>
                  <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (withdrawal of pendingWithdrawals(); track withdrawal.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td class="px-4 py-3">
                      <div>
                        <p class="font-medium text-gray-900 dark:text-gray-100">{{ withdrawal.affiliateName }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ withdrawal.affiliateEmail }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{{ withdrawal.affiliateCode }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(withdrawal.amount) }}</td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs font-mono">{{ withdrawal.pixKey }}</td>
                    <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ formatDate(withdrawal.createdAt) }}</td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          (click)="promptApproveWithdrawal(withdrawal)"
                          class="px-2 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded transition-colors"
                          title="Aprovar saque"
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          (click)="promptRejectWithdrawal(withdrawal)"
                          class="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Rejeitar saque"
                        >
                          Rejeitar
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                      Nenhum saque pendente.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        @if (withdrawalsPagination()) {
          <div class="mt-4">
            <app-pagination [pagination]="withdrawalsPagination()!" (pageChange)="onWithdrawalsPageChange($event)" />
          </div>
        }
      }
    }

    <!-- Approve Affiliate -->
    <app-confirm-dialog
      #approveDialog
      title="Aprovar afiliado"
      [message]="'Deseja aprovar a solicitação de afiliado de ' + (selectedAffiliate()?.userName ?? '') + '?'"
      confirmLabel="Aprovar"
      (confirmed)="executeApprove()"
    />

    <!-- Suspend Affiliate -->
    <app-confirm-dialog
      #suspendDialog
      title="Suspender afiliado"
      [message]="'Tem certeza que deseja suspender o afiliado ' + (selectedAffiliate()?.userName ?? '') + '?'"
      confirmLabel="Suspender"
      [destructive]="true"
      (confirmed)="executeSuspend()"
    />

    <!-- Approve Withdrawal -->
    <app-confirm-dialog
      #approveWithdrawalDialog
      title="Aprovar saque"
      [message]="'Confirma aprovação do saque de ' + formatCurrency(selectedWithdrawal()?.amount ?? '0') + ' para ' + (selectedWithdrawal()?.affiliateName ?? '') + '?'"
      confirmLabel="Aprovar saque"
      (confirmed)="executeApproveWithdrawal()"
    />

    <!-- Reject Withdrawal -->
    <app-confirm-dialog
      #rejectWithdrawalDialog
      title="Rejeitar saque"
      [message]="'Tem certeza que deseja rejeitar o saque de ' + formatCurrency(selectedWithdrawal()?.amount ?? '0') + ' de ' + (selectedWithdrawal()?.affiliateName ?? '') + '? O valor retornará ao saldo disponível.'"
      confirmLabel="Rejeitar"
      [destructive]="true"
      (confirmed)="executeRejectWithdrawal()"
    />
  `,
})
export class AffiliatesListPageComponent implements OnInit {
  private readonly affiliatesService = inject(AdminAffiliatesService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  @ViewChild('approveDialog') approveDialog!: ConfirmDialogComponent;
  @ViewChild('suspendDialog') suspendDialog!: ConfirmDialogComponent;
  @ViewChild('approveWithdrawalDialog') approveWithdrawalDialog!: ConfirmDialogComponent;
  @ViewChild('rejectWithdrawalDialog') rejectWithdrawalDialog!: ConfirmDialogComponent;

  readonly activeTab = signal<ActiveTab>('affiliates');

  // Affiliates state
  readonly affiliates = signal<AdminAffiliateListItem[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly searchQuery = signal('');
  readonly filterStatus = signal('');
  readonly selectedAffiliate = signal<AdminAffiliateListItem | null>(null);

  // Withdrawals state
  readonly pendingWithdrawals = signal<AdminPendingWithdrawalItem[]>([]);
  readonly withdrawalsPagination = signal<Pagination | null>(null);
  readonly withdrawalsLoading = signal(true);
  readonly withdrawalsError = signal(false);
  readonly selectedWithdrawal = signal<AdminPendingWithdrawalItem | null>(null);

  readonly skeletonRows = [1, 2, 3, 4, 5];

  private affiliatesPage = 1;
  private withdrawalsPage = 1;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadAffiliates();
  }

  switchTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'withdrawals' && this.pendingWithdrawals().length === 0 && !this.withdrawalsError()) {
      this.loadPendingWithdrawals();
    }
  }

  // --- Affiliates ---

  loadAffiliates(): void {
    this.loading.set(true);
    this.error.set(false);

    const query: AdminAffiliatesListQuery = {
      page: this.affiliatesPage,
      limit: 20,
    };

    const q = this.searchQuery();
    if (q) {
      query.q = q;
    }

    const status = this.filterStatus();
    if (status) {
      query.status = status as AffiliateStatus;
    }

    this.affiliatesService.listAffiliates(query).subscribe({
      next: (response) => {
        this.affiliates.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.toast.error('Erro ao carregar afiliados', 'Tente novamente.');
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.affiliatesPage = 1;
      this.loadAffiliates();
    }, 400);
  }

  onStatusChange(value: string): void {
    this.filterStatus.set(value);
    this.affiliatesPage = 1;
    this.loadAffiliates();
  }

  onPageChange(page: number): void {
    this.affiliatesPage = page;
    this.loadAffiliates();
  }

  viewAffiliate(id: string): void {
    this.router.navigate([APP_ROUTES.ADMIN.AFFILIATE_DETAIL(id)]);
  }

  promptApprove(affiliate: AdminAffiliateListItem): void {
    this.selectedAffiliate.set(affiliate);
    this.approveDialog.show();
  }

  promptSuspend(affiliate: AdminAffiliateListItem): void {
    this.selectedAffiliate.set(affiliate);
    this.suspendDialog.show();
  }

  executeApprove(): void {
    const affiliate = this.selectedAffiliate();
    if (!affiliate) return;

    this.affiliatesService.updateAffiliate(affiliate.id, { status: 'active' }).subscribe({
      next: () => {
        this.toast.success('Afiliado aprovado', `${affiliate.userName} foi aprovado com sucesso.`);
        this.loadAffiliates();
      },
      error: () => {
        this.toast.error('Erro ao aprovar', 'Não foi possível aprovar o afiliado.');
      },
    });
  }

  executeSuspend(): void {
    const affiliate = this.selectedAffiliate();
    if (!affiliate) return;

    this.affiliatesService.updateAffiliate(affiliate.id, { status: 'suspended' }).subscribe({
      next: () => {
        this.toast.success('Afiliado suspenso', `${affiliate.userName} foi suspenso com sucesso.`);
        this.loadAffiliates();
      },
      error: () => {
        this.toast.error('Erro ao suspender', 'Não foi possível suspender o afiliado.');
      },
    });
  }

  reactivateAffiliate(affiliate: AdminAffiliateListItem): void {
    this.affiliatesService.updateAffiliate(affiliate.id, { status: 'active' }).subscribe({
      next: () => {
        this.toast.success('Afiliado reativado', `${affiliate.userName} foi reativado com sucesso.`);
        this.loadAffiliates();
      },
      error: () => {
        this.toast.error('Erro ao reativar', 'Não foi possível reativar o afiliado.');
      },
    });
  }

  // --- Withdrawals ---

  loadPendingWithdrawals(): void {
    this.withdrawalsLoading.set(true);
    this.withdrawalsError.set(false);

    const query: AdminPendingWithdrawalsQuery = {
      page: this.withdrawalsPage,
      limit: 20,
    };

    this.affiliatesService.listPendingWithdrawals(query).subscribe({
      next: (response) => {
        this.pendingWithdrawals.set(response.data);
        this.withdrawalsPagination.set(response.pagination);
        this.withdrawalsLoading.set(false);
      },
      error: () => {
        this.withdrawalsError.set(true);
        this.withdrawalsLoading.set(false);
        this.toast.error('Erro ao carregar saques', 'Tente novamente.');
      },
    });
  }

  onWithdrawalsPageChange(page: number): void {
    this.withdrawalsPage = page;
    this.loadPendingWithdrawals();
  }

  promptApproveWithdrawal(withdrawal: AdminPendingWithdrawalItem): void {
    this.selectedWithdrawal.set(withdrawal);
    this.approveWithdrawalDialog.show();
  }

  promptRejectWithdrawal(withdrawal: AdminPendingWithdrawalItem): void {
    this.selectedWithdrawal.set(withdrawal);
    this.rejectWithdrawalDialog.show();
  }

  executeApproveWithdrawal(): void {
    const withdrawal = this.selectedWithdrawal();
    if (!withdrawal) return;

    this.affiliatesService.processWithdrawal(withdrawal.affiliateId, withdrawal.id, { action: 'approve' }).subscribe({
      next: () => {
        this.toast.success('Saque aprovado', `Saque de ${this.formatCurrency(withdrawal.amount)} aprovado.`);
        this.loadPendingWithdrawals();
      },
      error: () => {
        this.toast.error('Erro ao aprovar saque', 'Não foi possível aprovar o saque.');
      },
    });
  }

  executeRejectWithdrawal(): void {
    const withdrawal = this.selectedWithdrawal();
    if (!withdrawal) return;

    this.affiliatesService.processWithdrawal(withdrawal.affiliateId, withdrawal.id, { action: 'reject' }).subscribe({
      next: () => {
        this.toast.success('Saque rejeitado', 'O valor retornou ao saldo disponível do afiliado.');
        this.loadPendingWithdrawals();
      },
      error: () => {
        this.toast.error('Erro ao rejeitar saque', 'Não foi possível rejeitar o saque.');
      },
    });
  }

  // --- Helpers ---

  getStatusLabel(status: string): string {
    return AFFILIATE_STATUS_LABELS[status as AffiliateStatus] ?? status;
  }

  getStatusColor(status: string): string {
    return AFFILIATE_STATUS_COLORS[status as AffiliateStatus] ?? '';
  }

  formatCurrency(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
