import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminFinanceService } from './admin-finance.service';
import { environment } from '../../../../environments/environment';

describe('AdminFinanceService', () => {
  let service: AdminFinanceService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminFinanceService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list transactions with default params', () => {
    service.listTransactions({}).subscribe();
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/finance/transactions`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list transactions with filters', () => {
    service.listTransactions({
      page: 2,
      limit: 10,
      status: 'paid',
      from: '2026-01-01T00:00:00Z',
      to: '2026-01-31T23:59:59Z',
      q: 'test',
    }).subscribe();
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/finance/transactions`,
    );
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('status')).toBe('paid');
    expect(req.request.params.get('q')).toBe('test');
    req.flush({ data: [], pagination: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });

  it('should get transaction by id', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.getTransactionById(id).subscribe();
    const req = httpTesting.expectOne(
      `${environment.apiUrl}/api/admin/finance/transactions/${id}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id });
  });

  it('should get financial report', () => {
    service.getFinancialReport({
      from: '2026-01-01T00:00:00Z',
      to: '2026-01-31T23:59:59Z',
    }).subscribe();
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/finance/report`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('from')).toBe('2026-01-01T00:00:00Z');
    expect(req.request.params.get('format')).toBe('json');
    req.flush({ period: {}, summary: {}, daily: [], byStatus: [] });
  });
});
