import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AffiliatesListPageComponent } from './affiliates-list-page.component';
import {
  AdminAffiliatesListResponse,
  AdminPendingWithdrawalsResponse,
} from '../../models/affiliate.model';
import { environment } from '../../../../../environments/environment';

const baseUrl = `${environment.apiUrl}/api/admin/affiliates`;

const MOCK_AFFILIATES_RESPONSE: AdminAffiliatesListResponse = {
  data: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      userName: 'João Silva',
      userEmail: 'joao@example.com',
      code: 'JOAO10',
      commissionRate: '10.00',
      totalEarnings: '150.00',
      pendingBalance: '50.00',
      availableBalance: '100.00',
      status: 'active',
      totalClicks: 200,
      totalConversions: 15,
      activatedAt: '2025-01-15T12:00:00.000Z',
      createdAt: '2025-01-10T12:00:00.000Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      userId: 'b1c2d3e4-f5a6-7890-abcd-ef1234567890',
      userName: 'Maria Santos',
      userEmail: 'maria@example.com',
      code: 'MARIA15',
      commissionRate: '15.00',
      totalEarnings: '0.00',
      pendingBalance: '0.00',
      availableBalance: '0.00',
      status: 'pending',
      totalClicks: 0,
      totalConversions: 0,
      activatedAt: null,
      createdAt: '2025-02-01T12:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

const MOCK_WITHDRAWALS_RESPONSE: AdminPendingWithdrawalsResponse = {
  data: [
    {
      id: 'w1a2b3c4-d5e6-7890-abcd-ef1234567890',
      affiliateId: '550e8400-e29b-41d4-a716-446655440000',
      affiliateName: 'João Silva',
      affiliateEmail: 'joao@example.com',
      affiliateCode: 'JOAO10',
      amount: '80.00',
      pixKey: 'joao@pix.com',
      createdAt: '2025-02-10T12:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

describe('AffiliatesListPageComponent', () => {
  let component: AffiliatesListPageComponent;
  let fixture: ComponentFixture<AffiliatesListPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffiliatesListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AffiliatesListPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushAffiliatesList(response: AdminAffiliatesListResponse = MOCK_AFFILIATES_RESPONSE): void {
    const req = httpTesting.expectOne((r) => r.url === baseUrl);
    req.flush(response);
  }

  function flushWithdrawalsList(response: AdminPendingWithdrawalsResponse = MOCK_WITHDRAWALS_RESPONSE): void {
    const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/withdrawals/pending`);
    req.flush(response);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load affiliates on init', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    expect(component.affiliates().length).toBe(2);
    expect(component.loading()).toBe(false);
  }));

  it('should show affiliates table', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(el.textContent).toContain('João Silva');
    expect(el.textContent).toContain('JOAO10');
  }));

  it('should show error state on failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url === baseUrl);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar afiliados');
  }));

  it('should format status labels', () => {
    expect(component.getStatusLabel('active')).toBe('Ativo');
    expect(component.getStatusLabel('pending')).toBe('Pendente');
    expect(component.getStatusLabel('suspended')).toBe('Suspenso');
    expect(component.getStatusLabel('blocked')).toBe('Bloqueado');
  });

  it('should format currency', () => {
    expect(component.formatCurrency('150.00')).toContain('150,00');
    expect(component.formatCurrency('invalid')).toBe('R$ 0,00');
  });

  it('should reload on status filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    component.onStatusChange('pending');
    const req = httpTesting.expectOne((r) =>
      r.url === baseUrl && r.params.get('status') === 'pending',
    );
    req.flush(MOCK_AFFILIATES_RESPONSE);
    tick();

    expect(component.filterStatus()).toBe('pending');
  }));

  it('should debounce search', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    component.onSearchChange('test');
    tick(200);
    expect(component.searchQuery()).toBe('test');

    tick(200);
    const req = httpTesting.expectOne((r) =>
      r.url === baseUrl && r.params.get('q') === 'test',
    );
    req.flush(MOCK_AFFILIATES_RESPONSE);
    tick();
  }));

  it('should execute approve', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    const affiliate = component.affiliates()[1]; // pending one
    component.selectedAffiliate.set(affiliate);
    component.executeApprove();

    const patchReq = httpTesting.expectOne(`${baseUrl}/${affiliate.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'active' });
    patchReq.flush({});

    flushAffiliatesList();
    tick();
  }));

  it('should execute suspend', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    const affiliate = component.affiliates()[0]; // active one
    component.selectedAffiliate.set(affiliate);
    component.executeSuspend();

    const patchReq = httpTesting.expectOne(`${baseUrl}/${affiliate.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'suspended' });
    patchReq.flush({});

    flushAffiliatesList();
    tick();
  }));

  it('should reactivate affiliate', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    const affiliate = component.affiliates()[0];
    component.reactivateAffiliate(affiliate);

    const patchReq = httpTesting.expectOne(`${baseUrl}/${affiliate.id}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'active' });
    patchReq.flush({});

    flushAffiliatesList();
    tick();
  }));

  it('should switch to withdrawals tab and load data', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    component.switchTab('withdrawals');
    flushWithdrawalsList();
    tick();

    expect(component.activeTab()).toBe('withdrawals');
    expect(component.pendingWithdrawals().length).toBe(1);
    expect(component.withdrawalsLoading()).toBe(false);
  }));

  it('should show pending withdrawals table', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    component.switchTab('withdrawals');
    flushWithdrawalsList();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('João Silva');
    expect(el.textContent).toContain('joao@pix.com');
  }));

  it('should approve a withdrawal', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    component.switchTab('withdrawals');
    flushWithdrawalsList();
    tick();

    const withdrawal = component.pendingWithdrawals()[0];
    component.selectedWithdrawal.set(withdrawal);
    component.executeApproveWithdrawal();

    const postReq = httpTesting.expectOne(
      `${baseUrl}/${withdrawal.affiliateId}/withdrawals/${withdrawal.id}`,
    );
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ action: 'approve' });
    postReq.flush({});

    flushWithdrawalsList();
    tick();
  }));

  it('should reject a withdrawal', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    component.switchTab('withdrawals');
    flushWithdrawalsList();
    tick();

    const withdrawal = component.pendingWithdrawals()[0];
    component.selectedWithdrawal.set(withdrawal);
    component.executeRejectWithdrawal();

    const postReq = httpTesting.expectOne(
      `${baseUrl}/${withdrawal.affiliateId}/withdrawals/${withdrawal.id}`,
    );
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ action: 'reject' });
    postReq.flush({});

    flushWithdrawalsList();
    tick();
  }));

  it('should show withdrawals error state', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    component.switchTab('withdrawals');
    const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/withdrawals/pending`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
    fixture.detectChanges();

    expect(component.withdrawalsError()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar saques pendentes');
  }));

  it('should handle page change', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    component.onPageChange(2);
    const req = httpTesting.expectOne((r) =>
      r.url === baseUrl && r.params.get('page') === '2',
    );
    req.flush(MOCK_AFFILIATES_RESPONSE);
    tick();
  }));

  it('should not reload withdrawals when switching back to affiliates tab', fakeAsync(() => {
    fixture.detectChanges();
    flushAffiliatesList();
    tick();

    // First, go to withdrawals
    component.switchTab('withdrawals');
    flushWithdrawalsList();
    tick();

    // Switch back to affiliates
    component.switchTab('affiliates');
    expect(component.activeTab()).toBe('affiliates');

    // Switch to withdrawals again — should NOT trigger another load since data exists
    component.switchTab('withdrawals');
    expect(component.pendingWithdrawals().length).toBe(1);
    // No new HTTP call expected
  }));
});
