import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminCouponsService } from './admin-coupons.service';
import { environment } from '../../../../environments/environment';

describe('AdminCouponsService', () => {
  let service: AdminCouponsService;
  let httpTesting: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/admin/coupons`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminCouponsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- listCoupons ---

  it('should list coupons with default params', () => {
    service.listCoupons({ page: 1, limit: 20 }).subscribe();
    const req = httpTesting.expectOne(
      (r) => r.url === baseUrl && r.params.get('page') === '1' && r.params.get('limit') === '20',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list coupons with all filters', () => {
    service.listCoupons({ page: 2, limit: 10, status: 'active', type: 'percentage', q: 'PROMO' }).subscribe();
    const req = httpTesting.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('page') === '2' &&
        r.params.get('limit') === '10' &&
        r.params.get('status') === 'active' &&
        r.params.get('type') === 'percentage' &&
        r.params.get('q') === 'PROMO',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });

  it('should list coupons with only status filter', () => {
    service.listCoupons({ page: 1, limit: 20, status: 'expired' }).subscribe();
    const req = httpTesting.expectOne(
      (r) => r.url === baseUrl && r.params.get('status') === 'expired' && !r.params.has('type'),
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  // --- getCouponById ---

  it('should get coupon by id', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.getCouponById(id).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({ id, code: 'PROMO20' });
  });

  // --- createCoupon ---

  it('should create coupon', () => {
    const body = {
      code: 'PROMO20',
      type: 'percentage' as const,
      value: 20,
      validFrom: '2026-01-01T00:00:00.000Z',
      validUntil: '2026-12-31T23:59:59.000Z',
    };
    service.createCoupon(body).subscribe();
    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: '550e8400-e29b-41d4-a716-446655440000', code: 'PROMO20', status: 'active' });
  });

  // --- updateCoupon ---

  it('should update coupon status', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.updateCoupon(id, { status: 'inactive' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'inactive' });
    req.flush({ id, code: 'PROMO20', status: 'inactive' });
  });

  it('should update coupon with multiple fields', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.updateCoupon(id, { maxUses: 500, validUntil: '2027-12-31T00:00:00.000Z' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id, code: 'PROMO20', status: 'active' });
  });
});
