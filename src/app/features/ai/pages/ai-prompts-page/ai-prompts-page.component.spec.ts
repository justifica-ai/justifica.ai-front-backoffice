import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AiPromptsPageComponent } from './ai-prompts-page.component';
import { AdminAiPromptsListResponse, AdminAiPromptDetail, AdminAiPromptDiffResponse } from '../../models/ai.model';
import { environment } from '../../../../../environments/environment';

const promptsUrl = `${environment.apiUrl}/api/admin/ai/prompts`;

const MOCK_PROMPTS_RESPONSE: AdminAiPromptsListResponse = {
  data: [
    {
      id: '770e8400-e29b-41d4-a716-446655440000',
      name: 'Defesa Prévia v1',
      slug: 'defesa-previa-v1',
      type: 'defesa_previa',
      status: 'active',
      version: '1.0.0',
      description: 'Prompt padrão para defesa prévia',
      isActive: true,
      generationsCount: 42,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      name: 'Recurso 1ª Instância v1',
      slug: 'recurso-1a-instancia-v1',
      type: 'recurso_1a_instancia',
      status: 'draft',
      version: '1.0.0',
      description: null,
      isActive: false,
      generationsCount: 0,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

const MOCK_PROMPT_DETAIL: AdminAiPromptDetail = {
  id: '770e8400-e29b-41d4-a716-446655440000',
  name: 'Defesa Prévia v1',
  slug: 'defesa-previa-v1',
  type: 'defesa_previa',
  status: 'active',
  version: '1.0.0',
  systemPrompt: 'Você é um advogado especialista em trânsito...',
  userPromptTemplate: 'Gere uma defesa prévia para a infração {{infracao}}...',
  description: 'Prompt padrão para defesa prévia',
  motiveCodes: ['*'],
  temperature: 0.3,
  maxTokens: 3000,
  topP: 1,
  frequencyPenalty: 0.3,
  presencePenalty: 0.1,
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const MOCK_DRAFT_DETAIL: AdminAiPromptDetail = {
  ...MOCK_PROMPT_DETAIL,
  id: '770e8400-e29b-41d4-a716-446655440001',
  name: 'Recurso 1ª Instância v1',
  slug: 'recurso-1a-instancia-v1',
  type: 'recurso_1a_instancia',
  status: 'draft',
  isActive: false,
};

const MOCK_DIFF_RESPONSE: AdminAiPromptDiffResponse = {
  promptA: {
    id: '770e8400-e29b-41d4-a716-446655440000',
    name: 'Defesa Prévia v1',
    version: '1.0.0',
    systemPrompt: 'System A',
    userPromptTemplate: 'User A',
    temperature: 0.3,
    maxTokens: 3000,
    topP: 1,
    frequencyPenalty: 0.3,
    presencePenalty: 0.1,
  },
  promptB: {
    id: '770e8400-e29b-41d4-a716-446655440001',
    name: 'Defesa Prévia v2',
    version: '2.0.0',
    systemPrompt: 'System B',
    userPromptTemplate: 'User B',
    temperature: 0.5,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
};

describe('AiPromptsPageComponent', () => {
  let component: AiPromptsPageComponent;
  let fixture: ComponentFixture<AiPromptsPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiPromptsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiPromptsPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad(data: AdminAiPromptsListResponse = MOCK_PROMPTS_RESPONSE): void {
    const req = httpTesting.expectOne((r) => r.url === promptsUrl);
    req.flush(data);
  }

  function flushPromptsList(data: AdminAiPromptsListResponse = MOCK_PROMPTS_RESPONSE): void {
    const req = httpTesting.expectOne((r) => r.url === promptsUrl);
    req.flush(data);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load prompts on init', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    expect(component.prompts().length).toBe(2);
    expect(component.loading()).toBe(false);
  }));

  it('should show prompts table', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(el.textContent).toContain('Defesa Prévia v1');
    expect(el.textContent).toContain('Recurso 1ª Instância v1');
  }));

  it('should show error state on failure', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url === promptsUrl);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Erro ao carregar prompts.');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Erro ao carregar prompts');
  }));

  it('should show empty state when no prompts', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhum prompt encontrado');
  }));

  it('should reload on type filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.typeFilter.set('defesa_previa');
    component.loadPrompts();
    const req = httpTesting.expectOne(
      (r) => r.url === promptsUrl && r.params.get('type') === 'defesa_previa',
    );
    req.flush(MOCK_PROMPTS_RESPONSE);
    tick();

    expect(component.typeFilter()).toBe('defesa_previa');
  }));

  it('should reload on status filter change', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.statusFilter.set('active');
    component.loadPrompts();
    const req = httpTesting.expectOne(
      (r) => r.url === promptsUrl && r.params.get('status') === 'active',
    );
    req.flush(MOCK_PROMPTS_RESPONSE);
    tick();

    expect(component.statusFilter()).toBe('active');
  }));

  it('should handle page change', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.onPageChange(2);
    const req = httpTesting.expectOne(
      (r) => r.url === promptsUrl && r.params.get('page') === '2',
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_PROMPTS_RESPONSE);
    tick();
  }));

  // ═══════ Detail ═══════

  it('should view prompt detail', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.viewPrompt(component.prompts()[0]);
    const req = httpTesting.expectOne(`${promptsUrl}/${MOCK_PROMPTS_RESPONSE.data[0].id}`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_PROMPT_DETAIL);
    tick();

    expect(component.showDetailDialog()).toBe(true);
    expect(component.detailPrompt()!.name).toBe('Defesa Prévia v1');
  }));

  it('should handle view detail error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.viewPrompt(component.prompts()[0]);
    const req = httpTesting.expectOne(`${promptsUrl}/${MOCK_PROMPTS_RESPONSE.data[0].id}`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.showDetailDialog()).toBe(false);
  }));

  it('should close detail dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.viewPrompt(component.prompts()[0]);
    const req = httpTesting.expectOne(`${promptsUrl}/${MOCK_PROMPTS_RESPONSE.data[0].id}`);
    req.flush(MOCK_PROMPT_DETAIL);
    tick();

    component.closeDetailDialog();
    expect(component.showDetailDialog()).toBe(false);
    expect(component.detailPrompt()).toBeNull();
  }));

  // ═══════ Create/Edit ═══════

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

  it('should open edit dialog with prompt data', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[1]; // draft
    component.openEditDialog(prompt.id);
    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}`);
    req.flush(MOCK_DRAFT_DETAIL);
    tick();

    expect(component.showFormDialog()).toBe(true);
    expect(component.editingId()).toBe(prompt.id);
    expect(component.promptForm.controls.name.value).toBe('Recurso 1ª Instância v1');
  }));

  it('should handle edit dialog load error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openEditDialog('some-id');
    const req = httpTesting.expectOne(`${promptsUrl}/some-id`);
    req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });
    tick();

    expect(component.showFormDialog()).toBe(false);
  }));

  it('should submit create form', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCreateDialog();
    component.promptForm.patchValue({
      name: 'Test Prompt',
      slug: 'test-prompt',
      type: 'defesa_previa',
      version: '1.0.0',
      systemPrompt: 'System prompt content here',
      userPromptTemplate: 'User template content here',
      temperature: 0.3,
      maxTokens: 3000,
      topP: 1,
      frequencyPenalty: 0.3,
      presencePenalty: 0.1,
    });

    component.submitForm();
    expect(component.submitting()).toBe(true);

    const req = httpTesting.expectOne(promptsUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Test Prompt');
    req.flush({
      id: 'new-id',
      name: 'Test Prompt',
      slug: 'test-prompt',
      type: 'defesa_previa',
      status: 'draft',
      version: '1.0.0',
      isActive: false,
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    flushPromptsList();
    tick();

    expect(component.submitting()).toBe(false);
    expect(component.showFormDialog()).toBe(false);
  }));

  it('should submit edit form', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[1]; // draft
    component.openEditDialog(prompt.id);
    const detailReq = httpTesting.expectOne(`${promptsUrl}/${prompt.id}`);
    detailReq.flush(MOCK_DRAFT_DETAIL);
    tick();

    component.promptForm.patchValue({ name: 'Updated Name' });
    component.submitForm();
    expect(component.submitting()).toBe(true);

    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}`);
    expect(req.request.method).toBe('PATCH');
    req.flush({
      id: prompt.id,
      name: 'Updated Name',
      slug: 'recurso-1a-instancia-v1',
      status: 'draft',
      version: '1.0.0',
      isActive: false,
      updatedAt: '2025-01-01T00:00:00.000Z',
    });

    flushPromptsList();
    tick();

    expect(component.submitting()).toBe(false);
  }));

  it('should not submit invalid form', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCreateDialog();
    component.promptForm.patchValue({ name: '', slug: '', type: '' });
    component.submitForm();
    expect(component.submitting()).toBe(false);
  }));

  it('should handle create form error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCreateDialog();
    component.promptForm.patchValue({
      name: 'Test',
      slug: 'test',
      type: 'defesa_previa',
      version: '1.0.0',
      systemPrompt: 'System prompt content here',
      userPromptTemplate: 'User template content here',
    });

    component.submitForm();
    const req = httpTesting.expectOne(promptsUrl);
    req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });
    tick();

    expect(component.submitting()).toBe(false);
  }));

  it('should handle edit form error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[1];
    component.openEditDialog(prompt.id);
    const detailReq = httpTesting.expectOne(`${promptsUrl}/${prompt.id}`);
    detailReq.flush(MOCK_DRAFT_DETAIL);
    tick();

    component.submitForm();
    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.submitting()).toBe(false);
  }));

  // ═══════ Status ═══════

  it('should activate prompt', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[1]; // draft
    component.activatePrompt(prompt);

    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'active' });
    req.flush({
      id: prompt.id,
      status: 'active',
      previousActiveId: '770e8400-e29b-41d4-a716-446655440000',
    });

    flushPromptsList();
    tick();
  }));

  it('should deactivate prompt', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[0]; // active
    component.deactivatePrompt(prompt);

    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'inactive' });
    req.flush({
      id: prompt.id,
      status: 'inactive',
      previousActiveId: null,
    });

    flushPromptsList();
    tick();
  }));

  it('should handle activate error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.activatePrompt(component.prompts()[1]);
    const req = httpTesting.expectOne(`${promptsUrl}/${component.prompts()[1].id}/status`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.prompts().length).toBe(MOCK_PROMPTS_RESPONSE.data.length);
  }));

  it('should handle deactivate error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.deactivatePrompt(component.prompts()[0]);
    const req = httpTesting.expectOne(`${promptsUrl}/${component.prompts()[0].id}/status`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.prompts().length).toBe(MOCK_PROMPTS_RESPONSE.data.length);
  }));

  // ═══════ Clone ═══════

  it('should open clone dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCloneDialog(component.prompts()[0]);
    expect(component.showCloneDialog()).toBe(true);
    expect(component.cloningPrompt()!.id).toBe(MOCK_PROMPTS_RESPONSE.data[0].id);
  }));

  it('should close clone dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCloneDialog(component.prompts()[0]);
    component.closeCloneDialog();
    expect(component.showCloneDialog()).toBe(false);
    expect(component.cloningPrompt()).toBeNull();
  }));

  it('should submit clone', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[0];
    component.openCloneDialog(prompt);
    component.cloneForm.patchValue({ newVersion: '2.0.0' });

    component.submitClone();
    expect(component.submitting()).toBe(true);

    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}/clone`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.newVersion).toBe('2.0.0');
    req.flush({
      id: 'cloned-id',
      name: 'Defesa Prévia v1',
      slug: 'defesa-previa-v1-v200',
      type: 'defesa_previa',
      status: 'draft',
      version: '2.0.0',
      isActive: false,
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    flushPromptsList();
    tick();

    expect(component.submitting()).toBe(false);
    expect(component.showCloneDialog()).toBe(false);
  }));

  it('should not submit clone with invalid form', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openCloneDialog(component.prompts()[0]);
    component.cloneForm.patchValue({ newVersion: '' });
    component.submitClone();
    expect(component.submitting()).toBe(false);
  }));

  it('should handle clone error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[0];
    component.openCloneDialog(prompt);
    component.cloneForm.patchValue({ newVersion: '2.0.0' });
    component.submitClone();

    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}/clone`);
    req.error(new ProgressEvent('error'), { status: 409, statusText: 'Conflict' });
    tick();

    expect(component.submitting()).toBe(false);
  }));

  // ═══════ Diff ═══════

  it('should open and close diff dialog', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openDiffDialog();
    expect(component.showDiffDialog()).toBe(true);

    component.closeDiffDialog();
    expect(component.showDiffDialog()).toBe(false);
  }));

  it('should execute diff', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openDiffDialog();
    component.diffIdA.set(MOCK_PROMPTS_RESPONSE.data[0].id);
    component.diffIdB.set(MOCK_PROMPTS_RESPONSE.data[1].id);

    component.executeDiff();
    expect(component.diffLoading()).toBe(true);

    const req = httpTesting.expectOne(
      (r) => r.url === `${promptsUrl}/diff` &&
             r.params.get('versionA') === MOCK_PROMPTS_RESPONSE.data[0].id &&
             r.params.get('versionB') === MOCK_PROMPTS_RESPONSE.data[1].id,
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_DIFF_RESPONSE);
    tick();

    expect(component.diffLoading()).toBe(false);
    expect(component.diffResult()).toBeTruthy();
    expect(component.diffResult()!.promptA.name).toBe('Defesa Prévia v1');
    expect(component.diffResult()!.promptB.name).toBe('Defesa Prévia v2');
  }));

  it('should not execute diff without both ids', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.openDiffDialog();
    component.diffIdA.set('');
    component.executeDiff();
    // No request should be made
  }));

  it('should handle diff error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.diffIdA.set(MOCK_PROMPTS_RESPONSE.data[0].id);
    component.diffIdB.set(MOCK_PROMPTS_RESPONSE.data[1].id);
    component.executeDiff();

    const req = httpTesting.expectOne((r) => r.url === `${promptsUrl}/diff`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.diffLoading()).toBe(false);
  }));

  // ═══════ Delete ═══════

  it('should confirm and execute delete', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[1]; // draft
    component.confirmDelete(prompt);
    expect(component.deleteMessage()).toContain('Recurso 1ª Instância v1');
    expect(component.deletingId()).toBe(prompt.id);

    component.executeDelete();
    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, id: prompt.id });

    flushPromptsList();
    tick();
  }));

  it('should handle delete error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    const prompt = component.prompts()[1];
    component.confirmDelete(prompt);
    component.executeDelete();

    const req = httpTesting.expectOne(`${promptsUrl}/${prompt.id}`);
    req.error(new ProgressEvent('error'), { status: 409, statusText: 'Conflict' });
    tick();

    expect(component.deleteMessage()).toBeNull();
    expect(component.deletingId()).toBeNull();
  }));

  it('should not execute delete without target', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialLoad();
    tick();

    component.executeDelete();
    // No request should be made
  }));

  // ═══════ Helpers ═══════

  it('should return correct type label', () => {
    expect(component.getTypeLabel('defesa_previa')).toBe('Defesa Prévia');
    expect(component.getTypeLabel('recurso_1a_instancia')).toBe('Recurso 1ª Instância');
    expect(component.getTypeLabel('recurso_2a_instancia')).toBe('Recurso 2ª Instância');
    expect(component.getTypeLabel('unknown')).toBe('unknown');
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('draft')).toBe('Rascunho');
    expect(component.getStatusLabel('active')).toBe('Ativo');
    expect(component.getStatusLabel('inactive')).toBe('Inativo');
    expect(component.getStatusLabel('archived')).toBe('Arquivado');
    expect(component.getStatusLabel('unknown')).toBe('unknown');
  });

  it('should return correct status color', () => {
    expect(component.getStatusColor('active')).toContain('green');
    expect(component.getStatusColor('draft')).toContain('blue');
    expect(component.getStatusColor('unknown')).toContain('gray');
  });
});
