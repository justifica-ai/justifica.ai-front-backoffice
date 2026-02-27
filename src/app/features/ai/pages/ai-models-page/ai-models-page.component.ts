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
  AdminAiModelListItem,
  AdminAiModelsListQuery,
  AdminAiProviderListItem,
} from '../../models/ai.model';

@Component({
  selector: 'app-ai-models-page',
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
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Modelos de IA</h2>
      <button
        type="button"
        (click)="openCreateDialog()"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        aria-label="Adicionar novo modelo"
      >
        + Novo Modelo
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <select
        [ngModel]="providerFilter()"
        (ngModelChange)="onProviderFilterChange($event)"
        class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        aria-label="Filtrar por provedor"
      >
        <option value="">Todos os provedores</option>
        @for (p of availableProviders(); track p.id) {
          <option [value]="p.id">{{ p.name }}</option>
        }
      </select>
      <select
        [ngModel]="activeFilter()"
        (ngModelChange)="onActiveFilterChange($event)"
        class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        aria-label="Filtrar por ativo/inativo"
      >
        <option value="">Todos</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
    </div>

    <!-- Error State -->
    @if (error()) {
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <p class="text-sm text-red-700 dark:text-red-400">{{ error() }}</p>
        <button
          type="button"
          (click)="loadModels()"
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
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provedor</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prioridade</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Tokens</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Custo (1K in/out)</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gerações</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ativo</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            @if (loading()) {
              @for (i of skeletonRows; track i) {
                <tr class="animate-pulse">
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto"></div></td>
                </tr>
              }
            } @else {
              @for (model of models(); track model.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ model.name }}</div>
                    <div class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ model.slug }}</div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ model.providerName }}</td>
                  <td class="px-4 py-3 text-sm text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        (click)="movePriority(model, -1)"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                        [disabled]="reordering()"
                        aria-label="Aumentar prioridade"
                      >▲</button>
                      <span class="w-6 text-center text-gray-600 dark:text-gray-300">{{ model.priority }}</span>
                      <button
                        type="button"
                        (click)="movePriority(model, 1)"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                        [disabled]="reordering()"
                        aria-label="Diminuir prioridade"
                      >▼</button>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-300">{{ formatNumber(model.maxTokens) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-300">
                    {{ formatCost(model.costPer1kInput) }} / {{ formatCost(model.costPer1kOutput) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{{ model.generationsCount }}</td>
                  <td class="px-4 py-3 text-center">
                    @if (model.isActive) {
                      <app-badge label="Ativo" colorClass="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" />
                    } @else {
                      <app-badge label="Inativo" colorClass="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" />
                    }
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        (click)="toggleActive(model)"
                        [class]="model.isActive
                          ? 'text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors'
                          : 'text-xs px-2 py-1 rounded border border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors'"
                        [attr.aria-label]="model.isActive ? 'Desativar modelo ' + model.name : 'Ativar modelo ' + model.name"
                      >
                        {{ model.isActive ? 'Desativar' : 'Ativar' }}
                      </button>
                      <button
                        type="button"
                        (click)="openEditDialog(model)"
                        class="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                        [attr.aria-label]="'Editar modelo ' + model.name"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        (click)="confirmDelete(model)"
                        class="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        [attr.aria-label]="'Excluir modelo ' + model.name"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum modelo encontrado.
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
      [title]="'Excluir modelo'"
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
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          role="dialog"
          aria-labelledby="model-dialog-title"
        >
          <h2 id="model-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {{ editingId() ? 'Editar Modelo' : 'Novo Modelo' }}
          </h2>

          <form [formGroup]="modelForm" (ngSubmit)="submitForm()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Provedor -->
              <div>
                <label for="model-provider" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Provedor <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <select
                  id="model-provider"
                  formControlName="providerId"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Selecione um provedor</option>
                  @for (p of availableProviders(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
                @if (modelForm.controls.providerId.touched && modelForm.controls.providerId.errors) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Selecione um provedor</p>
                }
              </div>

              <!-- Nome -->
              <div>
                <label for="model-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <input
                  id="model-name"
                  formControlName="name"
                  type="text"
                  maxlength="100"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: Claude Opus 4"
                />
                @if (modelForm.controls.name.touched && modelForm.controls.name.errors) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Nome é obrigatório (2-100 caracteres)</p>
                }
              </div>

              <!-- Slug -->
              <div>
                <label for="model-slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug <span class="text-red-500" aria-hidden="true">*</span>
                  <span class="sr-only">(obrigatório)</span>
                </label>
                <input
                  id="model-slug"
                  formControlName="slug"
                  type="text"
                  maxlength="100"
                  class="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="Ex: claude-opus-4-20250514"
                />
                @if (modelForm.controls.slug.touched && modelForm.controls.slug.errors) {
                  <p class="mt-1 text-xs text-red-600 dark:text-red-400">Slug deve conter apenas letras minúsculas, números, hífens e pontos</p>
                }
              </div>

              <!-- Max Tokens -->
              <div>
                <label for="model-max-tokens" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Tokens
                </label>
                <input
                  id="model-max-tokens"
                  formControlName="maxTokens"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="4096"
                />
              </div>

              <!-- Cost per 1K Input -->
              <div>
                <label for="model-cost-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custo / 1K Input (USD)
                </label>
                <input
                  id="model-cost-input"
                  formControlName="costPer1kInput"
                  type="number"
                  step="0.0001"
                  min="0"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="0.015"
                />
              </div>

              <!-- Cost per 1K Output -->
              <div>
                <label for="model-cost-output" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custo / 1K Output (USD)
                </label>
                <input
                  id="model-cost-output"
                  formControlName="costPer1kOutput"
                  type="number"
                  step="0.0001"
                  min="0"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="0.075"
                />
              </div>

              <!-- Priority -->
              <div>
                <label for="model-priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade
                </label>
                <input
                  id="model-priority"
                  formControlName="priority"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500"
                  placeholder="1"
                />
              </div>

              <!-- Active -->
              <div class="flex items-center pt-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="isActive"
                    class="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Modelo ativo</span>
                </label>
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
                [disabled]="modelForm.invalid || submitting()"
                class="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (submitting()) {
                  Salvando...
                } @else if (editingId()) {
                  Salvar Alterações
                } @else {
                  Criar Modelo
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class AiModelsPageComponent implements OnInit {
  private readonly service = inject(AdminAiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // ─── State ───
  readonly models = signal<AdminAiModelListItem[]>([]);
  readonly availableProviders = signal<AdminAiProviderListItem[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly providerFilter = signal<string>('');
  readonly activeFilter = signal<string>('');
  readonly showFormDialog = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly reordering = signal(false);
  readonly deleteMessage = signal('');
  private deleteTarget: AdminAiModelListItem | null = null;

  @ViewChild('deleteDialog') deleteDialog!: ConfirmDialogComponent;

  readonly skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  // ─── Form ───
  readonly modelForm = this.fb.nonNullable.group({
    providerId: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+([-.][a-z0-9]+)*$/)]],
    maxTokens: [4096, [Validators.min(1)]],
    costPer1kInput: [null as number | null],
    costPer1kOutput: [null as number | null],
    priority: [1, [Validators.min(1), Validators.max(100)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadProvidersList();
    this.loadModels();
  }

  loadProvidersList(): void {
    this.service.listProviders({ page: 1, limit: 100 }).subscribe({
      next: (response) => {
        this.availableProviders.set(response.data);
      },
      error: () => {
        // Silent fail — filter still works without provider names
      },
    });
  }

  loadModels(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: AdminAiModelsListQuery = {
      page: this.pagination()?.page ?? 1,
      limit: 20,
    };

    const providerId = this.providerFilter();
    if (providerId) {
      query.providerId = providerId;
    }

    const active = this.activeFilter();
    if (active) {
      query.active = active;
    }

    this.service.listModels(query).subscribe({
      next: (response) => {
        this.models.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar modelos. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  // ─── Filters ───

  onProviderFilterChange(value: string): void {
    this.providerFilter.set(value);
    this.resetPage();
    this.loadModels();
  }

  onActiveFilterChange(value: string): void {
    this.activeFilter.set(value);
    this.resetPage();
    this.loadModels();
  }

  onPageChange(page: number): void {
    const current = this.pagination();
    if (current) {
      this.pagination.set({ ...current, page });
    }
    this.loadModels();
  }

  // ─── Reorder ───

  movePriority(model: AdminAiModelListItem, direction: number): void {
    const newPriority = model.priority + direction;
    if (newPriority < 1) return;

    this.reordering.set(true);
    this.service.reorderModels({ models: [{ id: model.id, priority: newPriority }] }).subscribe({
      next: () => {
        this.reordering.set(false);
        this.loadModels();
      },
      error: () => {
        this.reordering.set(false);
        this.toast.error('Erro ao reordenar modelo.');
      },
    });
  }

  // ─── Toggle Active ───

  toggleActive(model: AdminAiModelListItem): void {
    this.service.updateModel(model.id, { isActive: !model.isActive }).subscribe({
      next: () => {
        this.toast.success(`Modelo "${model.name}" ${model.isActive ? 'desativado' : 'ativado'} com sucesso.`);
        this.loadModels();
      },
      error: () => {
        this.toast.error('Erro ao alterar status do modelo.');
      },
    });
  }

  // ─── Delete ───

  confirmDelete(model: AdminAiModelListItem): void {
    this.deleteTarget = model;
    this.deleteMessage.set(`Deseja excluir o modelo "${model.name}"? Esta ação não pode ser desfeita.`);
    this.deleteDialog.show();
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    const model = this.deleteTarget;

    this.service.deleteModel(model.id).subscribe({
      next: () => {
        this.toast.success(`Modelo "${model.name}" excluído com sucesso.`);
        this.loadModels();
      },
      error: () => {
        this.toast.error('Erro ao excluir modelo. Verifique se não há gerações vinculadas.');
      },
    });

    this.deleteTarget = null;
  }

  // ─── Create / Edit Dialog ───

  openCreateDialog(): void {
    this.editingId.set(null);
    this.modelForm.reset({
      providerId: '',
      name: '',
      slug: '',
      maxTokens: 4096,
      costPer1kInput: null,
      costPer1kOutput: null,
      priority: 1,
      isActive: true,
    });
    this.showFormDialog.set(true);
  }

  openEditDialog(model: AdminAiModelListItem): void {
    this.editingId.set(model.id);
    this.modelForm.patchValue({
      providerId: model.providerId,
      name: model.name,
      slug: model.slug,
      maxTokens: model.maxTokens,
      costPer1kInput: model.costPer1kInput ? Number.parseFloat(model.costPer1kInput) : null,
      costPer1kOutput: model.costPer1kOutput ? Number.parseFloat(model.costPer1kOutput) : null,
      priority: model.priority,
      isActive: model.isActive,
    });
    this.showFormDialog.set(true);
  }

  closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.editingId.set(null);
  }

  submitForm(): void {
    if (this.modelForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.modelForm.getRawValue();
    const body = {
      providerId: formValue.providerId,
      name: formValue.name.trim(),
      slug: formValue.slug.trim().toLowerCase(),
      maxTokens: formValue.maxTokens,
      costPer1kInput: formValue.costPer1kInput,
      costPer1kOutput: formValue.costPer1kOutput,
      priority: formValue.priority,
      isActive: formValue.isActive,
    };

    const editId = this.editingId();
    if (editId) {
      this.service.updateModel(editId, body).subscribe({
        next: () => {
          this.submitting.set(false);
          this.showFormDialog.set(false);
          this.editingId.set(null);
          this.toast.success('Modelo atualizado com sucesso.');
          this.loadModels();
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error('Erro ao atualizar modelo.');
        },
      });
    } else {
      this.service.createModel(body).subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.showFormDialog.set(false);
          this.toast.success(`Modelo "${result.name}" criado com sucesso.`);
          this.loadModels();
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error('Erro ao criar modelo. Verifique os dados e tente novamente.');
        },
      });
    }
  }

  // ─── Helpers ───

  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR');
  }

  formatCost(value: string | null): string {
    if (!value) return '—';
    const num = Number.parseFloat(value);
    return `$${num.toFixed(4)}`;
  }

  private resetPage(): void {
    const current = this.pagination();
    if (current) {
      this.pagination.set({ ...current, page: 1 });
    }
  }
}
