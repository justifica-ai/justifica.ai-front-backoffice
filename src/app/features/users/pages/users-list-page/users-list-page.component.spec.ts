import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UsersListPageComponent } from './users-list-page.component';
import { AdminUsersListResponse } from '../../models/user.model';
import { environment } from '../../../../../environments/environment';

const MOCK_RESPONSE: AdminUsersListResponse = {
  data: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
      status: 'active',
      isActive: true,
      createdAt: '2025-01-15T12:00:00Z',
      updatedAt: '2025-01-20T12:00:00Z',
      appealsCount: 5,
      transactionsCount: 3,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      isActive: true,
      createdAt: '2025-01-10T12:00:00Z',
      updatedAt: '2025-01-18T12:00:00Z',
      appealsCount: 0,
      transactionsCount: 0,
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

describe('UsersListPageComponent', () => {
  let component: UsersListPageComponent;
  let fixture: ComponentFixture<UsersListPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushUsersList(response: AdminUsersListResponse = MOCK_RESPONSE): void {
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/users`,
    );
    req.flush(response);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', fakeAsync(() => {
    fixture.detectChanges();
    flushUsersList();
    tick();

    expect(component.users().length).toBe(2);
    expect(component.loading()).toBe(false);
  }));

  it('should show table with users', fakeAsync(() => {
    fixture.detectChanges();
    flushUsersList();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(el.textContent).toContain('John Doe');
    expect(el.textContent).toContain('john@example.com');
  }));

  it('should show error state on failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/api/admin/users`,
    );
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar usuários');
  }));

  it('should format role labels', () => {
    expect(component.getRoleLabel('user')).toBe('Usuário');
    expect(component.getRoleLabel('admin')).toBe('Admin');
    expect(component.getRoleLabel('super_admin')).toBe('Super Admin');
  });

  it('should format status labels', () => {
    expect(component.getStatusLabel('active')).toBe('Ativo');
    expect(component.getStatusLabel('suspended')).toBe('Suspenso');
    expect(component.getStatusLabel('deleted')).toBe('Excluído');
  });

  it('should determine if user can be deleted', () => {
    expect(component.canDelete({ role: 'user', status: 'active' } as never)).toBe(true);
    expect(component.canDelete({ role: 'admin', status: 'active' } as never)).toBe(false);
    expect(component.canDelete({ role: 'user', status: 'deleted' } as never)).toBe(false);
  });

  it('should reload on status filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushUsersList();
    tick();

    component.onStatusChange('suspended');
    const req = httpTesting.expectOne((r) =>
      r.url === `${environment.apiUrl}/api/admin/users` && r.params.get('status') === 'suspended',
    );
    req.flush(MOCK_RESPONSE);
    tick();

    expect(component.filterStatus()).toBe('suspended');
  }));

  it('should reload on role filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushUsersList();
    tick();

    component.onRoleChange('admin');
    const req = httpTesting.expectOne((r) =>
      r.url === `${environment.apiUrl}/api/admin/users` && r.params.get('role') === 'admin',
    );
    req.flush(MOCK_RESPONSE);
    tick();

    expect(component.filterRole()).toBe('admin');
  }));

  it('should debounce search', fakeAsync(() => {
    fixture.detectChanges();
    flushUsersList();
    tick();

    component.onSearchChange('test');
    tick(200); // Not yet
    expect(component.searchQuery()).toBe('test');

    tick(200); // Now debounced
    const req = httpTesting.expectOne((r) =>
      r.url === `${environment.apiUrl}/api/admin/users` && r.params.get('q') === 'test',
    );
    req.flush(MOCK_RESPONSE);
    tick();
  }));

  it('should execute suspend', fakeAsync(() => {
    fixture.detectChanges();
    flushUsersList();
    tick();

    const user = component.users()[0];
    component.selectedUser.set(user);
    component.executeSuspend();

    const patchReq = httpTesting.expectOne(
      `${environment.apiUrl}/api/admin/users/${user.id}`,
    );
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ status: 'suspended' });
    patchReq.flush({});

    flushUsersList(); // reloads
    tick();
  }));

  it('should execute delete', fakeAsync(() => {
    fixture.detectChanges();
    flushUsersList();
    tick();

    const user = component.users()[0];
    component.selectedUser.set(user);
    component.executeDelete();

    const deleteReq = httpTesting.expectOne(
      `${environment.apiUrl}/api/admin/users/${user.id}`,
    );
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    flushUsersList();
    tick();
  }));
});
