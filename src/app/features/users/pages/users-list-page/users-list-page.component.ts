import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminUsersService } from '../../services/admin-users.service';
import {
  AdminUserListItem,
  AdminUsersListQuery,
  Pagination,
  UserStatus,
  UserRole,
  USER_STATUS_LABELS,
  USER_ROLE_LABELS,
  USER_STATUS_COLORS,
  USER_ROLE_COLORS,
} from '../../models/user.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { APP_ROUTES } from '../../../../core/constants/app-routes';

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [FormsModule, PaginationComponent, BadgeComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Usuários</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestão de usuários do sistema</p>
      </div>
    </div>

    <!-- Filters -->
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
            <option value="active">Ativo</option>
            <option value="suspended">Suspenso</option>
            <option value="pending_verification">Pendente</option>
            <option value="deleted">Excluído</option>
          </select>
        </div>
        <div>
          <label for="role-filter" class="sr-only">Role</label>
          <select
            id="role-filter"
            [ngModel]="filterRole()"
            (ngModelChange)="onRoleChange($event)"
            class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          >
            <option value="">Todos os roles</option>
            <option value="user">Usuário</option>
            <option value="affiliate">Afiliado</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>
    </div>

    @if (loading()) {
      <!-- Skeleton -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          @for (i of skeletonRows; track i) {
            <div class="px-4 py-3 animate-pulse flex items-center gap-4">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
            </div>
          }
        </div>
      </div>
    } @else if (error()) {
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar usuários.</p>
        <button
          type="button"
          (click)="loadUsers()"
          class="mt-3 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    } @else {
      <!-- Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Nome</th>
                <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">E-mail</th>
                <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Cadastro</th>
                <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Recursos</th>
                <th class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ user.name }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ user.email }}</td>
                  <td class="px-4 py-3">
                    <app-badge [label]="getRoleLabel(user.role)" [colorClass]="getRoleColor(user.role)" />
                  </td>
                  <td class="px-4 py-3">
                    <app-badge [label]="getStatusLabel(user.status)" [colorClass]="getStatusColor(user.status)" />
                  </td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ formatDate(user.createdAt) }}</td>
                  <td class="px-4 py-3 text-right text-gray-900 dark:text-gray-100">{{ user.appealsCount }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        (click)="viewUser(user.id)"
                        class="px-2 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                        title="Ver detalhes"
                      >
                        Ver
                      </button>
                      @if (user.status === 'active') {
                        <button
                          type="button"
                          (click)="promptSuspend(user)"
                          class="px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                          title="Suspender"
                        >
                          Suspender
                        </button>
                      }
                      @if (user.status === 'suspended') {
                        <button
                          type="button"
                          (click)="reactivateUser(user)"
                          class="px-2 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded transition-colors"
                          title="Reativar"
                        >
                          Reativar
                        </button>
                      }
                      @if (canDelete(user)) {
                        <button
                          type="button"
                          (click)="promptDelete(user)"
                          class="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Excluir"
                        >
                          Excluir
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
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
    }

    <!-- Suspend Confirmation -->
    <app-confirm-dialog
      #suspendDialog
      title="Suspender usuário"
      [message]="'Tem certeza que deseja suspender ' + (selectedUser()?.name ?? '') + '? Todas as sessões ativas serão revogadas.'"
      confirmLabel="Suspender"
      [destructive]="true"
      (confirmed)="executeSuspend()"
    />

    <!-- Delete Confirmation -->
    <app-confirm-dialog
      #deleteDialog
      title="Excluir usuário"
      [message]="'Esta ação é irreversível. Os dados de ' + (selectedUser()?.name ?? '') + ' serão anonimizados conforme LGPD. Deseja continuar?'"
      confirmLabel="Excluir definitivamente"
      [destructive]="true"
      (confirmed)="executeDelete()"
    />
  `,
})
export class UsersListPageComponent implements OnInit {
  private readonly usersService = inject(AdminUsersService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  @ViewChild('suspendDialog') suspendDialog!: ConfirmDialogComponent;
  @ViewChild('deleteDialog') deleteDialog!: ConfirmDialogComponent;

  readonly users = signal<AdminUserListItem[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly searchQuery = signal('');
  readonly filterStatus = signal('');
  readonly filterRole = signal('');
  readonly selectedUser = signal<AdminUserListItem | null>(null);
  readonly skeletonRows = [1, 2, 3, 4, 5];

  private currentPage = 1;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(false);

    const query: AdminUsersListQuery = {
      page: this.currentPage,
      limit: 20,
    };

    const q = this.searchQuery();
    if (q) {
      query.q = q;
    }

    const status = this.filterStatus();
    if (status) {
      query.status = status as AdminUsersListQuery['status'];
    }

    const role = this.filterRole();
    if (role) {
      query.role = role as AdminUsersListQuery['role'];
    }

    this.usersService.listUsers(query).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.toast.error('Erro ao carregar usuários', 'Tente novamente.');
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
      this.loadUsers();
    }, 400);
  }

  onStatusChange(value: string): void {
    this.filterStatus.set(value);
    this.currentPage = 1;
    this.loadUsers();
  }

  onRoleChange(value: string): void {
    this.filterRole.set(value);
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  viewUser(id: string): void {
    this.router.navigate([APP_ROUTES.ADMIN.USER_DETAIL(id)]);
  }

  promptSuspend(user: AdminUserListItem): void {
    this.selectedUser.set(user);
    this.suspendDialog.show();
  }

  promptDelete(user: AdminUserListItem): void {
    this.selectedUser.set(user);
    this.deleteDialog.show();
  }

  executeSuspend(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.usersService.updateUser(user.id, { status: 'suspended' }).subscribe({
      next: () => {
        this.toast.success('Usuário suspenso', `${user.name} foi suspenso com sucesso.`);
        this.loadUsers();
      },
      error: () => {
        this.toast.error('Erro ao suspender', 'Não foi possível suspender o usuário.');
      },
    });
  }

  reactivateUser(user: AdminUserListItem): void {
    this.usersService.updateUser(user.id, { status: 'active' }).subscribe({
      next: () => {
        this.toast.success('Usuário reativado', `${user.name} foi reativado com sucesso.`);
        this.loadUsers();
      },
      error: () => {
        this.toast.error('Erro ao reativar', 'Não foi possível reativar o usuário.');
      },
    });
  }

  executeDelete(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.toast.success('Usuário excluído', 'Dados anonimizados conforme LGPD.');
        this.loadUsers();
      },
      error: () => {
        this.toast.error('Erro ao excluir', 'Não foi possível excluir o usuário.');
      },
    });
  }

  canDelete(user: AdminUserListItem): boolean {
    return user.role !== 'admin' && user.role !== 'super_admin' && user.status !== 'deleted';
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
}
