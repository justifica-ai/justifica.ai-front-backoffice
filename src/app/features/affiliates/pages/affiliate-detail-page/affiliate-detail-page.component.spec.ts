import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { AffiliateDetailPageComponent } from './affiliate-detail-page.component';
import { AdminAffiliateDetail } from '../../models/affiliate.model';
import { environment } from '../../../../../environments/environment';

const MOCK_AFFILIATE: AdminAffiliateDetail = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  userName: 'João Silva',
  userEmail: 'joao@example.com',
  code: 'JOAO10',
  commissionRate: '10.00',
  pixKey: 'joao@pix.com',
  totalEarnings: '250.00',
  pendingBalance: '80.00',
  availableBalance: '170.00',
  status: 'active',
  activatedAt: '2025-01-15T12:00:00.000Z',
  createdAt: '2025-01-10T12:00:00.000Z',
  updatedAt: '2025-02-10T12:00:00.000Z',
  metrics: {
    totalClicks: 500,
    totalConversions: 25,
    conversionRate: '5.00',
    totalWithdrawals: 3,
    pendingWithdrawals: 1,
  },
  recentConversions: [
    {
      id: 'c1a2b3c4-d5e6-7890-abcd-ef1234567890',
      commissionAmount: '4.99',
      isPaid: true,
      createdAt: '2025-02-08T12:00:00.000Z',
    },
    {
      id: 'c2a3b4c5-d6e7-8901-abcd-ef1234567890',
      commissionAmount: '4.99',
      isPaid: false,
      createdAt: '2025-02-09T12:00:00.000Z',
    },
  ],
  recentWithdrawals: [
    {
      id: 'w1a2b3c4-d5e6-7890-abcd-ef1234567890',
      amount: '80.00',
      pixKey: 'joao@pix.com',
      status: 'pending',
      processedAt: null,
      createdAt: '2025-02-10T12:00:00.000Z',
    },
  ],
};

const baseUrl = `${environment.apiUrl}/api/admin/affiliates`;

describe('AffiliateDetailPageComponent', () => {
  let component: AffiliateDetailPageComponent;
  let fixture: ComponentFixture<AffiliateDetailPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffiliateDetailPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? MOCK_AFFILIATE.id : null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AffiliateDetailPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushAffiliateDetail(affiliate: AdminAffiliateDetail = MOCK_AFFILIATE): void {
    const req = httpTesting.expectOne(`${baseUrl}/${MOCK_AFFILIATE.id}`);
    req.flush(affiliate);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load affiliate on init', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();

    expect(component.affiliate()).toEqual(MOCK_AFFILIATE);
    expect(component.loading()).toBe(false);
    expect(component.commissionRate()).toBe(10);
  }));

  it('should show affiliate details', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('João Silva');
    expect(el.textContent).toContain('joao@example.com');
    expect(el.textContent).toContain('JOAO10');
    expect(el.textContent).toContain('joao@pix.com');
  }));

  it('should show metrics', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('500');
    expect(el.textContent).toContain('25');
    expect(el.textContent).toContain('5.00%');
  }));

  it('should show recent conversions', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Conversões Recentes');
    expect(el.textContent).toContain('Sim');
    expect(el.textContent).toContain('Não');
  }));

  it('should show recent withdrawals', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Saques Recentes');
    expect(el.textContent).toContain('Pendente');
  }));

  it('should show error on failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${baseUrl}/${MOCK_AFFILIATE.id}`);
    req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });
    tick();

    expect(component.error()).toBe(true);
    expect(component.loading()).toBe(false);
  }));

  it('should approve affiliate', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();

    component.executeApprove();
    const patchReq = httpTesting.expectOne(`${baseUrl}/${MOCK_AFFILIATE.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'active' });
    patchReq.flush({});

    flushAffiliateDetail();
    tick();
  }));

  it('should suspend affiliate', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();

    component.executeSuspend();
    const patchReq = httpTesting.expectOne(`${baseUrl}/${MOCK_AFFILIATE.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'suspended' });
    patchReq.flush({});

    flushAffiliateDetail();
    tick();
  }));

  it('should reactivate affiliate', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();

    component.reactivate();
    const patchReq = httpTesting.expectOne(`${baseUrl}/${MOCK_AFFILIATE.id}`);
    expect(patchReq.request.body).toEqual({ status: 'active' });
    patchReq.flush({});

    flushAffiliateDetail();
    tick();
  }));

  it('should save commission rate', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();

    component.commissionRate.set(20);
    component.saveCommission();

    expect(component.savingCommission()).toBe(true);
    const patchReq = httpTesting.expectOne(`${baseUrl}/${MOCK_AFFILIATE.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ commissionRate: 20 });
    patchReq.flush({});

    flushAffiliateDetail();
    tick();

    expect(component.savingCommission()).toBe(false);
  }));

  it('should not save invalid commission rate', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliateDetail();
    tick();

    component.commissionRate.set(150);
    component.saveCommission();

    // No HTTP request should be made
    expect(component.savingCommission()).toBe(false);
  }));

  it('should format currency', () => {
    expect(component.formatCurrency('250.00')).toContain('250,00');
    expect(component.formatCurrency('invalid')).toBe('R$ 0,00');
  });

  it('should format status labels', () => {
    expect(component.getStatusLabel('active')).toBe('Ativo');
    expect(component.getStatusLabel('pending')).toBe('Pendente');
    expect(component.getStatusLabel('blocked')).toBe('Bloqueado');
  });

  it('should format withdrawal status labels', () => {
    expect(component.getWithdrawalStatusLabel('pending')).toBe('Pendente');
    expect(component.getWithdrawalStatusLabel('completed')).toBe('Concluído');
    expect(component.getWithdrawalStatusLabel('rejected')).toBe('Rejeitado');
  });

  it('should show empty messages when no conversions or withdrawals', fakeAsync(() => {
    const emptyAffiliate: AdminAffiliateDetail = {
      ...MOCK_AFFILIATE,
      recentConversions: [],
      recentWithdrawals: [],
    };
    fixture.detectChanges();
    flushAffiliateDetail(emptyAffiliate);
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhuma conversão recente.');
    expect(el.textContent).toContain('Nenhum saque recente.');
  }));

  it('should handle missing id', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AffiliateDetailPageComponent],
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

    const newFixture = TestBed.createComponent(AffiliateDetailPageComponent);
    newFixture.detectChanges();

    expect(newFixture.componentInstance.error()).toBe(true);
    expect(newFixture.componentInstance.loading()).toBe(false);
  });
});
