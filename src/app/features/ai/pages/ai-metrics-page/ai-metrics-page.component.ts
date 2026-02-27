import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { AdminAiService } from '../../services/admin-ai.service';
import type { AiMetricsResponse, MetricsPeriod } from '../../models/ai.model';

@Component({
  selector: 'app-ai-metrics-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header + Period Selector -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Dashboard de Métricas</h2>
        <div class="flex items-center gap-2">
          <label for="period-select" class="text-sm text-gray-600 dark:text-gray-400">Período:</label>
          <select
            id="period-select"
            (change)="onPeriodChange($event)"
            [value]="period()"
            class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Selecionar período de métricas"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12" role="status" aria-label="Carregando métricas">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-400">Carregando métricas...</span>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" role="alert">
          <p class="text-red-800 dark:text-red-400 text-sm">Erro ao carregar métricas: {{ error() }}</p>
          <button
            type="button"
            (click)="loadMetrics()"
            class="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      }

      <!-- Metrics Content -->
      @if (metrics(); as data) {
        <!-- Period Info -->
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatDate(data.startDate) }} — {{ formatDate(data.endDate) }}
        </p>

        <!-- Summary KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Gerações</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatNumber(data.summary.totalGenerations) }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatNumber(data.summary.successCount) }} sucesso · {{ formatNumber(data.summary.errorCount) }} erro</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Custo Total</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatCurrency(data.summary.totalCost) }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Média: {{ formatCurrency(data.summary.avgCostPerDoc) }}/doc</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tokens Consumidos</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatNumber(data.summary.totalInputTokens + data.summary.totalOutputTokens) }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">In: {{ formatNumber(data.summary.totalInputTokens) }} · Out: {{ formatNumber(data.summary.totalOutputTokens) }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duração (P50 / P95)</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatMs(data.summary.durationP50Ms) }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">P95: {{ formatMs(data.summary.durationP95Ms) }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Taxa de Erro</p>
            <p class="mt-1 text-2xl font-bold" [class]="data.summary.errorRate > 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
              {{ data.summary.errorRate.toFixed(1) }}%
            </p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Taxa de Fallback</p>
            <p class="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{{ data.summary.fallbackRate.toFixed(1) }}%</p>
          </div>
        </div>

        <!-- By Model Table -->
        @if (data.byModel.length > 0) {
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Por Modelo</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-900/30">
                    <th class="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Modelo</th>
                    <th class="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Provedor</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Gerações</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Custo</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Duração Média</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Tokens (In/Out)</th>
                  </tr>
                </thead>
                <tbody>
                  @for (model of data.byModel; track model.modelId) {
                    <tr class="border-t border-gray-100 dark:border-gray-700/50">
                      <td class="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">{{ model.modelName }}</td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-400">{{ model.providerName }}</td>
                      <td class="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{{ formatNumber(model.generations) }}</td>
                      <td class="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{{ formatCurrency(model.totalCost) }}</td>
                      <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{{ formatMs(model.avgDurationMs) }}</td>
                      <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{{ formatNumber(model.totalInputTokens) }} / {{ formatNumber(model.totalOutputTokens) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- By Prompt Table -->
        @if (data.byPrompt.length > 0) {
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Por Prompt</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-900/30">
                    <th class="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Prompt</th>
                    <th class="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Versão</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Gerações</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Custo</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Duração Média</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Taxa de Sucesso</th>
                  </tr>
                </thead>
                <tbody>
                  @for (prompt of data.byPrompt; track prompt.promptId) {
                    <tr class="border-t border-gray-100 dark:border-gray-700/50">
                      <td class="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">{{ prompt.promptName }}</td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-400">{{ prompt.promptVersion }}</td>
                      <td class="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{{ formatNumber(prompt.generations) }}</td>
                      <td class="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{{ formatCurrency(prompt.totalCost) }}</td>
                      <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{{ formatMs(prompt.avgDurationMs) }}</td>
                      <td class="px-4 py-2 text-right">
                        <span [class]="prompt.successRate >= 95 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'">
                          {{ prompt.successRate.toFixed(1) }}%
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Daily Trend Table -->
        @if (data.dailyTrend.length > 0) {
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Tendência Diária</h3>
            </div>
            <div class="overflow-x-auto max-h-80 overflow-y-auto">
              <table class="w-full text-sm">
                <thead class="sticky top-0 bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th class="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Data</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Gerações</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Custo</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Duração Média</th>
                    <th class="text-right px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Erros</th>
                  </tr>
                </thead>
                <tbody>
                  @for (day of data.dailyTrend; track day.date) {
                    <tr class="border-t border-gray-100 dark:border-gray-700/50">
                      <td class="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">{{ day.date }}</td>
                      <td class="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{{ formatNumber(day.generations) }}</td>
                      <td class="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{{ formatCurrency(day.cost) }}</td>
                      <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{{ formatMs(day.avgDurationMs) }}</td>
                      <td class="px-4 py-2 text-right">
                        <span [class]="day.errorCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">
                          {{ day.errorCount }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Top Errors -->
        @if (data.topErrors.length > 0) {
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Top Erros</h3>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-700/50">
              @for (err of data.topErrors; track err.message) {
                <div class="flex items-center justify-between px-4 py-3">
                  <p class="text-sm text-gray-700 dark:text-gray-300 truncate max-w-md" [title]="err.message">{{ err.message }}</p>
                  <span class="ml-4 shrink-0 inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-400">
                    {{ err.count }}x
                  </span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Empty State -->
        @if (data.summary.totalGenerations === 0) {
          <div class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">Nenhuma geração registrada neste período.</p>
          </div>
        }
      }
    </div>
  `,
})
export class AiMetricsPageComponent implements OnInit {
  private readonly aiService = inject(AdminAiService);

  readonly period = signal<MetricsPeriod>('30d');
  readonly metrics = signal<AiMetricsResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly hasData = computed(() => this.metrics() !== null && !this.loading());

  ngOnInit(): void {
    this.loadMetrics();
  }

  onPeriodChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as MetricsPeriod;
    this.period.set(value);
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.aiService.getMetrics(this.period()).subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? err?.message ?? 'Erro desconhecido');
        this.loading.set(false);
      },
    });
  }

  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR');
  }

  formatCurrency(value: number): string {
    return `US$ ${value.toFixed(4)}`;
  }

  formatMs(ms: number): string {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${ms}ms`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
