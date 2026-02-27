import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminAuditLogsService } from './admin-audit-logs.service';

describe('AdminAuditLogsService', () => {
  let service: AdminAuditLogsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminAuditLogsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list logs with default params', () => {
    const mockResponse = {
      data: [
        { id: 'log-1', userId: 'user-1', action: 'create', resourceType: 'vehicle', resourceId: 'v-1', ipAddress: '127.0.0.1', createdAt: '2024-06-01T12:00:00Z' },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    service.listLogs({ page: 1, limit: 20 }).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.pagination.total).toBe(1);
    });

    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs') && r.params.get('page') === '1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should list logs with all filters', () => {
    const mockResponse = { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };

    service.listLogs({
      page: 2,
      limit: 10,
      action: 'update',
      userId: 'user-123',
      resourceType: 'profile',
      from: '2024-01-01T00:00:00.000Z',
      to: '2024-12-31T23:59:59.999Z',
    }).subscribe((res) => {
      expect(res.data.length).toBe(0);
    });

    const req = httpTesting.expectOne((r) => {
      return r.url.includes('/api/admin/audit-logs')
        && r.params.get('action') === 'update'
        && r.params.get('userId') === 'user-123'
        && r.params.get('resourceType') === 'profile'
        && r.params.get('from') === '2024-01-01T00:00:00.000Z'
        && r.params.get('to') === '2024-12-31T23:59:59.999Z';
    });
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get log by id', () => {
    const mockDetail = {
      id: 'log-1',
      userId: 'user-1',
      action: 'update',
      resourceType: 'setting',
      resourceId: 'base_price',
      changes: { base_price: { from: '49.90', to: '59.90' } },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      metadata: null,
      createdAt: '2024-06-01T12:00:00Z',
    };

    service.getLogById('log-1').subscribe((detail) => {
      expect(detail.id).toBe('log-1');
      expect(detail.changes).toBeTruthy();
      expect(detail.userAgent).toBe('Mozilla/5.0');
    });

    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs/log-1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockDetail);
  });
});
