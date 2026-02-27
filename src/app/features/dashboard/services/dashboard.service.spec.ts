import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { DashboardResponse } from '../models/dashboard.model';
import { environment } from '../../../../environments/environment';

const MOCK_RESPONSE: DashboardResponse = {
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

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/admin/dashboard with default params', () => {
    service.getDashboardMetrics().subscribe((res) => {
      expect(res).toEqual(MOCK_RESPONSE);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/api/admin/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_RESPONSE);
  });

  it('should include period query param', () => {
    service.getDashboardMetrics({ period: '7d' }).subscribe();

    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/dashboard` && r.params.get('period') === '7d',
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_RESPONSE);
  });

  it('should include from and to query params for custom period', () => {
    service
      .getDashboardMetrics({ period: 'custom', from: '2025-01-01', to: '2025-01-15' })
      .subscribe();

    const req = httpTesting.expectOne((r) => {
      return (
        r.url === `${environment.apiUrl}/api/admin/dashboard` &&
        r.params.get('period') === 'custom' &&
        r.params.get('from') === '2025-01-01' &&
        r.params.get('to') === '2025-01-15'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_RESPONSE);
  });
});
