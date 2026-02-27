import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CouponsPageComponent } from './coupons-page.component';
import { AdminCouponsListResponse } from '../../models/coupon.model';
import { environment } from '../../../../../environments/environment';

const baseUrl = `${environment.apiUrl}/api/admin/coupons`;

const MOCK_COUPONS_RESPONSE: AdminCouponsListResponse = {
  data: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'PROMO20',
      type: 'percentage',
      value: '20.00',
      validFrom: '2025-01-01T00:00:00.000Z',
      validUntil: '2025-12-31T23:59:59.000Z',
      maxUses: 100,
      currentUses: 42,
      maxUsesPerUser: 1,
      minAmount: null,
      firstPurchaseOnly: false,
      status: 'active',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      code: 'FIXO10',
      type: 'fixed_value',
      value: '10.00',
      validFrom: '2025-06-01T00:00:00.000Z',
      validUntil: null,
      maxUses: null,
      currentUses: 0,
      maxUsesPerUser: 1,
      minAmount: '50.00',
      firstPurchaseOnly: true,
      status: 'inactive',
      createdAt: '2025-06-01T00:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

describe('CouponsPageComponent', () => {
  let component: CouponsPageComponent;
  let fixture: ComponentFixture<CouponsPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CouponsPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushCouponsList(response: AdminCouponsListResponse = MOCK_COUPONS_RESPONSE): void {
    const req = httpTesting.expectOne((r) => r.url === baseUrl);
    req.flush(response);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load coupons on init', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    expect(component.coupons().length).toBe(2);
    expect(component.loading()).toBe(false);
  }));

  it('should show coupons table', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(el.textContent).toContain('PROMO20');
    expect(el.textContent).toContain('FIXO10');
  }));

  it('should show error state on failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url === baseUrl);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Erro ao carregar cupons. Tente novamente.');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar cupons');
  }));

  it('should format status labels', () => {
    expect(component.getStatusLabel('active')).toBe('Ativo');
    expect(component.getStatusLabel('inactive')).toBe('Inativo');
    expect(component.getStatusLabel('expired')).toBe('Expirado');
    expect(component.getStatusLabel('depleted')).toBe('Esgotado');
  });

  it('should format type labels', () => {
    expect(component.getTypeLabel('percentage')).toBe('Percentual');
    expect(component.getTypeLabel('fixed_value')).toBe('Valor Fixo');
  });

  it('should format percentage value', () => {
    const coupon = MOCK_COUPONS_RESPONSE.data[0]; // percentage 20.00
    expect(component.formatValue(coupon)).toBe('20%');
  });

  it('should format fixed value', () => {
    const coupon = MOCK_COUPONS_RESPONSE.data[1]; // fixed_value 10.00
    expect(component.formatValue(coupon)).toBe('R$ 10,00');
  });

  it('should format date', () => {
    const formattedDate = component.formatDate('2025-06-15T12:00:00.000Z');
    expect(formattedDate).toContain('15');
    expect(formattedDate).toContain('06');
    expect(formattedDate).toContain('2025');
  });

  it('should format null date as dash', () => {
    expect(component.formatDate(null)).toBe('—');
  });

  it('should reload on status filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    component.onStatusFilterChange('active');
    const req = httpTesting.expectOne(
      (r) => r.url === baseUrl && r.params.get('status') === 'active',
    );
    req.flush(MOCK_COUPONS_RESPONSE);
    tick();

    expect(component.statusFilter()).toBe('active');
  }));

  it('should reload on type filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    component.onTypeFilterChange('percentage');
    const req = httpTesting.expectOne(
      (r) => r.url === baseUrl && r.params.get('type') === 'percentage',
    );
    req.flush(MOCK_COUPONS_RESPONSE);
    tick();

    expect(component.typeFilter()).toBe('percentage');
  }));

  it('should debounce search', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    component.onSearchChange('PROMO');
    tick(200);
    expect(component.searchTerm()).toBe('PROMO');

    tick(200);
    const req = httpTesting.expectOne(
      (r) => r.url === baseUrl && r.params.get('q') === 'PROMO',
    );
    req.flush(MOCK_COUPONS_RESPONSE);
    tick();
  }));

  it('should handle page change', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    component.onPageChange(2);
    const req = httpTesting.expectOne(
      (r) => r.url === baseUrl && r.params.get('page') === '2',
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_COUPONS_RESPONSE);
    tick();
  }));

  it('should show empty state when no coupons', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhum cupom encontrado');
  }));

  it('should open create dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    component.openCreateDialog();
    expect(component.showCreateDialog()).toBe(true);
  }));

  it('should close create dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    component.openCreateDialog();
    component.closeCreateDialog();
    expect(component.showCreateDialog()).toBe(false);
  }));

  it('should submit create form', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    component.openCreateDialog();
    component.createForm.patchValue({
      code: 'NOVO30',
      type: 'percentage',
      value: 30,
      validFrom: '2026-01-01T00:00',
      validUntil: '2026-12-31T23:59',
    });

    component.submitCreate();
    expect(component.creating()).toBe(true);

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.code).toBe('NOVO30');
    req.flush({ id: 'new-id', code: 'NOVO30', type: 'percentage', value: '30.00', status: 'active', createdAt: '2026-01-01T00:00:00.000Z' });

    // Reload list after create
    flushCouponsList();
    tick();

    expect(component.creating()).toBe(false);
    expect(component.showCreateDialog()).toBe(false);
  }));

  it('should not submit invalid create form', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    component.openCreateDialog();
    // Form is invalid by default (empty required fields)
    component.submitCreate();
    expect(component.creating()).toBe(false);
    // No HTTP request should be made
  }));

  it('should toggle coupon status via confirm dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    const activeCoupon = component.coupons()[0]; // status: 'active'
    component.toggleCouponStatus(activeCoupon, new Event('click'));
    expect(component.toggleDialogTitle()).toBe('Desativar cupom');

    component.confirmToggle();
    const patchReq = httpTesting.expectOne(`${baseUrl}/${activeCoupon.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'inactive' });
    patchReq.flush({});

    flushCouponsList();
    tick();
  }));

  it('should toggle inactive coupon to active', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponsList();
    tick();

    const inactiveCoupon = component.coupons()[1]; // status: 'inactive'
    component.toggleCouponStatus(inactiveCoupon, new Event('click'));
    expect(component.toggleDialogTitle()).toBe('Ativar cupom');

    component.confirmToggle();
    const patchReq = httpTesting.expectOne(`${baseUrl}/${inactiveCoupon.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'active' });
    patchReq.flush({});

    flushCouponsList();
    tick();
  }));
});
