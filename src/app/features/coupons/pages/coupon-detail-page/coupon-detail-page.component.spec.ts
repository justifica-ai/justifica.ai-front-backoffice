import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { CouponDetailPageComponent } from './coupon-detail-page.component';
import { AdminCouponDetail } from '../../models/coupon.model';
import { environment } from '../../../../../environments/environment';

const MOCK_COUPON: AdminCouponDetail = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  code: 'PROMO20',
  type: 'percentage',
  value: '20.00',
  validFrom: '2025-01-01T00:00:00.000Z',
  validUntil: '2025-12-31T23:59:59.000Z',
  maxUses: 100,
  currentUses: 42,
  maxUsesPerUser: 1,
  minAmount: '50.00',
  firstPurchaseOnly: false,
  allowedResourceTypes: ['speed', 'red_light'],
  allowedChannels: ['organic'],
  description: 'Promoção de lançamento',
  utmCampaign: 'launch-2025',
  status: 'active',
  isActive: true,
  createdBy: 'admin-user-id',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-02-15T10:30:00.000Z',
  metrics: {
    totalUsages: 42,
    uniqueUsers: 38,
    totalDiscountGranted: '840.00',
  },
  recentUsages: [
    {
      id: 'u1a2b3c4-d5e6-7890-abcd-ef1234567890',
      userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      discountAmount: '20.00',
      usedAt: '2025-02-14T15:30:00.000Z',
    },
    {
      id: 'u2a3b4c5-d6e7-8901-abcd-ef1234567890',
      userId: 'b2c3d4e5-f6a7-8901-abcd-ef1234567890',
      discountAmount: '20.00',
      usedAt: '2025-02-13T12:00:00.000Z',
    },
  ],
};

const baseUrl = `${environment.apiUrl}/api/admin/coupons`;

describe('CouponDetailPageComponent', () => {
  let component: CouponDetailPageComponent;
  let fixture: ComponentFixture<CouponDetailPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponDetailPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? MOCK_COUPON.id : null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CouponDetailPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushCouponDetail(coupon: AdminCouponDetail = MOCK_COUPON): void {
    const req = httpTesting.expectOne(`${baseUrl}/${MOCK_COUPON.id}`);
    req.flush(coupon);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load coupon on init', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponDetail();
    tick();

    expect(component.coupon()).toEqual(MOCK_COUPON);
    expect(component.loading()).toBe(false);
  }));

  it('should show coupon details', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('PROMO20');
    expect(el.textContent).toContain('Percentual');
    expect(el.textContent).toContain('20%');
    expect(el.textContent).toContain('Promoção de lançamento');
    expect(el.textContent).toContain('launch-2025');
  }));

  it('should show KPI cards', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('42');
    expect(el.textContent).toContain('38');
    expect(el.textContent).toContain('840,00');
  }));

  it('should show recent usages', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Últimos Usos');
    expect(el.textContent).toContain('a1b2c3d4');
  }));

  it('should show empty usages message', fakeAsync(() => {
    const emptyUsages: AdminCouponDetail = {
      ...MOCK_COUPON,
      recentUsages: [],
    };
    fixture.detectChanges();
    flushCouponDetail(emptyUsages);
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhum uso registrado');
  }));

  it('should show error on failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/${MOCK_COUPON.id}`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Erro ao carregar detalhes do cupom.');
    expect(component.loading()).toBe(false);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar detalhes do cupom');
  }));

  it('should toggle status via confirm dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponDetail();
    tick();

    component.showToggleDialog();
    expect(component.toggleDialogTitle()).toBe('Desativar cupom');

    component.confirmToggle();
    const patchReq = httpTesting.expectOne(`${baseUrl}/${MOCK_COUPON.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'inactive' });
    patchReq.flush({});

    flushCouponDetail();
    tick();
  }));

  it('should show activate dialog for inactive coupon', fakeAsync(() => {
    const inactiveCoupon: AdminCouponDetail = {
      ...MOCK_COUPON,
      status: 'inactive',
      isActive: false,
    };
    fixture.detectChanges();
    flushCouponDetail(inactiveCoupon);
    tick();

    component.showToggleDialog();
    expect(component.toggleDialogTitle()).toBe('Ativar cupom');
    expect(component.toggleDialogDestructive()).toBe(false);
  }));

  it('should format helpers', () => {
    expect(component.getStatusLabel('active')).toBe('Ativo');
    expect(component.getTypeLabel('percentage')).toBe('Percentual');
    expect(component.formatCurrency('100.00')).toContain('100,00');
    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2025-06-15T12:00:00.000Z')).toContain('15');
    expect(component.formatArray(null)).toBe('Todos');
    expect(component.formatArray([])).toBe('Todos');
    expect(component.formatArray(['a', 'b'])).toBe('a, b');
  });

  it('should format detail value for percentage', () => {
    expect(component.formatDetailValue(MOCK_COUPON)).toBe('20%');
  });

  it('should format detail value for fixed_value', () => {
    const fixedCoupon: AdminCouponDetail = {
      ...MOCK_COUPON,
      type: 'fixed_value',
      value: '10.00',
    };
    expect(component.formatDetailValue(fixedCoupon)).toBe('R$ 10,00');
  });

  it('should show details grid fields', fakeAsync(() => {
    fixture.detectChanges();
    flushCouponDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('100'); // maxUses
    expect(el.textContent).toContain('Não'); // firstPurchaseOnly: false
    expect(el.textContent).toContain('speed, red_light'); // allowedResourceTypes
    expect(el.textContent).toContain('organic'); // allowedChannels
  }));

  it('should not make request when id is empty', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CouponDetailPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    });

    const newFixture = TestBed.createComponent(CouponDetailPageComponent);
    newFixture.detectChanges();

    // No HTTP request should be made since id is empty
    const newHttpTesting = TestBed.inject(HttpTestingController);
    newHttpTesting.expectNone(`${baseUrl}/`);
    expect(newFixture.componentInstance.coupon()).toBeNull();
    newHttpTesting.verify();
  });
});
