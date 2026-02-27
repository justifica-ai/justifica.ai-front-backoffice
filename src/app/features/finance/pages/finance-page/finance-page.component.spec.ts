import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FinancePageComponent } from './finance-page.component';
import { FinancialReportResponse, AdminTransactionsListResponse } from '../../models/finance.model';
import { environment } from '../../../../../environments/environment';

const MOCK_REPORT: FinancialReportResponse = {
  period: { from: '2026-01-01T00:00:00Z', to: '2026-01-31T23:59:59Z' },
  summary: {
    totalGross: '50000.00',
    totalDiscountCoupon: '1500.00',
    totalDiscountVolume: '500.00',
    totalPspFees: '2000.00',
    totalNet: '46000.00',
    totalRefunded: '300.00',
    totalAffiliateCommissions: '1200.00',
    transactionCount: 350,
    paidCount: 320,
    refundedCount: 5,
    averageTicket: '156.25',
  },
  daily: [
    { date: '2026-01-15', gross: '1500.00', net: '1380.00', count: 10 },
    { date: '2026-01-16', gross: '2000.00', net: '1840.00', count: 14 },
  ],
  byStatus: [
    { status: 'paid', count: 320, amount: '45000.00' },
    { status: 'refunded', count: 5, amount: '300.00' },
  ],
};

const MOCK_TX_RESPONSE: AdminTransactionsListResponse = {
  data: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      txid: 'TX123456',
      userId: 'user-1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      appealId: 'appeal-1',
      amountGross: '49.90',
      discountCoupon: '0.00',
      discountVolume: '0.00',
      amountNet: '48.40',
      pspFee: '1.50',
      status: 'paid',
      confirmedAt: '2026-01-15T12:00:00Z',
      createdAt: '2026-01-15T10:00:00Z',
    },
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

describe('FinancePageComponent', () => {
  let component: FinancePageComponent;
  let fixture: ComponentFixture<FinancePageComponent>;
  let httpTesting: HttpTestingController;

  const REPORT_URL = `${environment.apiUrl}/api/admin/finance/report`;
  const TX_URL = `${environment.apiUrl}/api/admin/finance/transactions`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancePageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FinancePageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(
    report: FinancialReportResponse = MOCK_REPORT,
    txResponse: AdminTransactionsListResponse = MOCK_TX_RESPONSE,
  ): void {
    const reportReq = httpTesting.expectOne((r) => r.url === REPORT_URL);
    reportReq.flush(report);
    const txReq = httpTesting.expectOne((r) => r.url === TX_URL);
    txReq.flush(txResponse);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load report and transactions on init', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    expect(component.report()).toEqual(MOCK_REPORT);
    expect(component.transactions().length).toBe(1);
    expect(component.reportLoading()).toBe(false);
    expect(component.txLoading()).toBe(false);
  }));

  it('should display KPI cards', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Receita Bruta');
    expect(el.textContent).toContain('Receita Líquida');
    expect(el.textContent).toContain('Taxas PSP');
    expect(el.textContent).toContain('Descontos');
    expect(el.textContent).toContain('Comissões Afiliados');
  }));

  it('should show transactions table', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(el.textContent).toContain('TX123456');
    expect(el.textContent).toContain('John Doe');
  }));

  it('should show report error state', fakeAsync(() => {
    fixture.detectChanges();
    const reportReq = httpTesting.expectOne((r) => r.url === REPORT_URL);
    reportReq.error(new ProgressEvent('error'), { status: 500 });
    const txReq = httpTesting.expectOne((r) => r.url === TX_URL);
    txReq.flush(MOCK_TX_RESPONSE);
    tick();

    expect(component.reportError()).toBe(true);
    expect(component.reportLoading()).toBe(false);
  }));

  it('should show transactions error state', fakeAsync(() => {
    fixture.detectChanges();
    const reportReq = httpTesting.expectOne((r) => r.url === REPORT_URL);
    reportReq.flush(MOCK_REPORT);
    const txReq = httpTesting.expectOne((r) => r.url === TX_URL);
    txReq.error(new ProgressEvent('error'), { status: 500 });
    tick();

    expect(component.txError()).toBe(true);
    expect(component.txLoading()).toBe(false);
  }));

  it('should compute total discounts', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    expect(component.totalDiscounts()).toBe('2000.00');
  }));

  it('should format currency correctly', () => {
    expect(component.formatCurrency('1500.00')).toContain('1.500,00');
    expect(component.formatCurrency('invalid')).toBe('R$ 0,00');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2026-06-15T12:00:00Z');
    expect(result).toContain('15');
    expect(result).toContain('06');
    expect(result).toContain('2026');
  });

  it('should format short date', () => {
    expect(component.formatShortDate('2026-01-15')).toBe('15/01');
  });

  it('should get status labels', () => {
    expect(component.getStatusLabel('paid')).toBe('Pago');
    expect(component.getStatusLabel('pending')).toBe('Pendente');
    expect(component.getStatusLabel('refunded')).toBe('Reembolsado');
    expect(component.getStatusLabel('unknown')).toBe('unknown');
  });

  it('should get status colors', () => {
    expect(component.getStatusColor('paid')).toContain('green');
    expect(component.getStatusColor('failed')).toContain('red');
  });

  it('should calculate bar height', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    const day = { date: '2026-01-16', gross: '2000.00', net: '1840.00', count: 14 };
    expect(component.getBarHeight(day)).toBe(100);
    const smallDay = { date: '2026-01-15', gross: '1500.00', net: '1380.00', count: 10 };
    expect(component.getBarHeight(smallDay)).toBe(75);
  }));

  it('should filter transactions by status', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.onStatusChange('paid');
    const req = httpTesting.expectOne((r) =>
      r.url === TX_URL && r.params.get('status') === 'paid',
    );
    req.flush(MOCK_TX_RESPONSE);
    tick();

    expect(component.filterStatus()).toBe('paid');
  }));

  it('should debounce search', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.onSearchChange('TX123');
    tick(200);
    // Not yet triggered
    tick(200);
    const req = httpTesting.expectOne((r) =>
      r.url === TX_URL && r.params.get('q') === 'TX123',
    );
    req.flush(MOCK_TX_RESPONSE);
    tick();
  }));

  it('should reload report on date change', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.onReportFromChange('2026-02-01');
    const req = httpTesting.expectOne((r) => r.url === REPORT_URL);
    req.flush(MOCK_REPORT);
    tick();

    expect(component.reportFrom()).toBe('2026-02-01');
  }));

  it('should show daily revenue chart', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Receita Diária');
    expect(el.textContent).toContain('15/01');
    expect(el.textContent).toContain('16/01');
  }));

  it('should show by-status summary', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Por Status');
    expect(el.textContent).toContain('Pago');
    expect(el.textContent).toContain('Reembolsado');
  }));
});
