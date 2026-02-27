import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  inject,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminCouponsService } from '../../services/admin-coupons.service';
import { APP_ROUTES } from '../../../../core/constants/app-routes';
import type { Pagination } from '../../../../shared/models/pagination.model';
import type {
  AdminCouponListItem,
  AdminCouponsListQuery,
  CouponStatus,
  CouponType,
} from '../../models/coupon.model';
import {
  COUPON_STATUS_LABELS,
  COUPON_STATUS_COLORS,
  COUPON_TYPE_LABELS,
} from '../../models/coupon.model';

@Component({
  selector: 'app-coupons-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent,
    BadgeComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Cupons</h1>
      <button
        type="button"
        (click)="openCreateDialog()"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        aria-label="Criar novo cupom"
      >
        + Criar Cupom
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <input
        type="text"
        [ngModel]="searchTerm()"
        (ngModelChange)="onSearchChange($event)"
        placeholder="Buscar por código..."
        class="w-64 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        aria-label="Buscar cupons"
      />
      <select
        [ngModel]="statusFilter()"
        (ngModelChange)="onStatusFilterChange($event)"
        class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        aria-label="Filtrar por status"
      >
        <option value="">Todos os status</option>
        <option value="active">Ativo</option>
        <option value="inactive">Inativo</option>
        <option value="expired">Expirado</option>
        <option value="depleted">Esgotado</option>
      </select>
      <select
        [ngModel]="typeFilter()"
        (ngModelChange)="onTypeFilterChange($event)"
        class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        aria-label="Filtrar por tipo"
      >
        <option value="">Todos os tipos</option>
        <option value="percentage">Percentual</option>
        <option value="fixed_value">Valor Fixo</option>
      </select>
    </div>

    <!-- Error State -->
    @if (error()) {
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <p class="text-sm text-red-700 dark:text-red-400">{{ error() }}</p>
        <button
          type="button"
          (click)="loadCoupons()"
          class="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:text-red-800"
        >
          Tentar novamente
        </button>
      </div>
    }

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Início</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiração</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usos</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            @if (loading()) {
              @for (i of skeletonRows; track i) {
                <tr class="animate-pulse">
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div></td>
                </tr>
              }
            } @else {
              @for (coupon of coupons(); track coupon.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" (click)="navigateToDetail(coupon.id)">
                  <td class="px-4 py-3 text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{{ coupon.code }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ getTypeLabel(coupon.type) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{{ formatValue(coupon) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatDate(coupon.validFrom) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatDate(coupon.validUntil) }}</td>
                  <td class="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{{ coupon.currentUses }}/{{ coupon.maxUses ?? '∞' }}</td>
                  <td class="px-4 py-3">
                    <app-badge [label]="getStatusLabel(coupon.status)" [colorClass]="getStatusColor(coupon.status)" />
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button
                      type="button"
                      (click)="toggleCouponStatus(coupon, $event)"
                      [class]="coupon.status === 'active'
                        ? 'text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors'
                        : 'text-xs px-2 py-1 rounded border border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors'"
                      [attr.aria-label]="coupon.status === 'active' ? 'Desativar cupom ' + coupon.code : 'Ativar cupom ' + coupon.code"
                    >
                      {{ coupon.status === 'active' ? 'Desativar' : 'Ativar' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum cupom encontrado.
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    @if (pagination()) {
      <div class="mt-4">
        <app-pagination [pagination]="pagination()!" (pageChange)="onPageChange($event)" />
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

    <!-- Create Dialog -->
    @if (showCreateDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/50"
          (click)="closeCreateDialog()"
          (keydown.escape)="closeCreateDialog()"
          role="presentation"
        ></div>
        <div
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          role="dialog"
          aria-labelledby="create-dialog-title"
        >
          <h2 id="create-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Criar Novo Cupom</h2>

          <form [formGroup]="createForm" (ngSubmit)="submitCreate()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Código -->
              <div>
                <label for="coupon-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <input
                  id="coupon-code"
                  formControlName="code"
                  type="text"
                  maxlength="20"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 uppercase focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: PROMO20"
                />
                @if (createForm.controls.code.touched && createForm.controls.code.errors) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Código deve ter 4-20 caracteres alfanuméricos</p>
                }
              </div>

              <!-- Tipo -->
              <div>
                <label for="coupon-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <select
                  id="coupon-type"
                  formControlName="type"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed_value">Valor Fixo (R$)</option>
                </select>
              </div>

              <!-- Valor -->
              <div>
                <label for="coupon-value" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <input
                  id="coupon-value"
                  formControlName="value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: 20"
                />
                @if (createForm.controls.value.touched && createForm.controls.value.errors) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Valor deve ser maior que 0</p>
                }
              </div>

              <!-- Limite de Usos -->
              <div>
                <label for="coupon-max-uses" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite de usos</label>
                <input
                  id="coupon-max-uses"
                  formControlName="maxUses"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="Ilimitado"
                />
              </div>

              <!-- Data de Início -->
              <div>
                <label for="coupon-valid-from" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de início <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <input
                  id="coupon-valid-from"
                  formControlName="validFrom"
                  type="datetime-local"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <!-- Data de Expiração -->
              <div>
                <label for="coupon-valid-until" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de expiração <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <input
                  id="coupon-valid-until"
                  formControlName="validUntil"
                  type="datetime-local"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <!-- Descrição -->
              <div class="md:col-span-2">
                <label for="coupon-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição interna</label>
                <input
                  id="coupon-description"
                  formControlName="description"
                  type="text"
                  maxlength="200"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="Nota interna sobre o cupom"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                (click)="closeCreateDialog()"
                class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="createForm.invalid || creating()"
                class="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (creating()) {
                  Criando...
                } @else {
                  Criar Cupom
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CouponsPageComponent implements OnInit {
  private readonly service = inject(AdminCouponsService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // ─── State ───
  readonly coupons = signal<AdminCouponListItem[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<string>('');
  readonly typeFilter = signal<string>('');
  readonly showCreateDialog = signal(false);
  readonly creating = signal(false);

  // Toggle dialog state
  readonly toggleDialogTitle = signal('');
  readonly toggleDialogMessage = signal('');
  readonly toggleDialogConfirmLabel = signal('');
  readonly toggleDialogDestructive = signal(false);
  private toggleTarget: AdminCouponListItem | null = null;

  @ViewChild('toggleDialog') toggleDialog!: ConfirmDialogComponent;

  readonly skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // ─── Create Form ───
  readonly createForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9]+$/)]],
    type: ['percentage' as const, Validators.required],
    value: [0 as number, [Validators.required, Validators.min(0.01)]],
    validFrom: ['', Validators.required],
    validUntil: ['', Validators.required],
    maxUses: [null as number | null],
    description: [''],
  });

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: AdminCouponsListQuery = {
      page: this.pagination()?.page ?? 1,
      limit: 20,
    };

    const status = this.statusFilter();
    if (status) {
      query.status = status as CouponStatus;
    }

    const type = this.typeFilter();
    if (type) {
      query.type = type as CouponType;
    }

    const search = this.searchTerm();
    if (search.trim()) {
      query.q = search.trim();
    }

    this.service.listCoupons(query).subscribe({
      next: (response) => {
        this.coupons.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar cupons. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  // ─── Filters ───

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.resetPage();
      this.loadCoupons();
    }, 400);
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value);
    this.resetPage();
    this.loadCoupons();
  }

  onTypeFilterChange(value: string): void {
    this.typeFilter.set(value);
    this.resetPage();
    this.loadCoupons();
  }

  onPageChange(page: number): void {
    const current = this.pagination();
    if (current) {
      this.pagination.set({ ...current, page });
    }
    this.loadCoupons();
  }

  // ─── Navigation ───

  navigateToDetail(id: string): void {
    this.router.navigate([APP_ROUTES.ADMIN.COUPON_DETAIL(id)]);
  }

  // ─── Toggle Status ───

  toggleCouponStatus(coupon: AdminCouponListItem, event: Event): void {
    event.stopPropagation();
    this.toggleTarget = coupon;

    if (coupon.status === 'active') {
      this.toggleDialogTitle.set('Desativar cupom');
      this.toggleDialogMessage.set(`Deseja desativar o cupom ${coupon.code}?`);
      this.toggleDialogConfirmLabel.set('Desativar');
      this.toggleDialogDestructive.set(true);
    } else {
      this.toggleDialogTitle.set('Ativar cupom');
      this.toggleDialogMessage.set(`Deseja ativar o cupom ${coupon.code}?`);
      this.toggleDialogConfirmLabel.set('Ativar');
      this.toggleDialogDestructive.set(false);
    }

    this.toggleDialog.show();
  }

  confirmToggle(): void {
    if (!this.toggleTarget) return;
    const coupon = this.toggleTarget;
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';

    this.service.updateCoupon(coupon.id, { status: newStatus }).subscribe({
      next: () => {
        this.toast.success(`Cupom ${coupon.code} ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`);
        this.loadCoupons();
      },
      error: () => {
        this.toast.error('Erro ao alterar status do cupom.');
      },
    });

    this.toggleTarget = null;
  }

  // ─── Create Dialog ───

  openCreateDialog(): void {
    this.createForm.reset({
      code: '',
      type: 'percentage',
      value: 0,
      validFrom: '',
      validUntil: '',
      maxUses: null,
      description: '',
    });
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  submitCreate(): void {
    if (this.createForm.invalid) return;

    this.creating.set(true);
    const formValue = this.createForm.getRawValue();

    this.service.createCoupon({
      code: formValue.code.toUpperCase().trim(),
      type: formValue.type as CouponType,
      value: formValue.value,
      validFrom: new Date(formValue.validFrom).toISOString(),
      validUntil: new Date(formValue.validUntil).toISOString(),
      maxUses: formValue.maxUses ?? null,
      description: formValue.description || null,
    }).subscribe({
      next: (result) => {
        this.creating.set(false);
        this.showCreateDialog.set(false);
        this.toast.success(`Cupom ${result.code} criado com sucesso.`);
        this.loadCoupons();
      },
      error: () => {
        this.creating.set(false);
        this.toast.error('Erro ao criar cupom. Verifique os dados e tente novamente.');
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

  formatValue(coupon: AdminCouponListItem): string {
    if (coupon.type === 'percentage') {
      return `${parseFloat(coupon.value)}%`;
    }
    return `R$ ${parseFloat(coupon.value).toFixed(2).replace('.', ',')}`;
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private resetPage(): void {
    const current = this.pagination();
    if (current) {
      this.pagination.set({ ...current, page: 1 });
    }
  }
}

