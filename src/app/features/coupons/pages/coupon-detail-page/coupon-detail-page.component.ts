import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  inject,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminCouponsService } from '../../services/admin-coupons.service';
import { APP_ROUTES } from '../../../../core/constants/app-routes';
import type {
  AdminCouponDetail,
  CouponStatus,
  CouponType,
} from '../../models/coupon.model';
import {
  COUPON_STATUS_LABELS,
  COUPON_STATUS_COLORS,
  COUPON_TYPE_LABELS,
} from '../../models/coupon.model';

@Component({
  selector: 'app-coupon-detail-page',
  standalone: true,
  imports: [SlicePipe, BadgeComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Back Button + Header -->
    <div class="mb-6">
      <button
        type="button"
        (click)="goBack()"
        class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-3"
        aria-label="Voltar para lista de cupons"
      >
        ← Voltar
      </button>
      @if (coupon()) {
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 font-mono">{{ coupon()!.code }}</h1>
          <app-badge [label]="getStatusLabel(coupon()!.status)" [colorClass]="getStatusColor(coupon()!.status)" />
          @if (coupon()!.status === 'active' || coupon()!.status === 'inactive') {
            <button
              type="button"
              (click)="showToggleDialog()"
              [class]="coupon()!.status === 'active'
                ? 'text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors'
                : 'text-xs px-3 py-1.5 rounded-lg border border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors'"
              [attr.aria-label]="coupon()!.status === 'active' ? 'Desativar cupom' : 'Ativar cupom'"
            >
              {{ coupon()!.status === 'active' ? 'Desativar' : 'Ativar' }}
            </button>
          }
        </div>
      }
    </div>

    <!-- Loading -->
    @if (loading()) {
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (i of [0, 1, 2]; track i) {
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse shadow">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Error -->
    @if (error()) {
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-sm text-red-700 dark:text-red-400">{{ error() }}</p>
        <button type="button" (click)="loadCoupon()" class="mt-2 text-sm text-red-600 underline hover:text-red-800">
          Tentar novamente
        </button>
      </div>
    }

    @if (coupon(); as c) {
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total de Usos</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ c.metrics.totalUsages }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuários Únicos</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ c.metrics.uniqueUsers }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Desconto Total Concedido</p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatCurrency(c.metrics.totalDiscountGranted) }}</p>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detalhes do Cupom</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ getTypeLabel(c.type) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDetailValue(c) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Limite de Usos</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ c.maxUses ?? 'Ilimitado' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usos Atuais</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ c.currentUses }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Limite por Usuário</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ c.maxUsesPerUser }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor Mínimo</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ c.minAmount ? formatCurrency(c.minAmount) : '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Início</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(c.validFrom) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expiração</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(c.validUntil) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Apenas 1ª Compra</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ c.firstPurchaseOnly ? 'Sim' : 'Não' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipos de Recurso</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatArray(c.allowedResourceTypes) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Canais</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatArray(c.allowedChannels) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campanha UTM</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ c.utmCampaign ?? '—' }}</dd>
          </div>
          @if (c.description) {
            <div class="md:col-span-2 lg:col-span-3">
              <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descrição</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ c.description }}</dd>
            </div>
          }
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Criado em</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDateTime(c.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Atualizado em</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDateTime(c.updatedAt) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Recent Usages -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Últimos Usos</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Desconto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (usage of c.recentUsages; track usage.id) {
                <tr>
                  <td class="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{{ usage.userId | slice:0:8 }}...</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{{ formatCurrency(usage.discountAmount) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatDateTime(usage.usedAt) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum uso registrado.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Toggle Confirm Dialog -->
    <app-confirm-dialog
      #toggleDialog
      [title]="toggleDialogTitle()"
      [message]="toggleDialogMessage()"
      [confirmLabel]="toggleDialogConfirmLabel()"
      [destructive]="toggleDialogDestructive()"
      (confirmed)="confirmToggle()"
    />
  `,
})
export class CouponDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AdminCouponsService);
  private readonly toast = inject(ToastService);

  readonly coupon = signal<AdminCouponDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly toggleDialogTitle = signal('');
  readonly toggleDialogMessage = signal('');
  readonly toggleDialogConfirmLabel = signal('');
  readonly toggleDialogDestructive = signal(false);

  @ViewChild('toggleDialog') toggleDialog!: ConfirmDialogComponent;

  private couponId = '';

  ngOnInit(): void {
    this.couponId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.couponId) {
      this.loadCoupon();
    }
  }

  goBack(): void {
    this.router.navigate([APP_ROUTES.ADMIN.COUPONS]);
  }

  loadCoupon(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getCouponById(this.couponId).subscribe({
      next: (data) => {
        this.coupon.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar detalhes do cupom.');
        this.loading.set(false);
      },
    });
  }

  showToggleDialog(): void {
    const c = this.coupon();
    if (!c) return;

    if (c.status === 'active') {
      this.toggleDialogTitle.set('Desativar cupom');
      this.toggleDialogMessage.set(`Deseja desativar o cupom ${c.code}?`);
      this.toggleDialogConfirmLabel.set('Desativar');
      this.toggleDialogDestructive.set(true);
    } else {
      this.toggleDialogTitle.set('Ativar cupom');
      this.toggleDialogMessage.set(`Deseja ativar o cupom ${c.code}?`);
      this.toggleDialogConfirmLabel.set('Ativar');
      this.toggleDialogDestructive.set(false);
    }

    this.toggleDialog.show();
  }

  confirmToggle(): void {
    const c = this.coupon();
    if (!c) return;

    const newStatus = c.status === 'active' ? 'inactive' : 'active';
    this.service.updateCoupon(c.id, { status: newStatus }).subscribe({
      next: () => {
        this.toast.success(`Cupom ${c.code} ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`);
        this.loadCoupon();
      },
      error: () => {
        this.toast.error('Erro ao alterar status do cupom.');
      },
    });
  }

  // ─── Helpers ───

  getStatusLabel(status: CouponStatus): string {
    return COUPON_STATUS_LABELS[status] ?? status;
  }

  getStatusColor(status: CouponStatus): string {
    return COUPON_STATUS_COLORS[status] ?? '';
  }

  getTypeLabel(type: CouponType): string {
    return COUPON_TYPE_LABELS[type] ?? type;
  }

  formatDetailValue(coupon: AdminCouponDetail): string {
    if (coupon.type === 'percentage') {
      return `${parseFloat(coupon.value)}%`;
    }
    return `R$ ${parseFloat(coupon.value).toFixed(2).replace('.', ',')}`;
  }

  formatCurrency(value: string): string {
    return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatArray(arr: string[] | null): string {
    if (!arr || arr.length === 0) return 'Todos';
    return arr.join(', ');
  }
}
