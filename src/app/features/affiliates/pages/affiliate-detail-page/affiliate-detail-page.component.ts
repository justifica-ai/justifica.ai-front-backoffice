import { Component, ChangeDetectionStrategy, inject, signal, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminAffiliatesService } from '../../services/admin-affiliates.service';
import {
  AdminAffiliateDetail,
  AffiliateStatus,
  WithdrawalStatus,
  AFFILIATE_STATUS_LABELS,
  AFFILIATE_STATUS_COLORS,
  WITHDRAWAL_STATUS_LABELS,
  WITHDRAWAL_STATUS_COLORS,
} from '../../models/affiliate.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { APP_ROUTES } from '../../../../core/constants/app-routes';

@Component({
  selector: 'app-affiliate-detail-page',
  standalone: true,
  imports: [FormsModule, BadgeComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Back Button -->
    <div class="mb-6">
      <button
        type="button"
        (click)="goBack()"
        class="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 mb-3 inline-flex items-center gap-1"
      >
        ← Voltar para Afiliados
      </button>

      @if (loading()) {
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar dados do afiliado.</p>
          <button
            type="button"
            (click)="loadAffiliate()"
            class="mt-3 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      } @else if (affiliate()) {
        <!-- Header with actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ affiliate()!.userName }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ affiliate()!.userEmail }} · Código: <span class="font-mono">{{ affiliate()!.code }}</span></p>
          </div>
          <div class="flex items-center gap-2">
            <app-badge [label]="getStatusLabel(affiliate()!.status)" [colorClass]="getStatusColor(affiliate()!.status)" />
            @if (affiliate()!.status === 'pending') {
              <button
                type="button"
                (click)="approveDialog.show()"
                class="px-3 py-1.5 text-xs font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
              >
                Aprovar
              </button>
            }
            @if (affiliate()!.status === 'active') {
              <button
                type="button"
                (click)="suspendDialog.show()"
                class="px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                Suspender
              </button>
            }
            @if (affiliate()!.status === 'suspended') {
              <button
                type="button"
                (click)="reactivate()"
                class="px-3 py-1.5 text-xs font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
              >
                Reativar
              </button>
            }
          </div>
        </div>

        <!-- Metrics KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Cliques</p>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ affiliate()!.metrics.totalClicks }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Conversões</p>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ affiliate()!.metrics.totalConversions }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Taxa de Conversão</p>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ affiliate()!.metrics.conversionRate }}%</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Total de Saques</p>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ affiliate()!.metrics.totalWithdrawals }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Saques Pendentes</p>
            <p class="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{{ affiliate()!.metrics.pendingWithdrawals }}</p>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <!-- Affiliate Data -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Dados do Afiliado</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Nome</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ affiliate()!.userName }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">E-mail</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ affiliate()!.userEmail }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Código</dt>
                <dd class="text-sm font-medium font-mono text-gray-900 dark:text-gray-100">{{ affiliate()!.code }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Chave PIX</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ affiliate()!.pixKey ?? 'Não informada' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Ativado em</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ affiliate()!.activatedAt ? formatDate(affiliate()!.activatedAt!) : 'Não ativado' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Cadastro</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatDate(affiliate()!.createdAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Financial Data + Commission Editor -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Financeiro</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Total Ganho</dt>
                <dd class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(affiliate()!.totalEarnings) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Saldo Pendente</dt>
                <dd class="text-sm font-medium text-amber-600 dark:text-amber-400">{{ formatCurrency(affiliate()!.pendingBalance) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Saldo Disponível</dt>
                <dd class="text-sm font-semibold text-accent-600 dark:text-accent-400">{{ formatCurrency(affiliate()!.availableBalance) }}</dd>
              </div>
            </dl>

            <!-- Commission Editor -->
            <div class="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label for="commission-rate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Taxa de Comissão (%)
              </label>
              <div class="flex items-center gap-2">
                <input
                  id="commission-rate"
                  type="number"
                  [ngModel]="commissionRate()"
                  (ngModelChange)="commissionRate.set($event)"
                  [min]="0"
                  [max]="100"
                  step="0.01"
                  class="w-24 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">%</span>
                <button
                  type="button"
                  (click)="saveCommission()"
                  [disabled]="savingCommission()"
                  class="px-3 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  {{ savingCommission() ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Conversions -->
        <div class="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Conversões Recentes</h2>
          @if (affiliate()!.recentConversions.length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Data</th>
                    <th class="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Comissão</th>
                    <th class="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Pago</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  @for (conversion of affiliate()!.recentConversions; track conversion.id) {
                    <tr>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-300">{{ formatDate(conversion.createdAt) }}</td>
                      <td class="px-4 py-2 text-right font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(conversion.commissionAmount) }}</td>
                      <td class="px-4 py-2">
                        <app-badge
                          [label]="conversion.isPaid ? 'Sim' : 'Não'"
                          [colorClass]="conversion.isPaid ? 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'"
                        />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-sm text-gray-400 dark:text-gray-500">Nenhuma conversão recente.</p>
          }
        </div>

        <!-- Recent Withdrawals -->
        <div class="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Saques Recentes</h2>
          @if (affiliate()!.recentWithdrawals.length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Data</th>
                    <th class="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Valor</th>
                    <th class="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Chave PIX</th>
                    <th class="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  @for (withdrawal of affiliate()!.recentWithdrawals; track withdrawal.id) {
                    <tr>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-300">{{ formatDate(withdrawal.createdAt) }}</td>
                      <td class="px-4 py-2 text-right font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(withdrawal.amount) }}</td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-300 font-mono text-xs">{{ withdrawal.pixKey }}</td>
                      <td class="px-4 py-2">
                        <app-badge [label]="getWithdrawalStatusLabel(withdrawal.status)" [colorClass]="getWithdrawalStatusColor(withdrawal.status)" />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-sm text-gray-400 dark:text-gray-500">Nenhum saque recente.</p>
          }
        </div>
      }
    </div>

    <!-- Approve Confirmation -->
    <app-confirm-dialog
      #approveDialog
      title="Aprovar afiliado"
      [message]="'Deseja aprovar a solicitação de afiliado de ' + (affiliate()?.userName ?? '') + '?'"
      confirmLabel="Aprovar"
      (confirmed)="executeApprove()"
    />

    <!-- Suspend Confirmation -->
    <app-confirm-dialog
      #suspendDialog
      title="Suspender afiliado"
      [message]="'Tem certeza que deseja suspender o afiliado ' + (affiliate()?.userName ?? '') + '?'"
      confirmLabel="Suspender"
      [destructive]="true"
      (confirmed)="executeSuspend()"
    />
  `,
})
export class AffiliateDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly affiliatesService = inject(AdminAffiliatesService);
  private readonly toast = inject(ToastService);

  @ViewChild('approveDialog') approveDialog!: ConfirmDialogComponent;
  @ViewChild('suspendDialog') suspendDialog!: ConfirmDialogComponent;

  readonly affiliate = signal<AdminAffiliateDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly commissionRate = signal<number>(0);
  readonly savingCommission = signal(false);
  private affiliateId = '';

  ngOnInit(): void {
    this.affiliateId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.affiliateId) {
      this.loadAffiliate();
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  loadAffiliate(): void {
    this.loading.set(true);
    this.error.set(false);

    this.affiliatesService.getAffiliateById(this.affiliateId).subscribe({
      next: (data) => {
        this.affiliate.set(data);
        this.commissionRate.set(parseFloat(data.commissionRate) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.toast.error('Erro ao carregar afiliado', 'Afiliado não encontrado ou erro de rede.');
      },
    });
  }

  goBack(): void {
    this.router.navigate([APP_ROUTES.ADMIN.AFFILIATES]);
  }

  executeApprove(): void {
    this.affiliatesService.updateAffiliate(this.affiliateId, { status: 'active' }).subscribe({
      next: () => {
        this.toast.success('Afiliado aprovado');
        this.loadAffiliate();
      },
      error: () => {
        this.toast.error('Erro ao aprovar afiliado');
      },
    });
  }

  executeSuspend(): void {
    this.affiliatesService.updateAffiliate(this.affiliateId, { status: 'suspended' }).subscribe({
      next: () => {
        this.toast.success('Afiliado suspenso');
        this.loadAffiliate();
      },
      error: () => {
        this.toast.error('Erro ao suspender afiliado');
      },
    });
  }

  reactivate(): void {
    this.affiliatesService.updateAffiliate(this.affiliateId, { status: 'active' }).subscribe({
      next: () => {
        this.toast.success('Afiliado reativado');
        this.loadAffiliate();
      },
      error: () => {
        this.toast.error('Erro ao reativar afiliado');
      },
    });
  }

  saveCommission(): void {
    const rate = this.commissionRate();
    if (rate < 0 || rate > 100) {
      this.toast.warning('Valor inválido', 'A comissão deve estar entre 0 e 100%.');
      return;
    }

    this.savingCommission.set(true);
    this.affiliatesService.updateAffiliate(this.affiliateId, { commissionRate: rate }).subscribe({
      next: () => {
        this.savingCommission.set(false);
        this.toast.success('Comissão atualizada', `Nova taxa: ${rate}%`);
        this.loadAffiliate();
      },
      error: () => {
        this.savingCommission.set(false);
        this.toast.error('Erro ao salvar comissão', 'Não foi possível atualizar a taxa de comissão.');
      },
    });
  }

  getStatusLabel(status: string): string {
    return AFFILIATE_STATUS_LABELS[status as AffiliateStatus] ?? status;
  }

  getStatusColor(status: string): string {
    return AFFILIATE_STATUS_COLORS[status as AffiliateStatus] ?? '';
  }

  getWithdrawalStatusLabel(status: string): string {
    return WITHDRAWAL_STATUS_LABELS[status as WithdrawalStatus] ?? status;
  }

  getWithdrawalStatusColor(status: string): string {
    return WITHDRAWAL_STATUS_COLORS[status as WithdrawalStatus] ?? '';
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
