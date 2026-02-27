import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminAiService } from '../../services/admin-ai.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import type { Pagination } from '../../../../shared/models/pagination.model';
import type {
  AdminAiPromptListItem,
  AdminAiPromptDetail,
  PromptType,
  PromptStatus,
  AdminAiPromptDiffItem,
} from '../../models/ai.model';
import {
  PROMPT_TYPE_LABELS,
  PROMPT_STATUS_LABELS,
  PROMPT_STATUS_COLORS,
} from '../../models/ai.model';

@Component({
  selector: 'app-ai-prompts-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PaginationComponent,
    BadgeComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Prompts</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Gerencie prompts de IA com versionamento e lifecycle</p>
        </div>
        <button
          type="button"
          (click)="openCreateDialog()"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          + Novo Prompt
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <select
          [ngModel]="typeFilter()"
          (ngModelChange)="typeFilter.set($event); loadPrompts()"
          class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos os tipos</option>
          <option value="defesa_previa">Defesa Prévia</option>
          <option value="recurso_1a_instancia">Recurso 1ª Instância</option>
          <option value="recurso_2a_instancia">Recurso 2ª Instância</option>
        </select>
        <select
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event); loadPrompts()"
          class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      <!-- Error -->
      @if (error()) {
        <div class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        </div>
      }

      <!-- Table -->
      @if (!loading() && prompts().length > 0) {
        <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Nome</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Versão</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Gerações</th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (prompt of prompts(); track prompt.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="whitespace-nowrap px-4 py-3">
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ prompt.name }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ prompt.slug }}</span>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ getTypeLabel(prompt.type) }}</span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <app-badge [label]="getStatusLabel(prompt.status)" [colorClass]="getStatusColor(prompt.status)" />
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <span class="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-400">
                      v{{ prompt.version }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {{ prompt.generationsCount }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        (click)="viewPrompt(prompt)"
                        class="rounded p-1.5 text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Ver detalhes"
                        aria-label="Ver detalhes do prompt"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      @if (prompt.status !== 'active' && prompt.status !== 'archived') {
                        <button
                          type="button"
                          (click)="openEditDialog(prompt.id)"
                          class="rounded p-1.5 text-gray-400 hover:text-amber-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Editar"
                          aria-label="Editar prompt"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      }
                      <button
                        type="button"
                        (click)="openCloneDialog(prompt)"
                        class="rounded p-1.5 text-gray-400 hover:text-purple-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Clonar"
                        aria-label="Clonar prompt"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      @if (prompt.status === 'draft' || prompt.status === 'inactive') {
                        <button
                          type="button"
                          (click)="activatePrompt(prompt)"
                          class="rounded p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Ativar"
                          aria-label="Ativar prompt"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </button>
                      }
                      @if (prompt.status === 'active') {
                        <button
                          type="button"
                          (click)="deactivatePrompt(prompt)"
                          class="rounded p-1.5 text-gray-400 hover:text-orange-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Desativar"
                          aria-label="Desativar prompt"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        </button>
                      }
                      @if (prompt.status !== 'active') {
                        <button
                          type="button"
                          (click)="confirmDelete(prompt)"
                          class="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Excluir"
                          aria-label="Excluir prompt"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-pagination [pagination]="pagination()!" (pageChange)="onPageChange($event)" />
      }

      <!-- Empty State -->
      @if (!loading() && prompts().length === 0 && !error()) {
        <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400">Nenhum prompt encontrado.</p>
        </div>
      }
    </div>

    <!-- View/Detail Dialog -->
    @if (showDetailDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/50"
          (click)="closeDetailDialog()"
          (keydown.escape)="closeDetailDialog()"
          role="presentation"
        ></div>
        <div
          class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-xl"
          role="dialog"
          aria-labelledby="detail-dialog-title"
        >
          @if (detailPrompt()) {
            <div class="p-6 space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 id="detail-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ detailPrompt()!.name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ detailPrompt()!.slug }} — v{{ detailPrompt()!.version }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <app-badge [label]="getTypeLabel(detailPrompt()!.type)" colorClass="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" />
                  <app-badge [label]="getStatusLabel(detailPrompt()!.status)" [colorClass]="getStatusColor(detailPrompt()!.status)" />
                </div>
              </div>

              @if (detailPrompt()!.description) {
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ detailPrompt()!.description }}</p>
              }

              <!-- Parameters -->
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ detailPrompt()!.temperature }}</p>
                </div>
                <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Max Tokens</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ detailPrompt()!.maxTokens }}</p>
                </div>
                <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Top P</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ detailPrompt()!.topP }}</p>
                </div>
                <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Freq. Penalty</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ detailPrompt()!.frequencyPenalty }}</p>
                </div>
                <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Pres. Penalty</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ detailPrompt()!.presencePenalty }}</p>
                </div>
              </div>

              <!-- System Prompt -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">System Prompt</h4>
                <pre class="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 max-h-48 overflow-y-auto">{{ detailPrompt()!.systemPrompt }}</pre>
              </div>

              <!-- User Prompt Template -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Prompt Template</h4>
                <pre class="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 max-h-48 overflow-y-auto">{{ detailPrompt()!.userPromptTemplate }}</pre>
              </div>

              <!-- Motive Codes -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Códigos de Motivo</h4>
                <div class="flex flex-wrap gap-1">
                  @for (code of detailPrompt()!.motiveCodes; track code) {
                    <span class="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">{{ code }}</span>
                  }
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="button"
                  (click)="closeDetailDialog()"
                  class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }

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
          class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-xl"
          role="dialog"
          aria-labelledby="form-dialog-title"
        >
          <div class="p-6">
            <h3 id="form-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {{ editingId() ? 'Editar Prompt' : 'Novo Prompt' }}
            </h3>
            <form [formGroup]="promptForm" (ngSubmit)="submitForm()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="prompt-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="prompt-name"
                    formControlName="name"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Ex: Defesa Prévia v1"
                  />
                </div>
                <div>
                  <label for="prompt-slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="prompt-slug"
                    formControlName="slug"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Ex: defesa-previa-v1"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label for="prompt-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="prompt-type"
                    formControlName="type"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="defesa_previa">Defesa Prévia</option>
                    <option value="recurso_1a_instancia">Recurso 1ª Instância</option>
                    <option value="recurso_2a_instancia">Recurso 2ª Instância</option>
                  </select>
                </div>
                <div>
                  <label for="prompt-version" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Versão <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="prompt-version"
                    formControlName="version"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <label for="prompt-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <input
                    id="prompt-description"
                    formControlName="description"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Descrição breve"
                  />
                </div>
              </div>

              <!-- System Prompt -->
              <div>
                <label for="prompt-system" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  System Prompt <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="prompt-system"
                  formControlName="systemPrompt"
                  rows="6"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Instruções do sistema para a IA..."
                ></textarea>
              </div>

              <!-- User Prompt Template -->
              <div>
                <label for="prompt-user" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Prompt Template <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="prompt-user"
                  formControlName="userPromptTemplate"
                  rows="6"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Template do prompt do usuário com placeholders {'{'}variavel{'}'}..."
                ></textarea>
              </div>

              <!-- Parameters -->
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <label for="prompt-temperature" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temperature</label>
                  <input id="prompt-temperature" formControlName="temperature" type="number" step="0.01" min="0" max="2"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label for="prompt-max-tokens" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Tokens</label>
                  <input id="prompt-max-tokens" formControlName="maxTokens" type="number" min="100" max="100000"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label for="prompt-top-p" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Top P</label>
                  <input id="prompt-top-p" formControlName="topP" type="number" step="0.01" min="0" max="1"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label for="prompt-freq-penalty" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Freq. Penalty</label>
                  <input id="prompt-freq-penalty" formControlName="frequencyPenalty" type="number" step="0.01" min="0" max="2"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label for="prompt-pres-penalty" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pres. Penalty</label>
                  <input id="prompt-pres-penalty" formControlName="presencePenalty" type="number" step="0.01" min="0" max="2"
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  (click)="closeFormDialog()"
                  class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="submitting() || promptForm.invalid"
                  class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ submitting() ? 'Salvando...' : (editingId() ? 'Salvar' : 'Criar') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Clone Dialog -->
    @if (showCloneDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/50"
          (click)="closeCloneDialog()"
          (keydown.escape)="closeCloneDialog()"
          role="presentation"
        ></div>
        <div
          class="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl"
          role="dialog"
          aria-labelledby="clone-dialog-title"
        >
          <div class="p-6 space-y-4">
            <h3 id="clone-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">Clonar Prompt</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Criando nova versão baseada em <strong>{{ cloningPrompt()?.name }}</strong> (v{{ cloningPrompt()?.version }})
            </p>
            <form [formGroup]="cloneForm" (ngSubmit)="submitClone()" class="space-y-4">
              <div>
                <label for="clone-version" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nova Versão <span class="text-red-500">*</span>
                </label>
                <input
                  id="clone-version"
                  formControlName="newVersion"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="2.0.0"
                />
              </div>
              <div>
                <label for="clone-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome (opcional)
                </label>
                <input
                  id="clone-name"
                  formControlName="name"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Nome personalizado (opcional)"
                />
              </div>
              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeCloneDialog()"
                  class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="submitting() || cloneForm.invalid"
                  class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ submitting() ? 'Clonando...' : 'Clonar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Diff Dialog -->
    @if (showDiffDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/50"
          (click)="closeDiffDialog()"
          (keydown.escape)="closeDiffDialog()"
          role="presentation"
        ></div>
        <div
          class="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-xl"
          role="dialog"
          aria-labelledby="diff-dialog-title"
        >
          <div class="p-6 space-y-4">
            <h3 id="diff-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">Comparação de Prompts</h3>

            <!-- Diff Selector -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="diff-a" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt A</label>
                <select
                  id="diff-a"
                  [ngModel]="diffIdA()"
                  (ngModelChange)="diffIdA.set($event)"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                >
                  <option value="">Selecionar...</option>
                  @for (p of prompts(); track p.id) {
                    <option [value]="p.id">{{ p.name }} (v{{ p.version }})</option>
                  }
                </select>
              </div>
              <div>
                <label for="diff-b" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt B</label>
                <select
                  id="diff-b"
                  [ngModel]="diffIdB()"
                  (ngModelChange)="diffIdB.set($event)"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                >
                  <option value="">Selecionar...</option>
                  @for (p of prompts(); track p.id) {
                    <option [value]="p.id">{{ p.name }} (v{{ p.version }})</option>
                  }
                </select>
              </div>
            </div>

            <button
              type="button"
              (click)="executeDiff()"
              [disabled]="!diffIdA() || !diffIdB() || diffLoading()"
              class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ diffLoading() ? 'Comparando...' : 'Comparar' }}
            </button>

            <!-- Diff Result -->
            @if (diffResult()) {
              <div class="grid grid-cols-2 gap-4 mt-4">
                <!-- Prompt A -->
                <div class="space-y-3">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ diffResult()!.promptA.name }} (v{{ diffResult()!.promptA.version }})
                  </h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <span class="text-gray-500">Temperature: <strong>{{ diffResult()!.promptA.temperature }}</strong></span>
                    <span class="text-gray-500">Max Tokens: <strong>{{ diffResult()!.promptA.maxTokens }}</strong></span>
                    <span class="text-gray-500">Top P: <strong>{{ diffResult()!.promptA.topP }}</strong></span>
                    <span class="text-gray-500">Freq: <strong>{{ diffResult()!.promptA.frequencyPenalty }}</strong></span>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-1">System Prompt</p>
                    <pre class="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border max-h-40 overflow-y-auto">{{ diffResult()!.promptA.systemPrompt }}</pre>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-1">User Template</p>
                    <pre class="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border max-h-40 overflow-y-auto">{{ diffResult()!.promptA.userPromptTemplate }}</pre>
                  </div>
                </div>

                <!-- Prompt B -->
                <div class="space-y-3">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ diffResult()!.promptB.name }} (v{{ diffResult()!.promptB.version }})
                  </h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <span [class]="diffResult()!.promptA.temperature !== diffResult()!.promptB.temperature ? 'text-amber-600 font-semibold' : 'text-gray-500'">Temperature: <strong>{{ diffResult()!.promptB.temperature }}</strong></span>
                    <span [class]="diffResult()!.promptA.maxTokens !== diffResult()!.promptB.maxTokens ? 'text-amber-600 font-semibold' : 'text-gray-500'">Max Tokens: <strong>{{ diffResult()!.promptB.maxTokens }}</strong></span>
                    <span [class]="diffResult()!.promptA.topP !== diffResult()!.promptB.topP ? 'text-amber-600 font-semibold' : 'text-gray-500'">Top P: <strong>{{ diffResult()!.promptB.topP }}</strong></span>
                    <span [class]="diffResult()!.promptA.frequencyPenalty !== diffResult()!.promptB.frequencyPenalty ? 'text-amber-600 font-semibold' : 'text-gray-500'">Freq: <strong>{{ diffResult()!.promptB.frequencyPenalty }}</strong></span>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-1">System Prompt</p>
                    <pre [class]="'whitespace-pre-wrap text-xs p-3 rounded-lg border max-h-40 overflow-y-auto ' + (diffResult()!.promptA.systemPrompt !== diffResult()!.promptB.systemPrompt ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-900')">{{ diffResult()!.promptB.systemPrompt }}</pre>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-1">User Template</p>
                    <pre [class]="'whitespace-pre-wrap text-xs p-3 rounded-lg border max-h-40 overflow-y-auto ' + (diffResult()!.promptA.userPromptTemplate !== diffResult()!.promptB.userPromptTemplate ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-900')">{{ diffResult()!.promptB.userPromptTemplate }}</pre>
                  </div>
                </div>
              </div>
            }

            <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                (click)="closeDiffDialog()"
                class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation -->
    @if (deleteMessage()) {
      <app-confirm-dialog
        [message]="deleteMessage()!"
        (confirmed)="executeDelete()"
        (cancelled)="deleteMessage.set(null); deletingId.set(null)"
      />
    }
  `,
})
export class AiPromptsPageComponent implements OnInit {
  private readonly aiService = inject(AdminAiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // List state
  readonly prompts = signal<AdminAiPromptListItem[]>([]);
  readonly pagination = signal<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly typeFilter = signal<string>('');
  readonly statusFilter = signal<string>('');

  // Form dialog
  readonly showFormDialog = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);

  // Detail dialog
  readonly showDetailDialog = signal(false);
  readonly detailPrompt = signal<AdminAiPromptDetail | null>(null);

  // Clone dialog
  readonly showCloneDialog = signal(false);
  readonly cloningPrompt = signal<AdminAiPromptListItem | null>(null);

  // Diff dialog
  readonly showDiffDialog = signal(false);
  readonly diffIdA = signal<string>('');
  readonly diffIdB = signal<string>('');
  readonly diffResult = signal<{ promptA: AdminAiPromptDiffItem; promptB: AdminAiPromptDiffItem } | null>(null);
  readonly diffLoading = signal(false);

  // Delete confirmation
  readonly deleteMessage = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  // Forms
  readonly promptForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    type: ['', [Validators.required]],
    version: ['1.0.0', [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
    description: [''],
    systemPrompt: ['', [Validators.required, Validators.minLength(10)]],
    userPromptTemplate: ['', [Validators.required, Validators.minLength(10)]],
    temperature: [0.3, [Validators.min(0), Validators.max(2)]],
    maxTokens: [3000, [Validators.min(100), Validators.max(100000)]],
    topP: [1, [Validators.min(0), Validators.max(1)]],
    frequencyPenalty: [0.3, [Validators.min(0), Validators.max(2)]],
    presencePenalty: [0.1, [Validators.min(0), Validators.max(2)]],
  });

  readonly cloneForm = this.fb.group({
    newVersion: ['', [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
    name: [''],
  });

  ngOnInit(): void {
    this.loadPrompts();
  }

  loadPrompts(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: { page: number; limit: number; type?: PromptType; status?: PromptStatus } = {
      page: this.pagination().page,
      limit: this.pagination().limit,
    };

    const typeVal = this.typeFilter();
    if (typeVal) {
      query.type = typeVal as PromptType;
    }
    const statusVal = this.statusFilter();
    if (statusVal) {
      query.status = statusVal as PromptStatus;
    }

    this.aiService.listPrompts(query).subscribe({
      next: (res) => {
        this.prompts.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar prompts.');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadPrompts();
  }

  // ═══════ Detail ═══════

  viewPrompt(prompt: AdminAiPromptListItem): void {
    this.aiService.getPromptById(prompt.id).subscribe({
      next: (detail) => {
        this.detailPrompt.set(detail);
        this.showDetailDialog.set(true);
      },
      error: () => {
        this.toast.error('Erro ao carregar detalhes do prompt.');
      },
    });
  }

  closeDetailDialog(): void {
    this.showDetailDialog.set(false);
    this.detailPrompt.set(null);
  }

  // ═══════ Create/Edit ═══════

  openCreateDialog(): void {
    this.editingId.set(null);
    this.promptForm.reset({
      name: '',
      slug: '',
      type: '',
      version: '1.0.0',
      description: '',
      systemPrompt: '',
      userPromptTemplate: '',
      temperature: 0.3,
      maxTokens: 3000,
      topP: 1,
      frequencyPenalty: 0.3,
      presencePenalty: 0.1,
    });
    this.showFormDialog.set(true);
  }

  openEditDialog(id: string): void {
    this.aiService.getPromptById(id).subscribe({
      next: (detail) => {
        this.editingId.set(id);
        this.promptForm.patchValue({
          name: detail.name,
          slug: detail.slug,
          type: detail.type,
          version: detail.version,
          description: detail.description ?? '',
          systemPrompt: detail.systemPrompt,
          userPromptTemplate: detail.userPromptTemplate,
          temperature: detail.temperature,
          maxTokens: detail.maxTokens,
          topP: detail.topP,
          frequencyPenalty: detail.frequencyPenalty,
          presencePenalty: detail.presencePenalty,
        });
        this.showFormDialog.set(true);
      },
      error: () => {
        this.toast.error('Erro ao carregar prompt para edição.');
      },
    });
  }

  closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.editingId.set(null);
  }

  submitForm(): void {
    if (this.promptForm.invalid) {
      return;
    }

    this.submitting.set(true);
    const raw = this.promptForm.getRawValue();

    if (this.editingId()) {
      this.aiService.updatePrompt(this.editingId()!, {
        name: raw.name ?? undefined,
        slug: raw.slug ?? undefined,
        type: (raw.type as PromptType) || undefined,
        version: raw.version ?? undefined,
        description: raw.description || null,
        systemPrompt: raw.systemPrompt ?? undefined,
        userPromptTemplate: raw.userPromptTemplate ?? undefined,
        temperature: raw.temperature ?? undefined,
        maxTokens: raw.maxTokens ?? undefined,
        topP: raw.topP ?? undefined,
        frequencyPenalty: raw.frequencyPenalty ?? undefined,
        presencePenalty: raw.presencePenalty ?? undefined,
      }).subscribe({
        next: () => {
          this.toast.success('Prompt atualizado com sucesso!');
          this.closeFormDialog();
          this.submitting.set(false);
          this.loadPrompts();
        },
        error: () => {
          this.toast.error('Erro ao atualizar prompt.');
          this.submitting.set(false);
        },
      });
    } else {
      this.aiService.createPrompt({
        name: raw.name!,
        slug: raw.slug!,
        type: raw.type as PromptType,
        version: raw.version!,
        description: raw.description || null,
        systemPrompt: raw.systemPrompt!,
        userPromptTemplate: raw.userPromptTemplate!,
        temperature: raw.temperature!,
        maxTokens: raw.maxTokens!,
        topP: raw.topP!,
        frequencyPenalty: raw.frequencyPenalty!,
        presencePenalty: raw.presencePenalty!,
      }).subscribe({
        next: () => {
          this.toast.success('Prompt criado com sucesso!');
          this.closeFormDialog();
          this.submitting.set(false);
          this.loadPrompts();
        },
        error: () => {
          this.toast.error('Erro ao criar prompt.');
          this.submitting.set(false);
        },
      });
    }
  }

  // ═══════ Status ═══════

  activatePrompt(prompt: AdminAiPromptListItem): void {
    this.aiService.changePromptStatus(prompt.id, { status: 'active' }).subscribe({
      next: (res) => {
        const msg = res.previousActiveId
          ? 'Prompt ativado! O prompt anterior foi desativado automaticamente.'
          : 'Prompt ativado com sucesso!';
        this.toast.success(msg);
        this.loadPrompts();
      },
      error: () => {
        this.toast.error('Erro ao ativar prompt.');
      },
    });
  }

  deactivatePrompt(prompt: AdminAiPromptListItem): void {
    this.aiService.changePromptStatus(prompt.id, { status: 'inactive' }).subscribe({
      next: () => {
        this.toast.success('Prompt desativado com sucesso!');
        this.loadPrompts();
      },
      error: () => {
        this.toast.error('Erro ao desativar prompt.');
      },
    });
  }

  // ═══════ Clone ═══════

  openCloneDialog(prompt: AdminAiPromptListItem): void {
    this.cloningPrompt.set(prompt);
    this.cloneForm.reset({ newVersion: '', name: '' });
    this.showCloneDialog.set(true);
  }

  closeCloneDialog(): void {
    this.showCloneDialog.set(false);
    this.cloningPrompt.set(null);
  }

  submitClone(): void {
    if (this.cloneForm.invalid || !this.cloningPrompt()) {
      return;
    }

    this.submitting.set(true);
    const raw = this.cloneForm.getRawValue();

    this.aiService.clonePrompt(this.cloningPrompt()!.id, {
      newVersion: raw.newVersion!,
      name: raw.name || undefined,
    }).subscribe({
      next: () => {
        this.toast.success('Prompt clonado com sucesso!');
        this.closeCloneDialog();
        this.submitting.set(false);
        this.loadPrompts();
      },
      error: () => {
        this.toast.error('Erro ao clonar prompt.');
        this.submitting.set(false);
      },
    });
  }

  // ═══════ Diff ═══════

  openDiffDialog(): void {
    this.diffIdA.set('');
    this.diffIdB.set('');
    this.diffResult.set(null);
    this.showDiffDialog.set(true);
  }

  closeDiffDialog(): void {
    this.showDiffDialog.set(false);
    this.diffResult.set(null);
  }

  executeDiff(): void {
    if (!this.diffIdA() || !this.diffIdB()) {
      return;
    }

    this.diffLoading.set(true);
    this.aiService.diffPrompts(this.diffIdA(), this.diffIdB()).subscribe({
      next: (result) => {
        this.diffResult.set(result);
        this.diffLoading.set(false);
      },
      error: () => {
        this.toast.error('Erro ao comparar prompts.');
        this.diffLoading.set(false);
      },
    });
  }

  // ═══════ Delete ═══════

  confirmDelete(prompt: AdminAiPromptListItem): void {
    this.deletingId.set(prompt.id);
    this.deleteMessage.set(`Tem certeza que deseja excluir o prompt "${prompt.name}" (v${prompt.version})?`);
  }

  executeDelete(): void {
    const id = this.deletingId();
    if (!id) {
      return;
    }

    this.aiService.deletePrompt(id).subscribe({
      next: () => {
        this.toast.success('Prompt excluído com sucesso!');
        this.deleteMessage.set(null);
        this.deletingId.set(null);
        this.loadPrompts();
      },
      error: () => {
        this.toast.error('Erro ao excluir prompt. Verifique se não possui gerações associadas.');
        this.deleteMessage.set(null);
        this.deletingId.set(null);
      },
    });
  }

  // ═══════ Helpers ═══════

  getTypeLabel(type: string): string {
    return PROMPT_TYPE_LABELS[type as PromptType] ?? type;
  }

  getStatusLabel(status: string): string {
    return PROMPT_STATUS_LABELS[status as PromptStatus] ?? status;
  }

  getStatusColor(status: string): string {
    return PROMPT_STATUS_COLORS[status as PromptStatus] ?? 'bg-gray-100 text-gray-800';
  }
}
