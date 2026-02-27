import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuditLogsPageComponent } from './audit-logs-page.component';
import { AdminAuditLogsListResponse } from '../../models/audit-log.model';

function buildMockListResponse(): AdminAuditLogsListResponse {
  return {
    data: [
      { id: 'log-1', userId: 'user-1', action: 'create', resourceType: 'vehicle', resourceId: 'v-1', ipAddress: '127.0.0.1', createdAt: '2024-06-01T12:00:00Z' },
      { id: 'log-2', userId: 'user-2', action: 'update', resourceType: 'profile', resourceId: 'p-1', ipAddress: '192.168.1.1', createdAt: '2024-06-02T12:00:00Z' },
      { id: 'log-3', userId: null, action: 'login', resourceType: 'auth', resourceId: null, ipAddress: null, createdAt: '2024-06-03T12:00:00Z' },
    ],
    pagination: { page: 1, limit: 20, total: 3, totalPages: 1 },
  };
}

function buildMockDetail() {
  return {
    id: 'log-1',
    userId: 'user-1',
    action: 'create',
    resourceType: 'vehicle',
    resourceId: 'v-1',
    changes: { plate: 'ABC1D23', brand: 'Fiat' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 Chrome',
    metadata: { source: 'api' },
    createdAt: '2024-06-01T12:00:00Z',
  };
}

describe('AuditLogsPageComponent', () => {
  let component: AuditLogsPageComponent;
  let fixture: ComponentFixture<AuditLogsPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLogsPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(): void {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs'));
    req.flush(buildMockListResponse());
  }

  it('should create', () => {
    expect(component).toBeTruthy();
    flushInitialLoad();
  });

  it('should load logs on init', () => {
    flushInitialLoad();

    expect(component.loading()).toBeFalse();
    expect(component.logs().length).toBe(3);
    expect(component.pagination()!.total).toBe(3);
  });

  it('should show loading skeletons while loading', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs'));
    req.flush(buildMockListResponse());
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.animate-pulse').length).toBe(0);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs'));
    req.error(new ProgressEvent('error'));

    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeTruthy();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Não foi possível carregar');
  });

  it('should retry loading on error', () => {
    fixture.detectChanges();
    const req1 = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs'));
    req1.error(new ProgressEvent('error'));

    component.loadLogs();
    const req2 = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs'));
    req2.flush(buildMockListResponse());

    expect(component.error()).toBeNull();
    expect(component.logs().length).toBe(3);
  });

  it('should filter by action', () => {
    flushInitialLoad();

    component.onActionFilterChange('update');
    const req = httpTesting.expectOne((r) => r.params.get('action') === 'update');
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });

    expect(component.filterAction()).toBe('update');
  });

  it('should filter by resource type with debounce', fakeAsync(() => {
    flushInitialLoad();

    component.onResourceTypeChange('vehicle');
    tick(400);
    const req = httpTesting.expectOne((r) => r.params.get('resourceType') === 'vehicle');
    req.flush(buildMockListResponse());

    expect(component.filterResourceType()).toBe('vehicle');
  }));

  it('should filter by date range', () => {
    flushInitialLoad();

    component.onFromChange('2024-01-01');
    const req1 = httpTesting.expectOne((r) => r.params.get('from') === '2024-01-01T00:00:00.000Z');
    req1.flush(buildMockListResponse());

    component.onToChange('2024-12-31');
    const req2 = httpTesting.expectOne((r) => r.params.get('to') === '2024-12-31T23:59:59.999Z');
    req2.flush(buildMockListResponse());
  });

  it('should clear all filters', () => {
    flushInitialLoad();

    component.filterAction.set('create');
    component.filterResourceType.set('vehicle');
    component.filterFrom.set('2024-01-01');
    component.filterTo.set('2024-12-31');

    component.clearFilters();

    const req = httpTesting.expectOne((r) =>
      !r.params.has('action') && !r.params.has('resourceType') && !r.params.has('from') && !r.params.has('to'),
    );
    req.flush(buildMockListResponse());

    expect(component.filterAction()).toBe('');
    expect(component.filterResourceType()).toBe('');
    expect(component.filterFrom()).toBe('');
    expect(component.filterTo()).toBe('');
  });

  it('should change page', () => {
    flushInitialLoad();

    component.onPageChange(2);
    const req = httpTesting.expectOne((r) => r.params.get('page') === '2');
    req.flush({ data: [], pagination: { page: 2, limit: 20, total: 3, totalPages: 1 } });

    expect(component.logs().length).toBe(0);
  });

  it('should toggle detail expansion and load detail', () => {
    flushInitialLoad();

    component.toggleDetail('log-1');
    expect(component.expandedLogId()).toBe('log-1');
    expect(component.detailLoading()).toBeTrue();

    const detailReq = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs/log-1'));
    detailReq.flush(buildMockDetail());

    expect(component.detailLoading()).toBeFalse();
    expect(component.logDetail()!.id).toBe('log-1');
    expect(component.logDetail()!.userAgent).toBe('Mozilla/5.0 Chrome');
  });

  it('should collapse detail on second toggle', () => {
    flushInitialLoad();

    component.toggleDetail('log-1');
    const detailReq = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs/log-1'));
    detailReq.flush(buildMockDetail());

    component.toggleDetail('log-1');
    expect(component.expandedLogId()).toBeNull();
    expect(component.logDetail()).toBeNull();
  });

  it('should show detail error', () => {
    flushInitialLoad();

    component.toggleDetail('log-1');
    const detailReq = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs/log-1'));
    detailReq.error(new ProgressEvent('error'));

    expect(component.detailLoading()).toBeFalse();
    expect(component.detailError()).toBeTruthy();
  });

  it('should return correct action labels', () => {
    expect(component.getActionLabel('create')).toBe('Criar');
    expect(component.getActionLabel('update')).toBe('Atualizar');
    expect(component.getActionLabel('login')).toBe('Login');
    expect(component.getActionLabel('unknown')).toBe('unknown');
  });

  it('should return correct action colors', () => {
    expect(component.getActionColor('create')).toContain('green');
    expect(component.getActionColor('delete')).toContain('red');
    expect(component.getActionColor('unknown')).toContain('gray');
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-06-01T12:00:00Z');
    expect(formatted).toContain('2024');
    expect(formatted).toContain('01');
  });

  it('should truncate long IDs', () => {
    expect(component.truncateId('abcdefgh-1234-5678-9012-abcdefghijkl')).toBe('abcdefgh…');
    expect(component.truncateId('short')).toBe('short');
  });

  it('should format changes as JSON', () => {
    const result = component.formatChanges({ a: 1, b: 'test' });
    expect(result).toContain('"a": 1');
    expect(result).toContain('"b": "test"');
  });

  it('should show empty state when no logs', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/audit-logs'));
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum log encontrado');
  });
});
