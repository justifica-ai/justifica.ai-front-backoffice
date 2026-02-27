import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminUsersService } from '../../services/admin-users.service';
import {
  AdminUserDetail,
  UserStatus,
  UserRole,
  USER_STATUS_LABELS,
  USER_ROLE_LABELS,
  USER_STATUS_COLORS,
  USER_ROLE_COLORS,
} from '../../models/user.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { APP_ROUTES } from '../../../../core/constants/app-routes';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [BadgeComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Back Button + Header -->
    <div class="mb-6">
      <button
        type="button"
        (click)="goBack()"
        class="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 mb-3 inline-flex items-center gap-1"
      >
        ← Voltar para Usuários
      </button>

      @if (loading()) {
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar dados do usuário.</p>
          <button
            type="button"
            (click)="loadUser()"
            class="mt-3 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      } @else if (user()) {
        <!-- Header with actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ user()!.name }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ user()!.email }}</p>
          </div>
          <div class="flex items-center gap-2">
            <app-badge [label]="getRoleLabel(user()!.role)" [colorClass]="getRoleColor(user()!.role)" />
            <app-badge [label]="getStatusLabel(user()!.status)" [colorClass]="getStatusColor(user()!.status)" />
            @if (user()!.status === 'active') {
              <button
                type="button"
                (click)="suspendDialog.show()"
                class="px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                Suspender
              </button>
            }
            @if (user()!.status === 'suspended') {
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

        <!-- Info Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <!-- Personal Data -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Dados Pessoais</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Nome</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user()!.name }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">E-mail</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user()!.email }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Telefone</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user()!.phone ?? 'Não informado' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">E-mail verificado</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user()!.emailVerifiedAt ? formatDate(user()!.emailVerifiedAt!) : 'Não verificado' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Onboarding</dt>
                <dd class="text-sm font-medium" [class]="user()!.onboardingCompleted ? 'text-accent-600 dark:text-accent-400' : 'text-amber-600 dark:text-amber-400'">{{ user()!.onboardingCompleted ? 'Completo' : 'Incompleto' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Cadastro</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatDate(user()!.createdAt) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Última atualização</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatDate(user()!.updatedAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Sessions -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sessões</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Sessões ativas</dt>
                <dd class="text-sm font-semibold text-accent-600 dark:text-accent-400">{{ user()!.sessions.active }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Sessões totais</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user()!.sessions.total }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Appeals + Transactions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <!-- Appeals -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recursos</h2>
            <div class="flex justify-between mb-3">
              <span class="text-sm text-gray-500 dark:text-gray-400">Total</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ user()!.appeals.total }}</span>
            </div>
            @if (appealStatusEntries().length > 0) {
              <div class="space-y-2">
                @for (entry of appealStatusEntries(); track entry[0]) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ formatAppealStatus(entry[0]) }}</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ entry[1] }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-sm text-gray-400 dark:text-gray-500">Nenhum recurso.</p>
            }
          </div>

          <!-- Transactions -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transações</h2>
            <div class="flex justify-between mb-1">
              <span class="text-sm text-gray-500 dark:text-gray-400">Total</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ user()!.transactions.total }}</span>
            </div>
            <div class="flex justify-between mb-3">
              <span class="text-sm text-gray-500 dark:text-gray-400">Valor bruto total</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(user()!.transactions.totalGross) }}</span>
            </div>
            @if (transactionStatusEntries().length > 0) {
              <div class="space-y-2">
                @for (entry of transactionStatusEntries(); track entry[0]) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ formatTransactionStatus(entry[0]) }}</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ entry[1] }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-sm text-gray-400 dark:text-gray-500">Nenhuma transação.</p>
            }
          </div>
        </div>
      }

    <!-- Suspend Confirmation -->
    <app-confirm-dialog
      #suspendDialog
      title="Suspender usuário"
      [message]="'Tem certeza que deseja suspender ' + (user()?.name ?? '') + '?'"
      confirmLabel="Suspender"
      [destructive]="true"
      (confirmed)="executeSuspend()"
    />
  `,
})
export class UserDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(AdminUsersService);
  private readonly toast = inject(ToastService);

  @ViewChild('suspendDialog') suspendDialog!: ConfirmDialogComponent;

  readonly user = signal<AdminUserDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  private userId = '';

  readonly appealStatusEntries = computed(() => {
    const u = this.user();
    if (!u) return [];
    return Object.entries(u.appeals.byStatus);
  });

  readonly transactionStatusEntries = computed(() => {
    const u = this.user();
    if (!u) return [];
    return Object.entries(u.transactions.byStatus);
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.userId) {
      this.loadUser();
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  loadUser(): void {
    this.loading.set(true);
    this.error.set(false);

    this.usersService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.toast.error('Erro ao carregar usuário', 'Usuário não encontrado ou erro de rede.');
      },
    });
  }

  goBack(): void {
    this.router.navigate([APP_ROUTES.ADMIN.USERS]);
  }

  executeSuspend(): void {
    this.usersService.updateUser(this.userId, { status: 'suspended' }).subscribe({
      next: () => {
        this.toast.success('Usuário suspenso');
        this.loadUser();
      },
      error: () => {
        this.toast.error('Erro ao suspender usuário');
      },
    });
  }

  reactivate(): void {
    this.usersService.updateUser(this.userId, { status: 'active' }).subscribe({
      next: () => {
        this.toast.success('Usuário reativado');
        this.loadUser();
      },
      error: () => {
        this.toast.error('Erro ao reativar usuário');
      },
    });
  }

  getRoleLabel(role: string): string {
    return USER_ROLE_LABELS[role as UserRole] ?? role;
  }

  getRoleColor(role: string): string {
    return USER_ROLE_COLORS[role as UserRole] ?? '';
  }

  getStatusLabel(status: string): string {
    return USER_STATUS_LABELS[status as UserStatus] ?? status;
  }

  getStatusColor(status: string): string {
    return USER_STATUS_COLORS[status as UserStatus] ?? '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatCurrency(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatAppealStatus(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      pending_payment: 'Aguardando Pagamento',
      paid: 'Pago',
      generating: 'Gerando',
      generated: 'Gerado',
      failed: 'Falha',
      cancelled: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  formatTransactionStatus(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      refunded: 'Reembolsado',
      failed: 'Falha',
      expired: 'Expirado',
    };
    return labels[status] ?? status;
  }
}
