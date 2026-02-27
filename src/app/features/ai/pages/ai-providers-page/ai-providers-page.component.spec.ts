import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AiProvidersPageComponent } from './ai-providers-page.component';
import { AdminAiProvidersListResponse } from '../../models/ai.model';
import { environment } from '../../../../../environments/environment';

const baseUrl = `${environment.apiUrl}/api/admin/ai/providers`;

const MOCK_PROVIDERS_RESPONSE: AdminAiProvidersListResponse = {
  data: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Anthropic',
      slug: 'anthropic',
      apiEndpoint: 'https://api.anthropic.com/v1',
      status: 'active',
      priority: 1,
      modelsCount: 3,
      hasApiKey: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'OpenAI',
      slug: 'openai',
      apiEndpoint: 'https://api.openai.com/v1',
      status: 'inactive',
      priority: 2,
      modelsCount: 1,
      hasApiKey: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

describe('AiProvidersPageComponent', () => {
  let component: AiProvidersPageComponent;
  let fixture: ComponentFixture<AiProvidersPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiProvidersPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiProvidersPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushProvidersList(response: AdminAiProvidersListResponse = MOCK_PROVIDERS_RESPONSE): void {
    const req = httpTesting.expectOne((r) => r.url === baseUrl);
    req.flush(response);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load providers on init', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    expect(component.providers().length).toBe(2);
    expect(component.loading()).toBe(false);
  }));

  it('should show providers table', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(el.textContent).toContain('Anthropic');
    expect(el.textContent).toContain('OpenAI');
  }));

  it('should show error state on failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url === baseUrl);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Erro ao carregar provedores. Tente novamente.');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar provedores');
  }));

  it('should show empty state when no providers', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhum provedor encontrado');
  }));

  it('should format status labels', () => {
    expect(component.getStatusLabel('active')).toBe('Ativo');
    expect(component.getStatusLabel('inactive')).toBe('Inativo');
    expect(component.getStatusLabel('maintenance')).toBe('Manutenção');
  });

  it('should return color class for status', () => {
    expect(component.getStatusColor('active')).toContain('bg-green-100');
    expect(component.getStatusColor('inactive')).toContain('bg-gray-100');
    expect(component.getStatusColor('maintenance')).toContain('bg-amber-100');
  });

  it('should reload on status filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    component.onStatusFilterChange('active');
    const req = httpTesting.expectOne(
      (r) => r.url === baseUrl && r.params.get('status') === 'active',
    );
    req.flush(MOCK_PROVIDERS_RESPONSE);
    tick();

    expect(component.statusFilter()).toBe('active');
  }));

  it('should handle page change', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    component.onPageChange(2);
    const req = httpTesting.expectOne(
      (r) => r.url === baseUrl && r.params.get('page') === '2',
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_PROVIDERS_RESPONSE);
    tick();
  }));

  it('should open create dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    component.openCreateDialog();
    expect(component.showFormDialog()).toBe(true);
    expect(component.editingId()).toBeNull();
  }));

  it('should close form dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    component.openCreateDialog();
    component.closeFormDialog();
    expect(component.showFormDialog()).toBe(false);
  }));

  it('should open edit dialog with provider data', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    const provider = component.providers()[0];
    component.openEditDialog(provider);
    expect(component.showFormDialog()).toBe(true);
    expect(component.editingId()).toBe(provider.id);
    expect(component.providerForm.controls.name.value).toBe('Anthropic');
    expect(component.providerForm.controls.slug.value).toBe('anthropic');
  }));

  it('should submit create form', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    component.openCreateDialog();
    component.providerForm.patchValue({
      name: 'Google AI',
      slug: 'google-ai',
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
      status: 'active',
      priority: 3,
    });

    component.submitForm();
    expect(component.submitting()).toBe(true);

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Google AI');
    expect(req.request.body.slug).toBe('google-ai');
    req.flush({ id: 'new-id', name: 'Google AI', slug: 'google-ai', status: 'active', priority: 3, createdAt: '2025-01-01T00:00:00.000Z' });

    flushProvidersList();
    tick();

    expect(component.submitting()).toBe(false);
    expect(component.showFormDialog()).toBe(false);
  }));

  it('should submit edit form', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    const provider = component.providers()[0];
    component.openEditDialog(provider);
    component.providerForm.patchValue({ name: 'Anthropic Updated' });

    component.submitForm();
    expect(component.submitting()).toBe(true);

    const req = httpTesting.expectOne(`${baseUrl}/${provider.id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.name).toBe('Anthropic Updated');
    req.flush({ id: provider.id, name: 'Anthropic Updated', slug: 'anthropic', status: 'active', priority: 1, updatedAt: '2025-01-01T00:00:00.000Z' });

    flushProvidersList();
    tick();

    expect(component.submitting()).toBe(false);
  }));

  it('should not submit invalid form', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    component.openCreateDialog();
    component.providerForm.patchValue({ name: '', slug: '' });
    component.submitForm();
    expect(component.submitting()).toBe(false);
  }));

  it('should test connection', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    const provider = component.providers()[0];
    component.testConnection(provider);
    expect(component.testingId()).toBe(provider.id);

    const req = httpTesting.expectOne(`${baseUrl}/${provider.id}/test-connection`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, provider: 'anthropic', latencyMs: 120, error: null });
    tick();

    expect(component.testingId()).toBeNull();
  }));

  it('should handle failed test connection', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    const provider = component.providers()[0];
    component.testConnection(provider);

    const req = httpTesting.expectOne(`${baseUrl}/${provider.id}/test-connection`);
    req.flush({ success: false, provider: 'anthropic', latencyMs: 0, error: 'Connection refused' });
    tick();

    expect(component.testingId()).toBeNull();
  }));

  it('should handle test connection error', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    const provider = component.providers()[0];
    component.testConnection(provider);

    const req = httpTesting.expectOne(`${baseUrl}/${provider.id}/test-connection`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.testingId()).toBeNull();
  }));

  it('should confirm and execute delete', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    const provider = component.providers()[1];
    component.confirmDelete(provider);
    expect(component.deleteMessage()).toContain('OpenAI');

    component.executeDelete();
    const req = httpTesting.expectOne(`${baseUrl}/${provider.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, id: provider.id });

    flushProvidersList();
    tick();
  }));

  it('should handle delete error', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    const provider = component.providers()[1];
    component.confirmDelete(provider);
    component.executeDelete();

    const req = httpTesting.expectOne(`${baseUrl}/${provider.id}`);
    req.error(new ProgressEvent('error'), { status: 409, statusText: 'Conflict' });
    tick();
  }));

  it('should not execute delete without target', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    component.executeDelete();
    // No request should be made
  }));

  it('should handle create form error', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    component.openCreateDialog();
    component.providerForm.patchValue({
      name: 'Test',
      slug: 'test',
      status: 'active',
      priority: 1,
    });

    component.submitForm();
    const req = httpTesting.expectOne(baseUrl);
    req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });
    tick();

    expect(component.submitting()).toBe(false);
  }));

  it('should handle edit form error', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();

    const provider = component.providers()[0];
    component.openEditDialog(provider);
    component.submitForm();

    const req = httpTesting.expectOne(`${baseUrl}/${provider.id}`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.submitting()).toBe(false);
  }));

  it('should show API key indicators', fakeAsync(() => {
    fixture.detectChanges();
    flushProvidersList();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const checkMarks = el.querySelectorAll('[title="API Key configurada"]');
    const crossMarks = el.querySelectorAll('[title="API Key ausente"]');
    expect(checkMarks.length).toBe(1);
    expect(crossMarks.length).toBe(1);
  }));
});
