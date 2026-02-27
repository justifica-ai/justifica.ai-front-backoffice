import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardResponse } from '../../models/dashboard.model';
import { environment } from '../../../../../environments/environment';

const MOCK_DASHBOARD: DashboardResponse = {
  period: { from: '2025-01-01T00:00:00Z', to: '2025-01-31T23:59:59Z', type: '30d' },
  revenue: {
    totalGross: '15000.00',
    totalNet: '12750.00',
    averageTicket: '49.90',
    totalTransactions: 300,
    paidTransactions: 250,
    previousPeriod: { totalGross: '12000.00', totalNet: '10200.00', totalTransactions: 240 },
    variation: { grossPercent: 25, netPercent: 25, transactionsPercent: 25 },
  },
  users: {
    total: 1500,
    newInPeriod: 120,
    activeInPeriod: 800,
    conversionRate: 15.5,
    previousPeriod: { newInPeriod: 100 },
    variation: { newPercent: 20 },
  },
  appeals: {
    total: 900,
    inPeriod: 150,
    byStatus: { draft: 10, paid: 50, generated: 80, failed: 10 },
    byType: { speed: 100, parking: 50 },
    previousPeriod: { inPeriod: 130 },
    variation: { percent: 15.38 },
  },
  ai: {
    totalGenerations: 200,
    totalTokens: 500000,
    estimatedCost: '25.50',
    averageDurationMs: 3500,
    fallbackRate: 5.2,
    successRate: 94.8,
    previousPeriod: { totalGenerations: 170, estimatedCost: '21.00' },
    variation: { generationsPercent: 17.6, costPercent: 21.4 },
  },
  affiliates: {
    total: 30,
    active: 12,
    pendingCommissions: '450.00',
    totalCommissions: '3200.00',
  },
};

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDashboardRequest(response: DashboardResponse = MOCK_DASHBOARD): void {
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/dashboard`,
    );
    req.flush(response);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
    // ngOnInit not yet called (no detectChanges), so no HTTP request pending
  });

  it('should start in loading state', () => {
    expect(component.loading()).toBe(true);
    expect(component.data()).toBeNull();
    // ngOnInit not yet called (no detectChanges), so no HTTP request pending
  });

  it('should load dashboard data on init', fakeAsync(() => {
    fixture.detectChanges();
    flushDashboardRequest();
    tick();

    expect(component.loading()).toBe(false);
    expect(component.data()).toEqual(MOCK_DASHBOARD);
    expect(component.error()).toBe(false);
  }));

  it('should show skeleton loader while loading', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const skeletons = el.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    httpTesting.expectOne((r) => r.url.includes('/api/admin/dashboard'));
  });

  it('should display KPI cards after data loads', fakeAsync(() => {
    fixture.detectChanges();
    flushDashboardRequest();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const kpiCards = el.querySelectorAll('app-kpi-card');
    expect(kpiCards.length).toBe(4);
  }));

  it('should show error state on API failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/dashboard`,
    );
    req.error(new ProgressEvent('Network error'), { status: 500, statusText: 'Server Error' });
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe(true);
    expect(component.loading()).toBe(false);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar dados do dashboard');
  }));

  it('should reload on period change', fakeAsync(() => {
    fixture.detectChanges();
    flushDashboardRequest();
    tick();

    component.onPeriodChange('7d');
    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/api/admin/dashboard` &&
        r.params.get('period') === '7d',
    );
    req.flush(MOCK_DASHBOARD);
    tick();

    expect(component.loading()).toBe(false);
    expect(component.data()).toEqual(MOCK_DASHBOARD);
  }));

  it('should retry on error button click', fakeAsync(() => {
    fixture.detectChanges();
    const req1 = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/dashboard`,
    );
    req1.error(new ProgressEvent('Network error'), { status: 500, statusText: 'Server Error' });
    tick();
    fixture.detectChanges();

    component.loadDashboard();
    flushDashboardRequest();
    tick();

    expect(component.error()).toBe(false);
    expect(component.data()).toEqual(MOCK_DASHBOARD);
  }));

  it('should compute appeal status entries from data', fakeAsync(() => {
    fixture.detectChanges();
    flushDashboardRequest();
    tick();

    const entries = component.appealStatusEntries();
    expect(entries.length).toBe(4);
    expect(entries.map((e) => e[0])).toEqual(['draft', 'paid', 'generated', 'failed']);
  }));

  it('should format currency correctly', () => {
    expect(component.formatCurrency('1500.50')).toContain('1.500,50');
    expect(component.formatCurrency('0')).toContain('0,00');
    expect(component.formatCurrency('invalid')).toBe('R$ 0,00');
  });

  it('should format date correctly', () => {
    // Use noon UTC to avoid timezone boundary issues
    const result = component.formatDate('2025-06-15T12:00:00Z');
    expect(result).toContain('15');
    expect(result).toContain('06');
    expect(result).toContain('2025');
  });

  it('should format status labels', () => {
    expect(component.formatStatusLabel('draft')).toBe('Rascunho');
    expect(component.formatStatusLabel('pending_payment')).toBe('Aguardando Pagamento');
    expect(component.formatStatusLabel('generated')).toBe('Gerado');
    expect(component.formatStatusLabel('unknown_status')).toBe('unknown_status');
  });

  it('should return status colors', () => {
    expect(component.getStatusColor('draft')).toBe('bg-gray-400');
    expect(component.getStatusColor('generated')).toBe('bg-accent-500');
    expect(component.getStatusColor('failed')).toBe('bg-red-500');
    expect(component.getStatusColor('unknown')).toBe('bg-gray-400');
  });

  it('should display revenue details section', fakeAsync(() => {
    fixture.detectChanges();
    flushDashboardRequest();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Receita');
    expect(el.textContent).toContain('Receita líquida');
    expect(el.textContent).toContain('Ticket médio');
  }));

  it('should display AI metrics section', fakeAsync(() => {
    fixture.detectChanges();
    flushDashboardRequest();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Inteligência Artificial');
    expect(el.textContent).toContain('Gerações');
    expect(el.textContent).toContain('Taxa de sucesso');
  }));

  it('should display affiliates section', fakeAsync(() => {
    fixture.detectChanges();
    flushDashboardRequest();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Programa de Afiliados');
    expect(el.textContent).toContain('Afiliados ativos');
  }));

  it('should display period footer', fakeAsync(() => {
    fixture.detectChanges();
    flushDashboardRequest();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dados de');
  }));
});
