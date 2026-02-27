import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminAffiliatesService } from './admin-affiliates.service';
import { environment } from '../../../../environments/environment';

describe('AdminAffiliatesService', () => {
  let service: AdminAffiliatesService;
  let httpTesting: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/admin/affiliates`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminAffiliatesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- listAffiliates ---

  it('should list affiliates with default params', () => {
    service.listAffiliates().subscribe();
    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list affiliates with filters', () => {
    service.listAffiliates({ page: 2, limit: 10, status: 'active', q: 'test' }).subscribe();
    const req = httpTesting.expectOne((r) => {
      return (
        r.url === baseUrl &&
        r.params.get('page') === '2' &&
        r.params.get('limit') === '10' &&
        r.params.get('status') === 'active' &&
        r.params.get('q') === 'test'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });

  it('should list affiliates with only status filter', () => {
    service.listAffiliates({ status: 'pending' }).subscribe();
    const req = httpTesting.expectOne((r) => {
      return r.url === baseUrl && r.params.get('status') === 'pending' && !r.params.has('page');
    });
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  // --- getAffiliateById ---

  it('should get affiliate by id', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.getAffiliateById(id).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  // --- updateAffiliate ---

  it('should update affiliate status', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.updateAffiliate(id, { status: 'active' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'active' });
    req.flush({});
  });

  it('should update affiliate commission rate', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.updateAffiliate(id, { commissionRate: 15 }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ commissionRate: 15 });
    req.flush({});
  });

  it('should update both status and commission rate', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.updateAffiliate(id, { status: 'suspended', commissionRate: 5 }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'suspended', commissionRate: 5 });
    req.flush({});
  });

  // --- listPendingWithdrawals ---

  it('should list pending withdrawals with default params', () => {
    service.listPendingWithdrawals().subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/withdrawals/pending`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list pending withdrawals with pagination', () => {
    service.listPendingWithdrawals({ page: 3, limit: 5 }).subscribe();
    const req = httpTesting.expectOne((r) => {
      return (
        r.url === `${baseUrl}/withdrawals/pending` &&
        r.params.get('page') === '3' &&
        r.params.get('limit') === '5'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 3, limit: 5, total: 0, totalPages: 0 } });
  });

  // --- processWithdrawal ---

  it('should approve a withdrawal', () => {
    const affiliateId = '550e8400-e29b-41d4-a716-446655440000';
    const withdrawalId = '660e8400-e29b-41d4-a716-446655440000';
    service.processWithdrawal(affiliateId, withdrawalId, { action: 'approve' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${affiliateId}/withdrawals/${withdrawalId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ action: 'approve' });
    req.flush({});
  });

  it('should reject a withdrawal', () => {
    const affiliateId = '550e8400-e29b-41d4-a716-446655440000';
    const withdrawalId = '660e8400-e29b-41d4-a716-446655440000';
    service.processWithdrawal(affiliateId, withdrawalId, { action: 'reject' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${affiliateId}/withdrawals/${withdrawalId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ action: 'reject' });
    req.flush({});
  });
});
