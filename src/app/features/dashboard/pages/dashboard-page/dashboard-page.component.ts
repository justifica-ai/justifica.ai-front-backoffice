import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse } from '../../models/dashboard.model';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import {
  PeriodSelectorComponent,
  PeriodValue,
} from '../../components/period-selector/period-selector.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [KpiCardComponent, PeriodSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Visão geral do sistema</p>
      </div>
      <app-period-selector (periodChange)="onPeriodChange($event)" />
    </div>

    @if (loading()) {
      <!-- Skeleton Loader -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        @for (i of skeletonItems; track i) {
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        }
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (i of skeletonPair; track i) {
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse h-64"></div>
        }
      </div>
    } @else if (error()) {
      <!-- Error State -->
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar dados do dashboard.</p>
        <button
          type="button"
          (click)="loadDashboard()"
          class="mt-3 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    } @else if (data()) {
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <app-kpi-card
          label="Receita Bruta"
          [value]="formatCurrency(data()!.revenue.totalGross)"
          [variationPercent]="data()!.revenue.variation.grossPercent"
          subtitle="período selecionado"
        />
        <app-kpi-card
          label="Novos Usuários"
          [value]="data()!.users.newInPeriod.toString()"
          [variationPercent]="data()!.users.variation.newPercent"
          [subtitle]="data()!.users.total + ' total'"
        />
        <app-kpi-card
          label="Recursos Gerados"
          [value]="data()!.appeals.inPeriod.toString()"
          [variationPercent]="data()!.appeals.variation.percent"
          [subtitle]="data()!.appeals.total + ' total'"
        />
        <app-kpi-card
          label="Taxa de Conversão"
          [value]="data()!.users.conversionRate.toFixed(1) + '%'"
          subtitle="signup → pagamento"
        />
      </div>

      <!-- Second Row: Revenue + AI Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <!-- Revenue Details Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Receita</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Receita líquida</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(data()!.revenue.totalNet) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Ticket médio</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(data()!.revenue.averageTicket) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Transações totais</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ data()!.revenue.totalTransactions }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Transações pagas</span>
              <span class="text-sm font-semibold text-accent-600 dark:text-accent-400">{{ data()!.revenue.paidTransactions }}</span>
            </div>
          </div>
        </div>

        <!-- AI Metrics Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Inteligência Artificial</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Gerações</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ data()!.ai.totalGenerations }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Custo estimado</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(data()!.ai.estimatedCost) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Taxa de sucesso</span>
              <span class="text-sm font-semibold text-accent-600 dark:text-accent-400">{{ data()!.ai.successRate.toFixed(1) }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Taxa de fallback</span>
              <span class="text-sm font-semibold" [class]="data()!.ai.fallbackRate > 10 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'">{{ data()!.ai.fallbackRate.toFixed(1) }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Duração média</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ (data()!.ai.averageDurationMs / 1000).toFixed(1) }}s</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Third Row: Appeals Breakdown + Affiliates -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <!-- Appeals by Status -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recursos por Status</h2>
          @if (appealStatusEntries().length > 0) {
            <div class="space-y-2">
              @for (entry of appealStatusEntries(); track entry[0]) {
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" [class]="getStatusColor(entry[0])"></span>
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ formatStatusLabel(entry[0]) }}</span>
                  </div>
                  <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ entry[1] }}</span>
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-400 dark:text-gray-500">Nenhum recurso no período.</p>
          }
        </div>

        <!-- Affiliates Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Programa de Afiliados</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Total de afiliados</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ data()!.affiliates.total }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Afiliados ativos</span>
              <span class="text-sm font-semibold text-accent-600 dark:text-accent-400">{{ data()!.affiliates.active }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Comissões pendentes</span>
              <span class="text-sm font-semibold text-amber-600 dark:text-amber-400">{{ formatCurrency(data()!.affiliates.pendingCommissions) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Comissões totais</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(data()!.affiliates.totalCommissions) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Period Info Footer -->
      <div class="text-xs text-gray-400 dark:text-gray-500 text-right">
        Dados de {{ formatDate(data()!.period.from) }} a {{ formatDate(data()!.period.to) }}
      </div>
    }
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly toast = inject(ToastService);

  readonly data = signal<DashboardResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly skeletonItems = [1, 2, 3, 4];
  readonly skeletonPair = [1, 2];
  private currentPeriod: PeriodValue = '30d';

  readonly appealStatusEntries = computed(() => {
    const d = this.data();
    if (!d) return [];
    return Object.entries(d.appeals.byStatus);
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  onPeriodChange(period: PeriodValue): void {
    this.currentPeriod = period;
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(false);

    this.dashboardService.getDashboardMetrics({ period: this.currentPeriod }).subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.toast.error('Erro ao carregar dashboard', 'Tente novamente em alguns instantes.');
      },
    });
  }

  formatCurrency(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatStatusLabel(status: string): string {
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

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      draft: 'bg-gray-400',
      pending_payment: 'bg-amber-400',
      paid: 'bg-blue-400',
      generating: 'bg-purple-400',
      generated: 'bg-accent-500',
      failed: 'bg-red-500',
      cancelled: 'bg-gray-300',
    };
    return colors[status] ?? 'bg-gray-400';
  }
}
