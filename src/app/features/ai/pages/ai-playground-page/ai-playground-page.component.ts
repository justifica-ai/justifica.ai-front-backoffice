import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminAiService } from '../../services/admin-ai.service';
import type {
  AdminAiPromptListItem,
  AdminAiModelListItem,
  PlaygroundExecuteResponse,
  PromptType,
} from '../../models/ai.model';
import { PROMPT_TYPE_LABELS } from '../../models/ai.model';

@Component({
  selector: 'app-ai-playground-page',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Playground de IA</h2>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            [ngModel]="compareMode()"
            (ngModelChange)="onCompareModeChange($event)"
            class="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
            aria-label="Ativar modo de comparação"
          />
          Modo comparação
        </label>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- ═══════ Left Panel: Configuration ═══════ -->
      <div class="space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            {{ compareMode() ? 'Configuração A' : 'Configuração' }}
          </h3>

          <!-- Prompt Type -->
          <div class="mb-3">
            <label for="prompt-type-a" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Tipo de prompt <span class="text-red-500" aria-hidden="true">*</span>
              <span class="sr-only">(obrigatório)</span>
            </label>
            <select
              id="prompt-type-a"
              [ngModel]="selectedPromptTypeA()"
              (ngModelChange)="selectedPromptTypeA.set($event)"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-brand-500 focus:border-brand-500"
              aria-label="Selecionar tipo de prompt para configuração A"
            >
              <option value="">Selecione o tipo</option>
              @for (type of promptTypes; track type.value) {
                <option [value]="type.value">{{ type.label }}</option>
              }
            </select>
          </div>

          <!-- Prompt Selector -->
          <div class="mb-3">
            <label for="prompt-a" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Prompt <span class="text-red-500" aria-hidden="true">*</span>
              <span class="sr-only">(obrigatório)</span>
            </label>
            @if (loadingPrompts()) {
              <div class="w-full h-9 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse" role="status" aria-label="Carregando prompts"></div>
            } @else {
              <select
                id="prompt-a"
                [ngModel]="selectedPromptIdA()"
                (ngModelChange)="selectedPromptIdA.set($event)"
                class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-brand-500 focus:border-brand-500"
                aria-label="Selecionar prompt para configuração A"
              >
                <option value="">Selecione o prompt</option>
                @for (prompt of prompts(); track prompt.id) {
                  <option [value]="prompt.id">{{ prompt.name }} (v{{ prompt.version }})</option>
                }
              </select>
            }
          </div>

          <!-- Model Selector -->
          <div class="mb-3">
            <label for="model-a" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Modelo <span class="text-red-500" aria-hidden="true">*</span>
              <span class="sr-only">(obrigatório)</span>
            </label>
            @if (loadingModels()) {
              <div class="w-full h-9 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse" role="status" aria-label="Carregando modelos"></div>
            } @else {
              <select
                id="model-a"
                [ngModel]="selectedModelIdA()"
                (ngModelChange)="selectedModelIdA.set($event)"
                class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-brand-500 focus:border-brand-500"
                aria-label="Selecionar modelo para configuração A"
              >
                <option value="">Selecione o modelo</option>
                @for (model of models(); track model.id) {
                  <option [value]="model.id">{{ model.providerName }} — {{ model.name }}</option>
                }
              </select>
            }
          </div>

          <!-- Load Test Data -->
          <button
            type="button"
            (click)="loadTestData()"
            [disabled]="!selectedPromptTypeA() || loadingTestData()"
            class="w-full mb-3 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Carregar dados de teste"
          >
            @if (loadingTestData()) {
              <span class="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
              Carregando...
            } @else {
              Carregar dados de teste
            }
          </button>

          <!-- Test Data Fields -->
          @if (testDataKeys().length > 0) {
            <div class="border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-64 overflow-y-auto">
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Dados de teste (editáveis)</p>
              @for (key of testDataKeys(); track key) {
                <div class="mb-2">
                  <label [for]="'td-' + key" class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">{{ key }}</label>
                  <input
                    [id]="'td-' + key"
                    type="text"
                    [ngModel]="testData()[key]"
                    (ngModelChange)="updateTestDataField(key, $event)"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:ring-brand-500 focus:border-brand-500"
                    [attr.aria-label]="'Valor para ' + key"
                  />
                </div>
              }
            </div>
          }
        </div>

        <!-- Config B (Compare Mode) -->
        @if (compareMode()) {
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700 p-4">
            <h3 class="text-sm font-medium text-amber-700 dark:text-amber-300 mb-4">Configuração B</h3>

            <!-- Prompt Selector B -->
            <div class="mb-3">
              <label for="prompt-b" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Prompt <span class="text-red-500" aria-hidden="true">*</span>
                <span class="sr-only">(obrigatório)</span>
              </label>
              <select
                id="prompt-b"
                [ngModel]="selectedPromptIdB()"
                (ngModelChange)="selectedPromptIdB.set($event)"
                class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-brand-500 focus:border-brand-500"
                aria-label="Selecionar prompt para configuração B"
              >
                <option value="">Selecione o prompt</option>
                @for (prompt of prompts(); track prompt.id) {
                  <option [value]="prompt.id">{{ prompt.name }} (v{{ prompt.version }})</option>
                }
              </select>
            </div>

            <!-- Model Selector B -->
            <div class="mb-3">
              <label for="model-b" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Modelo <span class="text-red-500" aria-hidden="true">*</span>
                <span class="sr-only">(obrigatório)</span>
              </label>
              <select
                id="model-b"
                [ngModel]="selectedModelIdB()"
                (ngModelChange)="selectedModelIdB.set($event)"
                class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-brand-500 focus:border-brand-500"
                aria-label="Selecionar modelo para configuração B"
              >
                <option value="">Selecione o modelo</option>
                @for (model of models(); track model.id) {
                  <option [value]="model.id">{{ model.providerName }} — {{ model.name }}</option>
                }
              </select>
            </div>
          </div>
        }

        <!-- Execute Button -->
        <button
          type="button"
          (click)="executeGeneration()"
          [disabled]="!canExecute() || executing()"
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          [attr.aria-label]="compareMode() ? 'Executar comparação' : 'Executar geração'"
        >
          @if (executing()) {
            <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
            {{ compareMode() ? 'Comparando...' : 'Gerando...' }}
          } @else {
            {{ compareMode() ? 'Comparar' : 'Executar' }}
          }
        </button>
      </div>

      <!-- ═══════ Right Panel: Results ═══════ -->
      <div class="space-y-4">
        @if (executing()) {
          <!-- Skeleton -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse" role="status" aria-label="Carregando resultado">
            <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div class="space-y-2">
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/6"></div>
            </div>
          </div>
        } @else if (resultA()) {
          <!-- Result A -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {{ compareMode() ? 'Resultado A' : 'Resultado' }}
            </h3>

            <!-- Metrics -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400">Tokens</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ resultA()!.metrics.totalTokens }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400">Duração</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ formatDuration(resultA()!.metrics.durationMs) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400">Custo</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">$ {{ resultA()!.metrics.estimatedCost.toFixed(4) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400">Modelo</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" [title]="resultA()!.metrics.modelName">{{ resultA()!.metrics.modelName }}</p>
              </div>
            </div>

            <!-- Rendered Prompts (Collapsible) -->
            <details class="mb-3">
              <summary class="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                Prompts renderizados
              </summary>
              <div class="mt-2 space-y-2">
                <div>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">System Prompt</p>
                  <pre class="text-xs bg-gray-50 dark:bg-gray-900 rounded p-2 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 max-h-40">{{ resultA()!.renderedSystemPrompt }}</pre>
                </div>
                <div>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">User Prompt</p>
                  <pre class="text-xs bg-gray-50 dark:bg-gray-900 rounded p-2 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 max-h-40">{{ resultA()!.renderedUserPrompt }}</pre>
                </div>
              </div>
            </details>

            <!-- Generated Content -->
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Conteúdo gerado</p>
              <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {{ resultA()!.content }}
              </div>
            </div>
          </div>

          <!-- Result B (Compare Mode) -->
          @if (compareMode() && resultB()) {
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700 p-4">
              <h3 class="text-sm font-medium text-amber-700 dark:text-amber-300 mb-3">Resultado B</h3>

              <!-- Metrics B -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-center">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Tokens</p>
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ resultB()!.metrics.totalTokens }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-center">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Duração</p>
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ formatDuration(resultB()!.metrics.durationMs) }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-center">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Custo</p>
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">$ {{ resultB()!.metrics.estimatedCost.toFixed(4) }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-center">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Modelo</p>
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" [title]="resultB()!.metrics.modelName">{{ resultB()!.metrics.modelName }}</p>
                </div>
              </div>

              <!-- Rendered Prompts B -->
              <details class="mb-3">
                <summary class="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Prompts renderizados
                </summary>
                <div class="mt-2 space-y-2">
                  <div>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">System Prompt</p>
                    <pre class="text-xs bg-gray-50 dark:bg-gray-900 rounded p-2 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 max-h-40">{{ resultB()!.renderedSystemPrompt }}</pre>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">User Prompt</p>
                    <pre class="text-xs bg-gray-50 dark:bg-gray-900 rounded p-2 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 max-h-40">{{ resultB()!.renderedUserPrompt }}</pre>
                  </div>
                </div>
              </details>

              <!-- Generated Content B -->
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Conteúdo gerado</p>
                <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {{ resultB()!.content }}
                </div>
              </div>
            </div>
          }
        } @else {
          <!-- Empty State -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Nenhuma geração executada</p>
            <p class="text-xs text-gray-400 dark:text-gray-500">
              Selecione um prompt, um modelo e carregue os dados de teste para começar.
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AiPlaygroundPageComponent implements OnInit {
  private readonly aiService = inject(AdminAiService);
  private readonly toast = inject(ToastService);

  // ─── Loading States ───
  readonly loadingPrompts = signal(false);
  readonly loadingModels = signal(false);
  readonly loadingTestData = signal(false);
  readonly executing = signal(false);

  // ─── Data ───
  readonly prompts = signal<AdminAiPromptListItem[]>([]);
  readonly models = signal<AdminAiModelListItem[]>([]);
  readonly testData = signal<Record<string, string>>({});
  readonly testDataKeys = computed(() => Object.keys(this.testData()));

  // ─── Config A ───
  readonly selectedPromptTypeA = signal<PromptType | ''>('');
  readonly selectedPromptIdA = signal('');
  readonly selectedModelIdA = signal('');

  // ─── Config B (compare mode) ───
  readonly compareMode = signal(false);
  readonly selectedPromptIdB = signal('');
  readonly selectedModelIdB = signal('');

  // ─── Results ───
  readonly resultA = signal<PlaygroundExecuteResponse | null>(null);
  readonly resultB = signal<PlaygroundExecuteResponse | null>(null);

  // ─── Derived ───
  readonly canExecute = computed(() => {
    const hasA = this.selectedPromptIdA() !== '' && this.selectedModelIdA() !== '' && this.testDataKeys().length > 0;
    if (this.compareMode()) {
      return hasA && this.selectedPromptIdB() !== '' && this.selectedModelIdB() !== '';
    }
    return hasA;
  });

  readonly promptTypes = [
    { value: 'defesa_previa' as PromptType, label: PROMPT_TYPE_LABELS['defesa_previa'] },
    { value: 'recurso_1a_instancia' as PromptType, label: PROMPT_TYPE_LABELS['recurso_1a_instancia'] },
    { value: 'recurso_2a_instancia' as PromptType, label: PROMPT_TYPE_LABELS['recurso_2a_instancia'] },
  ];

  ngOnInit(): void {
    this.fetchPrompts();
    this.fetchModels();
  }

  onCompareModeChange(value: boolean): void {
    this.compareMode.set(value);
    if (!value) {
      this.selectedPromptIdB.set('');
      this.selectedModelIdB.set('');
      this.resultB.set(null);
    }
  }

  updateTestDataField(key: string, value: string): void {
    this.testData.update((current) => ({ ...current, [key]: value }));
  }

  loadTestData(): void {
    const promptType = this.selectedPromptTypeA();
    if (!promptType) {
      return;
    }

    this.loadingTestData.set(true);
    this.aiService.getTestData(promptType).subscribe({
      next: (response) => {
        this.testData.set(response.placeholders);
        this.loadingTestData.set(false);
        this.toast.success('Dados de teste carregados');
      },
      error: () => {
        this.loadingTestData.set(false);
        this.toast.error('Erro ao carregar dados de teste');
      },
    });
  }

  executeGeneration(): void {
    if (!this.canExecute()) {
      return;
    }

    this.executing.set(true);
    this.resultA.set(null);
    this.resultB.set(null);

    if (this.compareMode()) {
      this.aiService.comparePlayground({
        configA: {
          promptId: this.selectedPromptIdA(),
          modelId: this.selectedModelIdA(),
          testData: this.testData(),
        },
        configB: {
          promptId: this.selectedPromptIdB(),
          modelId: this.selectedModelIdB(),
          testData: this.testData(),
        },
      }).subscribe({
        next: (response) => {
          this.resultA.set(response.resultA);
          this.resultB.set(response.resultB);
          this.executing.set(false);
          this.toast.success('Comparação concluída');
        },
        error: () => {
          this.executing.set(false);
          this.toast.error('Erro ao executar comparação');
        },
      });
    } else {
      this.aiService.executePlayground({
        promptId: this.selectedPromptIdA(),
        modelId: this.selectedModelIdA(),
        testData: this.testData(),
      }).subscribe({
        next: (response) => {
          this.resultA.set(response);
          this.executing.set(false);
          this.toast.success('Geração concluída');
        },
        error: () => {
          this.executing.set(false);
          this.toast.error('Erro ao executar geração');
        },
      });
    }
  }

  formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  }

  private fetchPrompts(): void {
    this.loadingPrompts.set(true);
    this.aiService.listPrompts({ page: 1, limit: 100, status: 'active' }).subscribe({
      next: (response) => {
        this.prompts.set(response.data);
        this.loadingPrompts.set(false);
      },
      error: () => {
        this.loadingPrompts.set(false);
        this.toast.error('Erro ao carregar prompts');
      },
    });
  }

  private fetchModels(): void {
    this.loadingModels.set(true);
    this.aiService.listModels({ page: 1, limit: 100, active: 'true' }).subscribe({
      next: (response) => {
        this.models.set(response.data);
        this.loadingModels.set(false);
      },
      error: () => {
        this.loadingModels.set(false);
        this.toast.error('Erro ao carregar modelos');
      },
    });
  }
}
