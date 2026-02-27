import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { UserDetailPageComponent } from './user-detail-page.component';
import { AdminUserDetail } from '../../models/user.model';
import { environment } from '../../../../../environments/environment';

const MOCK_USER: AdminUserDetail = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'john@example.com',
  name: 'John Doe',
  phone: '+55 11 99999-0000',
  role: 'user',
  status: 'active',
  isActive: true,
  onboardingCompleted: true,
  emailVerifiedAt: '2025-01-15T12:00:00Z',
  createdAt: '2025-01-10T12:00:00Z',
  updatedAt: '2025-01-20T12:00:00Z',
  appeals: {
    total: 5,
    byStatus: { draft: 1, generated: 3, failed: 1 },
  },
  transactions: {
    total: 3,
    totalGross: '149.70',
    byStatus: { confirmed: 2, pending: 1 },
  },
  sessions: {
    active: 1,
    total: 8,
  },
};

describe('UserDetailPageComponent', () => {
  let component: UserDetailPageComponent;
  let fixture: ComponentFixture<UserDetailPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? MOCK_USER.id : null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushUserDetail(user: AdminUserDetail = MOCK_USER): void {
    const req = httpTesting.expectOne(
      `${environment.apiUrl}/api/admin/users/${MOCK_USER.id}`,
    );
    req.flush(user);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user on init', fakeAsync(() => {
    fixture.detectChanges();
    flushUserDetail();
    tick();

    expect(component.user()).toEqual(MOCK_USER);
    expect(component.loading()).toBe(false);
  }));

  it('should show user details', fakeAsync(() => {
    fixture.detectChanges();
    flushUserDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('John Doe');
    expect(el.textContent).toContain('john@example.com');
    expect(el.textContent).toContain('+55 11 99999-0000');
  }));

  it('should show error on failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      `${environment.apiUrl}/api/admin/users/${MOCK_USER.id}`,
    );
    req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });
    tick();

    expect(component.error()).toBe(true);
    expect(component.loading()).toBe(false);
  }));

  it('should compute appeal status entries', fakeAsync(() => {
    fixture.detectChanges();
    flushUserDetail();
    tick();

    const entries = component.appealStatusEntries();
    expect(entries.length).toBe(3);
    expect(entries.map((e) => e[0])).toEqual(['draft', 'generated', 'failed']);
  }));

  it('should compute transaction status entries', fakeAsync(() => {
    fixture.detectChanges();
    flushUserDetail();
    tick();

    const entries = component.transactionStatusEntries();
    expect(entries.length).toBe(2);
  }));

  it('should format currency', () => {
    expect(component.formatCurrency('149.70')).toContain('149,70');
    expect(component.formatCurrency('invalid')).toBe('R$ 0,00');
  });

  it('should format appeal status labels', () => {
    expect(component.formatAppealStatus('draft')).toBe('Rascunho');
    expect(component.formatAppealStatus('generated')).toBe('Gerado');
    expect(component.formatAppealStatus('unknown')).toBe('unknown');
  });

  it('should format transaction status labels', () => {
    expect(component.formatTransactionStatus('confirmed')).toBe('Confirmado');
    expect(component.formatTransactionStatus('pending')).toBe('Pendente');
  });

  it('should show sessions info', fakeAsync(() => {
    fixture.detectChanges();
    flushUserDetail();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sessões ativas');
    expect(el.textContent).toContain('1');
  }));

  it('should suspend user', fakeAsync(() => {
    fixture.detectChanges();
    flushUserDetail();
    tick();

    component.executeSuspend();
    const patchReq = httpTesting.expectOne(
      `${environment.apiUrl}/api/admin/users/${MOCK_USER.id}`,
    );
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'suspended' });
    patchReq.flush({});

    // Reloads user
    flushUserDetail();
    tick();
  }));

  it('should reactivate user', fakeAsync(() => {
    fixture.detectChanges();
    flushUserDetail();
    tick();

    component.reactivate();
    const patchReq = httpTesting.expectOne(
      `${environment.apiUrl}/api/admin/users/${MOCK_USER.id}`,
    );
    expect(patchReq.request.body).toEqual({ status: 'active' });
    patchReq.flush({});

    flushUserDetail();
    tick();
  }));
});
