import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSettingsService } from '../../services/admin-settings.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  SettingItem,
  SettingsGroup,
  SettingType,
  SETTINGS_GROUP_LABELS,
  SETTINGS_GROUP_ORDER,
} from '../../models/settings.model';

interface EditableSettingItem extends SettingItem {
  editValue: string;
  dirty: boolean;
  error: string | null;
}

interface EditableSettingsGroup {
  group: string | null;
  settings: EditableSettingItem[];
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Configurações do Sistema</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie as configurações da plataforma organizadas por categoria.
          </p>
        </div>
        @if (isSuperAdmin()) {
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            [class]="hasChanges() ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'"
            [disabled]="!hasChanges() || saving()"
            (click)="saveAll()"
          >
            @if (saving()) {
              <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            }
            Salvar alterações
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-6">
          @for (s of skeletonGroups; track s) {
            <div class="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div class="mb-4 h-6 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="space-y-4">
                @for (r of skeletonRows; track r) {
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div class="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div class="h-10 flex-1 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
          <button
            type="button"
            class="mt-3 text-sm font-medium text-red-600 underline hover:text-red-700 dark:text-red-400"
            (click)="loadSettings()"
          >
            Tentar novamente
          </button>
        </div>
      }

      <!-- Groups -->
      @if (!loading() && !error()) {
        @for (group of groups(); track group.group) {
          <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <!-- Group Header -->
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50 rounded-t-xl">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {{ getGroupLabel(group.group) }}
              </h2>
            </div>

            <!-- Settings List -->
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (setting of group.settings; track setting.key) {
                <div class="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-start sm:gap-6">
                  <!-- Label & Description -->
                  <div class="min-w-0 sm:w-1/3 sm:pt-2">
                    <label [for]="'setting-' + setting.key" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ setting.key }}
                    </label>
                    @if (setting.description) {
                      <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ setting.description }}</p>
                    }
                    <span class="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      [class]="getTypeBadgeClass(setting.type)">
                      {{ setting.type }}
                    </span>
                  </div>

                  <!-- Input -->
                  <div class="flex-1">
                    @if (!isSuperAdmin()) {
                      <!-- Read-only for non-super_admin -->
                      @if (setting.type === 'boolean') {
                        <span class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          @if (setting.value === 'true') {
                            <span class="h-3 w-3 rounded-full bg-green-500"></span> Ativado
                          } @else {
                            <span class="h-3 w-3 rounded-full bg-gray-400"></span> Desativado
                          }
                        </span>
                      } @else if (setting.type === 'json') {
                        <pre class="rounded-lg bg-gray-100 p-3 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400 overflow-x-auto">{{ formatJson(setting.value) }}</pre>
                      } @else {
                        <p class="text-sm text-gray-600 dark:text-gray-400 pt-2">{{ setting.value }}</p>
                      }
                    } @else {
                      <!-- Editable for super_admin -->
                      @if (setting.type === 'boolean') {
                        <button
                          type="button"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                                 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          [class]="setting.editValue === 'true' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'"
                          [attr.aria-checked]="setting.editValue === 'true'"
                          [attr.aria-label]="setting.key"
                          role="switch"
                          (click)="toggleBoolean(setting)"
                        >
                          <span
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                                   transition duration-200 ease-in-out"
                            [class]="setting.editValue === 'true' ? 'translate-x-5' : 'translate-x-0'"
                          ></span>
                        </button>
                      } @else if (setting.type === 'json') {
                        <textarea
                          [id]="'setting-' + setting.key"
                          class="block w-full rounded-lg border px-3 py-2 text-sm font-mono
                                 focus:outline-none focus:ring-2 focus:ring-primary-500
                                 dark:bg-gray-900 dark:text-gray-200"
                          [class]="setting.error ? 'border-red-300 dark:border-red-600' : setting.dirty ? 'border-primary-300 dark:border-primary-600' : 'border-gray-300 dark:border-gray-600'"
                          rows="4"
                          [ngModel]="setting.editValue"
                          (ngModelChange)="onValueChange(setting, $event)"
                          [attr.aria-label]="setting.key"
                        ></textarea>
                      } @else {
                        <input
                          [id]="'setting-' + setting.key"
                          [type]="setting.type === 'number' ? 'text' : 'text'"
                          class="block w-full rounded-lg border px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary-500
                                 dark:bg-gray-900 dark:text-gray-200"
                          [class]="setting.error ? 'border-red-300 dark:border-red-600' : setting.dirty ? 'border-primary-300 dark:border-primary-600' : 'border-gray-300 dark:border-gray-600'"
                          [ngModel]="setting.editValue"
                          (ngModelChange)="onValueChange(setting, $event)"
                          [attr.aria-label]="setting.key"
                        />
                      }
                      @if (setting.error) {
                        <p class="mt-1 text-xs text-red-500 dark:text-red-400">{{ setting.error }}</p>
                      }
                      @if (setting.dirty && !setting.error) {
                        <p class="mt-1 text-xs text-primary-500 dark:text-primary-400">Valor alterado</p>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (groups().length === 0) {
          <div class="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p class="text-sm text-gray-500 dark:text-gray-400">Nenhuma configuração encontrada.</p>
          </div>
        }
      }
    </div>
  `,
})
export class SettingsPageComponent implements OnInit {
  private readonly settingsService = inject(AdminSettingsService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly groups = signal<EditableSettingsGroup[]>([]);
  readonly isSuperAdmin = this.authService.isSuperAdmin;

  readonly skeletonGroups = [1, 2, 3];
  readonly skeletonRows = [1, 2, 3];

  readonly hasChanges = computed(() =>
    this.groups().some((g) => g.settings.some((s) => s.dirty)),
  );

  readonly hasErrors = computed(() =>
    this.groups().some((g) => g.settings.some((s) => s.error !== null)),
  );

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.settingsService.listSettings().subscribe({
      next: (response) => {
        const editableGroups = this.sortGroups(response.data).map((g) => ({
          group: g.group,
          settings: g.settings.map((s) => ({
            ...s,
            type: s.type as SettingType,
            editValue: s.value,
            dirty: false,
            error: null,
          })),
        }));
        this.groups.set(editableGroups);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as configurações. Verifique sua conexão.');
        this.loading.set(false);
      },
    });
  }

  saveAll(): void {
    if (!this.hasChanges() || this.hasErrors()) {
      return;
    }

    const changedSettings: { key: string; value: string }[] = [];
    for (const group of this.groups()) {
      for (const setting of group.settings) {
        if (setting.dirty && !setting.error) {
          changedSettings.push({ key: setting.key, value: setting.editValue });
        }
      }
    }

    if (changedSettings.length === 0) {
      return;
    }

    this.saving.set(true);

    this.settingsService.updateSettings({ settings: changedSettings }).subscribe({
      next: (response) => {
        const updatedMap = new Map(response.settings.map((s) => [s.key, s]));
        const currentGroups = this.groups();
        const newGroups = currentGroups.map((g) => ({
          ...g,
          settings: g.settings.map((s) => {
            const updated = updatedMap.get(s.key);
            if (updated) {
              return {
                ...s,
                value: updated.value,
                editValue: updated.value,
                updatedAt: updated.updatedAt,
                updatedBy: updated.updatedBy,
                dirty: false,
                error: null,
              };
            }
            return s;
          }),
        }));
        this.groups.set(newGroups);
        this.saving.set(false);
        this.toastService.success(`${response.updated} configuração(ões) salva(s) com sucesso.`);
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error('Erro ao salvar configurações. Tente novamente.');
      },
    });
  }

  onValueChange(setting: EditableSettingItem, value: string): void {
    setting.editValue = value;
    setting.dirty = value !== setting.value;
    setting.error = this.validateValue(value, setting.type);
    this.groups.update((gs) => [...gs]);
  }

  toggleBoolean(setting: EditableSettingItem): void {
    const newValue = setting.editValue === 'true' ? 'false' : 'true';
    this.onValueChange(setting, newValue);
  }

  getGroupLabel(group: string | null): string {
    if (!group) {
      return 'Geral';
    }
    return SETTINGS_GROUP_LABELS[group] ?? group;
  }

  getTypeBadgeClass(type: SettingType): string {
    switch (type) {
      case 'string':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'number':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'boolean':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'json':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  formatJson(value: string): string {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  validateValue(value: string, type: SettingType): string | null {
    if (type === 'number') {
      if (value === '' || isNaN(Number(value))) {
        return 'Valor deve ser um número válido.';
      }
    }
    if (type === 'boolean') {
      if (value !== 'true' && value !== 'false') {
        return 'Valor deve ser "true" ou "false".';
      }
    }
    if (type === 'json') {
      try {
        JSON.parse(value);
      } catch {
        return 'JSON inválido.';
      }
    }
    return null;
  }

  private sortGroups(groups: readonly SettingsGroup[]): SettingsGroup[] {
    return [...groups].sort((a, b) => {
      const ai = SETTINGS_GROUP_ORDER.indexOf(a.group ?? '');
      const bi = SETTINGS_GROUP_ORDER.indexOf(b.group ?? '');
      const aIdx = ai === -1 ? 999 : ai;
      const bIdx = bi === -1 ? 999 : bi;
      return aIdx - bIdx;
    });
  }
}
