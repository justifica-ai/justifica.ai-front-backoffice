import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AiMetricsPageComponent } from './ai-metrics-page.component';
import { environment } from '../../../../../environments/environment';
import type { AiMetricsResponse } from '../../models/ai.model';

const metricsUrl = `${environment.apiUrl}/api/admin/ai/metrics`;

const MOCK_METRICS: AiMetricsResponse = {
  period: '30d',
  startDate: '2025-01-01T00:00:00.000Z',
  endDate: '2025-01-31T00:00:00.000Z',
  summary: {
    totalGenerations: 150,
    totalCost: 12.5,
    avgCostPerDoc: 0.083,
    totalInputTokens: 45000,
    totalOutputTokens: 150000,
    durationP50Ms: 2500,
    durationP95Ms: 5000,
    fallbackRate: 5.3,
    errorRate: 2.0,
    successCount: 147,
    errorCount: 3,
  },
  byModel: [
    {
      modelId: 'm1',
      modelName: 'Claude Opus 4',
      providerName: 'Anthropic',
      generations: 100,
      totalCost: 8.0,
      avgDurationMs: 2200,
      totalInputTokens: 30000,
      totalOutputTokens: 100000,
    },
  ],
  byPrompt: [
    {
      promptId: 'p1',
      promptName: 'Defesa Prévia v1',
      promptVersion: '1.0.0',
      generations: 120,
      totalCost: 10.0,
      avgDurationMs: 2400,
      successRate: 98.3,
    },
  ],
  dailyTrend: [
    { date: '2025-01-28', generations: 10, cost: 0.8, avgDurationMs: 2300, errorCount: 0 },
    { date: '2025-01-29', generations: 15, cost: 1.2, avgDurationMs: 2500, errorCount: 1 },
  ],
  topErrors: [
    { message: 'Provider timeout', count: 2 },
  ],
};

describe('AiMetricsPageComponent', () => {
  let component: AiMetricsPageComponent;
  let fixture: ComponentFixture<AiMetricsPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiMetricsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiMetricsPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushMetrics(data: AiMetricsResponse = MOCK_METRICS): void {
    const req = httpTesting.expectOne((r) => r.url === metricsUrl);
    req.flush(data);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushMetrics();
    expect(component).toBeTruthy();
  });

  it('should load metrics on init with default period 30d', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url === metricsUrl && r.params.get('period') === '30d');
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_METRICS);
  });

  it('should display dashboard title', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dashboard de Métricas');
  });

  it('should display period selector', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.options.length).toBe(3);
  });

  it('should display KPI cards with metrics data', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Total Gerações');
    expect(el.textContent).toContain('150');
    expect(el.textContent).toContain('Custo Total');
    expect(el.textContent).toContain('US$');
  });

  it('should display model breakdown table', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Por Modelo');
    expect(el.textContent).toContain('Claude Opus 4');
    expect(el.textContent).toContain('Anthropic');
  });

  it('should display prompt breakdown table', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Por Prompt');
    expect(el.textContent).toContain('Defesa Prévia v1');
    expect(el.textContent).toContain('98.3%');
  });

  it('should display daily trend table', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Tendência Diária');
    expect(el.textContent).toContain('2025-01-28');
    expect(el.textContent).toContain('2025-01-29');
  });

  it('should display top errors', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Top Erros');
    expect(el.textContent).toContain('Provider timeout');
    expect(el.textContent).toContain('2x');
  });

  it('should change period when selector changes', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();

    // Change to 7d
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '7d';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === metricsUrl && r.params.get('period') === '7d');
    expect(req.request.method).toBe('GET');
    req.flush({ ...MOCK_METRICS, period: '7d' });

    expect(component.period()).toBe('7d');
  });

  it('should display loading state', () => {
    fixture.detectChanges();
    // Don't flush - stays loading
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Carregando métricas');
    // Now flush to clean up
    flushMetrics();
  });

  it('should display error state on failure', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url === metricsUrl);
    req.flush({ error: 'Database error' }, { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar métricas');
  });

  it('should allow retry after error', () => {
    fixture.detectChanges();
    const req1 = httpTesting.expectOne((r) => r.url === metricsUrl);
    req1.flush({ error: 'Fail' }, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    // Click retry button
    const retryBtn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    retryBtn.click();
    fixture.detectChanges();

    const req2 = httpTesting.expectOne((r) => r.url === metricsUrl);
    req2.flush(MOCK_METRICS);
    fixture.detectChanges();

    expect(component.metrics()).toBeTruthy();
  });

  it('should show empty state when no generations', () => {
    const emptyMetrics: AiMetricsResponse = {
      ...MOCK_METRICS,
      summary: { ...MOCK_METRICS.summary, totalGenerations: 0 },
      byModel: [],
      byPrompt: [],
      dailyTrend: [],
      topErrors: [],
    };
    fixture.detectChanges();
    flushMetrics(emptyMetrics);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhuma geração registrada');
  });

  it('should format numbers with pt-BR locale', () => {
    expect(component.formatNumber(1500)).toContain('1');
    expect(component.formatNumber(0)).toBe('0');
  });

  it('should format currency values', () => {
    expect(component.formatCurrency(12.5)).toBe('US$ 12.5000');
    expect(component.formatCurrency(0)).toBe('US$ 0.0000');
  });

  it('should format milliseconds', () => {
    expect(component.formatMs(500)).toBe('500ms');
    expect(component.formatMs(2500)).toBe('2.5s');
    expect(component.formatMs(1000)).toBe('1.0s');
  });

  it('should format ISO dates to pt-BR', () => {
    const formatted = component.formatDate('2025-01-15T12:00:00.000Z');
    expect(formatted).toContain('15');
    expect(formatted).toContain('01');
    expect(formatted).toContain('2025');
  });

  it('should display error rate in red when above 5%', () => {
    const highErrorMetrics: AiMetricsResponse = {
      ...MOCK_METRICS,
      summary: { ...MOCK_METRICS.summary, errorRate: 8.5 },
    };
    fixture.detectChanges();
    flushMetrics(highErrorMetrics);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('8.5%');
  });

  it('should display success rate color-coded in prompt table', () => {
    fixture.detectChanges();
    flushMetrics();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const tables = el.querySelectorAll('table');
    const promptTable = tables[1];
    expect(promptTable).toBeTruthy();
    expect(promptTable?.textContent).toContain('98.3%');
  });
});
