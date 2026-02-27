import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  inject,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminAiService } from '../../services/admin-ai.service';
import type { Pagination } from '../../../../shared/models/pagination.model';
import type {
  AdminAiProviderListItem,
  AdminAiProvidersListQuery,
  ProviderStatus,
} from '../../models/ai.model';
import {
  PROVIDER_STATUS_LABELS,
  PROVIDER_STATUS_COLORS,
} from '../../models/ai.model';

@Component({
  selector: 'app-ai-providers-page',
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
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Provedores de IA</h2>
      <button
        type="button"
        (click)="openCreateDialog()"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        aria-label="Adicionar novo provedor"
      >
        + Novo Provedor
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <select
        [ngModel]="statusFilter()"
        (ngModelChange)="onStatusFilterChange($event)"
        class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        aria-label="Filtrar por status"
      >
        <option value="">Todos os status</option>
        <option value="active">Ativo</option>
        <option value="inactive">Inativo</option>
        <option value="maintenance">Manutenção</option>
      </select>
    </div>

    <!-- Error State -->
    @if (error()) {
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <p class="text-sm text-red-700 dark:text-red-400">{{ error() }}</p>
        <button
          type="button"
          (click)="loadProviders()"
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
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prioridade</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modelos</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">API Key</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            @if (loading()) {
              @for (i of skeletonRows; track i) {
                <tr class="animate-pulse">
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto"></div></td>
                </tr>
              }
            } @else {
              @for (provider of providers(); track provider.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{{ provider.name }}</td>
                  <td class="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{{ provider.slug }}</td>
                  <td class="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{{ provider.priority }}</td>
                  <td class="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{{ provider.modelsCount }}</td>
                  <td class="px-4 py-3 text-center">
                    @if (provider.hasApiKey) {
                      <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs" title="API Key configurada">✓</span>
                    } @else {
                      <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs" title="API Key ausente">✗</span>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <app-badge [label]="getStatusLabel(provider.status)" [colorClass]="getStatusColor(provider.status)" />
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        (click)="testConnection(provider)"
                        [disabled]="testingId() === provider.id"
                        class="text-xs px-2 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        [attr.aria-label]="'Testar conexão com ' + provider.name"
                      >
                        @if (testingId() === provider.id) {
                          Testando...
                        } @else {
                          Testar
                        }
                      </button>
                      <button
                        type="button"
                        (click)="openEditDialog(provider)"
                        class="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                        [attr.aria-label]="'Editar provedor ' + provider.name"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        (click)="confirmDelete(provider)"
                        class="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        [attr.aria-label]="'Excluir provedor ' + provider.name"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum provedor encontrado.
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

    <!-- Delete Confirm Dialog -->
    <app-confirm-dialog
      #deleteDialog
      [title]="'Excluir provedor'"
      [message]="deleteMessage()"
      confirmLabel="Excluir"
      [destructive]="true"
      (confirmed)="executeDelete()"
    />

    <!-- Create/Edit Dialog -->
    @if (showFormDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/50"
          (click)="closeFormDialog()"
          (keydown.escape)="closeFormDialog()"
          role="presentation"
        ></div>
        <div
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
          role="dialog"
          aria-labelledby="form-dialog-title"
        >
          <h2 id="form-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {{ editingId() ? 'Editar Provedor' : 'Novo Provedor' }}
          </h2>

          <form [formGroup]="providerForm" (ngSubmit)="submitForm()">
            <div class="space-y-4">
              <!-- Nome -->
              <div>
                <label for="provider-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <input
                  id="provider-name"
                  formControlName="name"
                  type="text"
                  maxlength="100"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: Anthropic"
                />
                @if (providerForm.controls.name.touched && providerForm.controls.name.errors) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Nome é obrigatório (2-100 caracteres)</p>
                }
              </div>

              <!-- Slug -->
              <div>
                <label for="provider-slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <input
                  id="provider-slug"
                  formControlName="slug"
                  type="text"
                  maxlength="50"
                  class="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: anthropic"
                />
                @if (providerForm.controls.slug.touched && providerForm.controls.slug.errors) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Slug deve conter apenas letras minúsculas, números e hífens</p>
                }
              </div>

              <!-- API Endpoint -->
              <div>
                <label for="provider-endpoint" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Endpoint
                </label>
                <input
                  id="provider-endpoint"
                  formControlName="apiEndpoint"
                  type="url"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <!-- Status -->
              <div>
                <label for="provider-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="provider-status"
                  formControlName="status"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="maintenance">Manutenção</option>
                </select>
              </div>

              <!-- Priority -->
              <div>
                <label for="provider-priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade
                </label>
                <input
                  id="provider-priority"
                  formControlName="priority"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="1"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                (click)="closeFormDialog()"
                class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="providerForm.invalid || submitting()"
                class="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (submitting()) {
                  Salvando...
                } @else if (editingId()) {
                  Salvar Alterações
                } @else {
                  Criar Provedor
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class AiProvidersPageComponent implements OnInit {
  private readonly service = inject(AdminAiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // ─── State ───
  readonly providers = signal<AdminAiProviderListItem[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<string>('');
  readonly showFormDialog = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly testingId = signal<string | null>(null);
  readonly deleteMessage = signal('');
  private deleteTarget: AdminAiProviderListItem | null = null;

  @ViewChild('deleteDialog') deleteDialog!: ConfirmDialogComponent;

  readonly skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  // ─── Form ───
  readonly providerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    apiEndpoint: [''],
    status: ['active' as ProviderStatus],
    priority: [1, [Validators.min(1), Validators.max(100)]],
  });

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: AdminAiProvidersListQuery = {
      page: this.pagination()?.page ?? 1,
      limit: 20,
    };

    const status = this.statusFilter();
    if (status) {
      query.status = status as ProviderStatus;
    }

    this.service.listProviders(query).subscribe({
      next: (response) => {
        this.providers.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar provedores. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  // ─── Filters ───

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value);
    this.resetPage();
    this.loadProviders();
  }

  onPageChange(page: number): void {
    const current = this.pagination();
    if (current) {
      this.pagination.set({ ...current, page });
    }
    this.loadProviders();
  }

  // ─── Test Connection ───

  testConnection(provider: AdminAiProviderListItem): void {
    this.testingId.set(provider.id);
    this.service.testConnection(provider.id).subscribe({
      next: (result) => {
        this.testingId.set(null);
        if (result.success) {
          this.toast.success(`Conexão com ${provider.name} OK (${result.latencyMs}ms)`);
        } else {
          this.toast.error(`Falha na conexão com ${provider.name}: ${result.error}`);
        }
      },
      error: () => {
        this.testingId.set(null);
        this.toast.error(`Erro ao testar conexão com ${provider.name}.`);
      },
    });
  }

  // ─── Delete ───

  confirmDelete(provider: AdminAiProviderListItem): void {
    this.deleteTarget = provider;
    this.deleteMessage.set(`Deseja excluir o provedor "${provider.name}"? Esta ação não pode ser desfeita.`);
    this.deleteDialog.show();
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    const provider = this.deleteTarget;

    this.service.deleteProvider(provider.id).subscribe({
      next: () => {
        this.toast.success(`Provedor "${provider.name}" excluído com sucesso.`);
        this.loadProviders();
      },
      error: () => {
        this.toast.error('Erro ao excluir provedor. Verifique se não há modelos ou gerações vinculadas.');
      },
    });

    this.deleteTarget = null;
  }

  // ─── Create / Edit Dialog ───

  openCreateDialog(): void {
    this.editingId.set(null);
    this.providerForm.reset({
      name: '',
      slug: '',
      apiEndpoint: '',
      status: 'active',
      priority: 1,
    });
    this.showFormDialog.set(true);
  }

  openEditDialog(provider: AdminAiProviderListItem): void {
    this.editingId.set(provider.id);
    this.providerForm.patchValue({
      name: provider.name,
      slug: provider.slug,
      apiEndpoint: provider.apiEndpoint ?? '',
      status: provider.status,
      priority: provider.priority,
    });
    this.showFormDialog.set(true);
  }

  closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.editingId.set(null);
  }

  submitForm(): void {
    if (this.providerForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.providerForm.getRawValue();
    const body = {
      name: formValue.name.trim(),
      slug: formValue.slug.trim().toLowerCase(),
      apiEndpoint: formValue.apiEndpoint?.trim() || null,
      status: formValue.status as ProviderStatus,
      priority: formValue.priority,
    };

    const editId = this.editingId();
    if (editId) {
      this.service.updateProvider(editId, body).subscribe({
        next: () => {
          this.submitting.set(false);
          this.showFormDialog.set(false);
          this.editingId.set(null);
          this.toast.success('Provedor atualizado com sucesso.');
          this.loadProviders();
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error('Erro ao atualizar provedor.');
        },
      });
    } else {
      this.service.createProvider(body).subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.showFormDialog.set(false);
          this.toast.success(`Provedor "${result.name}" criado com sucesso.`);
          this.loadProviders();
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error('Erro ao criar provedor. Verifique os dados e tente novamente.');
        },
      });
    }
  }

  // ─── Helpers ───

  getStatusLabel(status: ProviderStatus): string {
    return PROVIDER_STATUS_LABELS[status] ?? status;
  }

  getStatusColor(status: ProviderStatus): string {
    return PROVIDER_STATUS_COLORS[status] ?? '';
  }

  private resetPage(): void {
    const current = this.pagination();
    if (current) {
      this.pagination.set({ ...current, page: 1 });
    }
  }
}
