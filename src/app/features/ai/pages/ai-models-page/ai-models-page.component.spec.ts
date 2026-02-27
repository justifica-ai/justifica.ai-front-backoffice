import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AiModelsPageComponent } from './ai-models-page.component';
import { AdminAiModelsListResponse } from '../../models/ai.model';
import { environment } from '../../../../../environments/environment';

const providersUrl = `${environment.apiUrl}/api/admin/ai/providers`;
const modelsUrl = `${environment.apiUrl}/api/admin/ai/models`;

const MOCK_MODELS_RESPONSE: AdminAiModelsListResponse = {
  data: [
    {
      id: '660e8400-e29b-41d4-a716-446655440000',
      providerId: '550e8400-e29b-41d4-a716-446655440000',
      providerName: 'Anthropic',
      providerSlug: 'anthropic',
      name: 'Claude Opus 4',
      slug: 'claude-opus-4-20250514',
      maxTokens: 4096,
      costPer1kInput: '0.0150',
      costPer1kOutput: '0.0750',
      priority: 1,
      isActive: true,
      generationsCount: 142,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      providerId: '550e8400-e29b-41d4-a716-446655440001',
      providerName: 'OpenAI',
      providerSlug: 'openai',
      name: 'GPT-4o',
      slug: 'gpt-4o',
      maxTokens: 8192,
      costPer1kInput: null,
      costPer1kOutput: null,
      priority: 2,
      isActive: false,
      generationsCount: 0,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

const MOCK_PROVIDERS_LIST = {
  data: [
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Anthropic', slug: 'anthropic', apiEndpoint: null, status: 'active' as const, priority: 1, modelsCount: 1, hasApiKey: true, createdAt: '', updatedAt: '' },
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'OpenAI', slug: 'openai', apiEndpoint: null, status: 'active' as const, priority: 2, modelsCount: 1, hasApiKey: true, createdAt: '', updatedAt: '' },
  ],
  pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
};

describe('AiModelsPageComponent', () => {
  let component: AiModelsPageComponent;
  let fixture: ComponentFixture<AiModelsPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiModelsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiModelsPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(models: AdminAiModelsListResponse = MOCK_MODELS_RESPONSE): void {
    // ngOnInit calls loadProvidersList() and loadModels()
    const provReq = httpTesting.expectOne((r) => r.url === providersUrl);
    provReq.flush(MOCK_PROVIDERS_LIST);
    const modReq = httpTesting.expectOne((r) => r.url === modelsUrl);
    modReq.flush(models);
  }

  function flushModelsList(models: AdminAiModelsListResponse = MOCK_MODELS_RESPONSE): void {
    const req = httpTesting.expectOne((r) => r.url === modelsUrl);
    req.flush(models);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load models on init', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    expect(component.models().length).toBe(2);
    expect(component.availableProviders().length).toBe(2);
    expect(component.loading()).toBe(false);
  }));

  it('should show models table', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(el.textContent).toContain('Claude Opus 4');
    expect(el.textContent).toContain('GPT-4o');
  }));

  it('should show error state on failure', fakeAsync(() => {
    fixture.detectChanges();
    // Flush providers successfully
    const provReq = httpTesting.expectOne((r) => r.url === providersUrl);
    provReq.flush(MOCK_PROVIDERS_LIST);
    // Fail models
    const modReq = httpTesting.expectOne((r) => r.url === modelsUrl);
    modReq.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Erro ao carregar modelos. Tente novamente.');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar modelos');
  }));

  it('should show empty state when no models', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhum modelo encontrado');
  }));

  it('should reload on provider filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const providerId = '550e8400-e29b-41d4-a716-446655440000';
    component.onProviderFilterChange(providerId);
    const req = httpTesting.expectOne(
      (r) => r.url === modelsUrl && r.params.get('providerId') === providerId,
    );
    req.flush(MOCK_MODELS_RESPONSE);
    tick();

    expect(component.providerFilter()).toBe(providerId);
  }));

  it('should reload on active filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.onActiveFilterChange('true');
    const req = httpTesting.expectOne(
      (r) => r.url === modelsUrl && r.params.get('active') === 'true',
    );
    req.flush(MOCK_MODELS_RESPONSE);
    tick();

    expect(component.activeFilter()).toBe('true');
  }));

  it('should handle page change', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.onPageChange(2);
    const req = httpTesting.expectOne(
      (r) => r.url === modelsUrl && r.params.get('page') === '2',
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_MODELS_RESPONSE);
    tick();
  }));

  it('should open create dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCreateDialog();
    expect(component.showFormDialog()).toBe(true);
    expect(component.editingId()).toBeNull();
  }));

  it('should close form dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCreateDialog();
    component.closeFormDialog();
    expect(component.showFormDialog()).toBe(false);
  }));

  it('should open edit dialog with model data', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[0];
    component.openEditDialog(model);
    expect(component.showFormDialog()).toBe(true);
    expect(component.editingId()).toBe(model.id);
    expect(component.modelForm.controls.name.value).toBe('Claude Opus 4');
    expect(component.modelForm.controls.slug.value).toBe('claude-opus-4-20250514');
    expect(component.modelForm.controls.providerId.value).toBe(model.providerId);
  }));

  it('should submit create form', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCreateDialog();
    component.modelForm.patchValue({
      providerId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Claude 3.5 Sonnet',
      slug: 'claude-3-5-sonnet',
      maxTokens: 8192,
      priority: 3,
      isActive: true,
    });

    component.submitForm();
    expect(component.submitting()).toBe(true);

    const req = httpTesting.expectOne(modelsUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Claude 3.5 Sonnet');
    req.flush({
      id: 'new-id',
      name: 'Claude 3.5 Sonnet',
      slug: 'claude-3-5-sonnet',
      providerId: '550e8400-e29b-41d4-a716-446655440000',
      priority: 3,
      isActive: true,
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    flushModelsList();
    tick();

    expect(component.submitting()).toBe(false);
    expect(component.showFormDialog()).toBe(false);
  }));

  it('should submit edit form', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[0];
    component.openEditDialog(model);
    component.modelForm.patchValue({ name: 'Claude Opus 4 Updated' });

    component.submitForm();
    expect(component.submitting()).toBe(true);

    const req = httpTesting.expectOne(`${modelsUrl}/${model.id}`);
    expect(req.request.method).toBe('PATCH');
    req.flush({
      id: model.id,
      name: 'Claude Opus 4 Updated',
      slug: 'claude-opus-4-20250514',
      priority: 1,
      isActive: true,
      updatedAt: '2025-01-01T00:00:00.000Z',
    });

    flushModelsList();
    tick();

    expect(component.submitting()).toBe(false);
  }));

  it('should not submit invalid form', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCreateDialog();
    component.modelForm.patchValue({ name: '', slug: '', providerId: '' });
    component.submitForm();
    expect(component.submitting()).toBe(false);
  }));

  it('should handle create form error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCreateDialog();
    component.modelForm.patchValue({
      providerId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test',
      slug: 'test',
    });

    component.submitForm();
    const req = httpTesting.expectOne(modelsUrl);
    req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });
    tick();

    expect(component.submitting()).toBe(false);
  }));

  it('should handle edit form error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[0];
    component.openEditDialog(model);
    component.submitForm();

    const req = httpTesting.expectOne(`${modelsUrl}/${model.id}`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.submitting()).toBe(false);
  }));

  it('should toggle active status', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[0]; // isActive: true
    component.toggleActive(model);

    const req = httpTesting.expectOne(`${modelsUrl}/${model.id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({
      id: model.id,
      name: model.name,
      slug: model.slug,
      priority: 1,
      isActive: false,
      updatedAt: '2025-01-01T00:00:00.000Z',
    });

    flushModelsList();
    tick();
  }));

  it('should handle toggle active error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[0];
    component.toggleActive(model);

    const req = httpTesting.expectOne(`${modelsUrl}/${model.id}`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
  }));

  it('should move priority up', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[1]; // priority: 2
    component.movePriority(model, -1);
    expect(component.reordering()).toBe(true);

    const req = httpTesting.expectOne(`${modelsUrl}/reorder`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ models: [{ id: model.id, priority: 1 }] });
    req.flush({ success: true, updated: 1 });

    flushModelsList();
    tick();

    expect(component.reordering()).toBe(false);
  }));

  it('should move priority down', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[0]; // priority: 1
    component.movePriority(model, 1);

    const req = httpTesting.expectOne(`${modelsUrl}/reorder`);
    expect(req.request.body).toEqual({ models: [{ id: model.id, priority: 2 }] });
    req.flush({ success: true, updated: 1 });

    flushModelsList();
    tick();
  }));

  it('should not move priority below 1', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[0]; // priority: 1
    component.movePriority(model, -1); // Would be 0
    // No request should be made
  }));

  it('should handle reorder error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[0];
    component.movePriority(model, 1);

    const req = httpTesting.expectOne(`${modelsUrl}/reorder`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.reordering()).toBe(false);
  }));

  it('should confirm and execute delete', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[1];
    component.confirmDelete(model);
    expect(component.deleteMessage()).toContain('GPT-4o');

    component.executeDelete();
    const req = httpTesting.expectOne(`${modelsUrl}/${model.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, id: model.id });

    flushModelsList();
    tick();
  }));

  it('should handle delete error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[1];
    component.confirmDelete(model);
    component.executeDelete();

    const req = httpTesting.expectOne(`${modelsUrl}/${model.id}`);
    req.error(new ProgressEvent('error'), { status: 409, statusText: 'Conflict' });
    tick();
  }));

  it('should not execute delete without target', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.executeDelete();
    // No request should be made
  }));

  it('should format numbers', () => {
    expect(component.formatNumber(4096)).toBeTruthy();
    expect(component.formatNumber(0)).toBeTruthy();
  });

  it('should format cost', () => {
    expect(component.formatCost('0.0150')).toBe('$0.0150');
    expect(component.formatCost(null)).toBe('—');
  });

  it('should handle providers list load failure silently', fakeAsync(() => {
    fixture.detectChanges();
    // Fail providers
    const provReq = httpTesting.expectOne((r) => r.url === providersUrl);
    provReq.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    // Models still loads
    const modReq = httpTesting.expectOne((r) => r.url === modelsUrl);
    modReq.flush(MOCK_MODELS_RESPONSE);
    tick();

    expect(component.availableProviders().length).toBe(0);
    expect(component.models().length).toBe(2);
  }));

  it('should open edit dialog with null costs', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const model = component.models()[1]; // costs are null
    component.openEditDialog(model);
    expect(component.modelForm.controls.costPer1kInput.value).toBeNull();
    expect(component.modelForm.controls.costPer1kOutput.value).toBeNull();
  }));
});
