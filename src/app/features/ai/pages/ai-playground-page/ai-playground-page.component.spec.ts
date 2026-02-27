import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AiPlaygroundPageComponent } from './ai-playground-page.component';
import type {
  AdminAiPromptsListResponse,
  AdminAiModelsListResponse,
  PlaygroundExecuteResponse,
  PlaygroundCompareResponse,
  PlaygroundTestDataResponse,
} from '../../models/ai.model';
import { environment } from '../../../../../environments/environment';

const promptsUrl = `${environment.apiUrl}/api/admin/ai/prompts`;
const modelsUrl = `${environment.apiUrl}/api/admin/ai/models`;
const playgroundUrl = `${environment.apiUrl}/api/admin/ai/playground`;

const MOCK_PROMPTS: AdminAiPromptsListResponse = {
  data: [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      name: 'Defesa Prévia v1',
      slug: 'defesa-previa-v1',
      type: 'defesa_previa',
      status: 'active',
      version: '1.0.0',
      description: 'Prompt para defesa prévia',
      isActive: true,
      generationsCount: 50,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
};

const MOCK_MODELS: AdminAiModelsListResponse = {
  data: [
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      providerId: '550e8400-e29b-41d4-a716-446655440000',
      providerName: 'Anthropic',
      providerSlug: 'anthropic',
      name: 'Claude Opus 4',
      slug: 'claude-opus-4',
      maxTokens: 4096,
      costPer1kInput: '0.015',
      costPer1kOutput: '0.075',
      priority: 1,
      isActive: true,
      generationsCount: 120,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
};

const MOCK_TEST_DATA: PlaygroundTestDataResponse = {
  promptType: 'defesa_previa',
  placeholders: {
    tipo_recurso: 'Defesa Prévia',
    nome: 'João da Silva',
    cpf: '***.***.***-00',
    cnh: '***********',
    categoria_cnh: 'AB',
    endereco: 'Rua das Flores, 123',
    placa: 'ABC-1D23',
    marca_modelo: 'Toyota Corolla',
    renavam: '00000000000',
    ait: 'AB12345678',
    data_infracao: '15/01/2025',
    hora_infracao: '14:30',
    local: 'Av. Paulista, 1000',
    codigo_infracao: '74550',
    descricao_infracao: 'Dirigir utilizando celular',
    artigo: 'Art. 252, VI',
    natureza: 'Gravíssima',
    orgao: 'DETRAN-SP',
    motivos: 'O condutor alega que não estava utilizando o celular.',
    relato: 'Eu estava apenas ajustando o GPS.',
    eh_proprietario: 'Sim',
    dados_proprietario: 'Mesmo condutor',
  },
};

const MOCK_EXECUTE_RESULT: PlaygroundExecuteResponse = {
  content: 'Excelentíssimo Senhor Presidente da JARI...',
  renderedSystemPrompt: 'Você é um advogado especialista em trânsito.',
  renderedUserPrompt: 'Gere uma defesa prévia para João da Silva.',
  metrics: {
    inputTokens: 150,
    outputTokens: 500,
    totalTokens: 650,
    durationMs: 2500,
    estimatedCost: 0.04,
    modelName: 'Claude Opus 4',
    modelSlug: 'claude-opus-4',
    providerName: 'Anthropic',
    providerSlug: 'anthropic',
    promptName: 'Defesa Prévia v1',
    promptVersion: '1.0.0',
  },
};

const MOCK_COMPARE_RESULT: PlaygroundCompareResponse = {
  resultA: {
    content: 'Resultado da configuração A...',
    renderedSystemPrompt: 'System A',
    renderedUserPrompt: 'User A',
    metrics: {
      inputTokens: 100,
      outputTokens: 400,
      totalTokens: 500,
      durationMs: 2000,
      estimatedCost: 0.03,
      modelName: 'Claude Opus 4',
      modelSlug: 'claude-opus-4',
      providerName: 'Anthropic',
      providerSlug: 'anthropic',
      promptName: 'Prompt A',
      promptVersion: '1.0.0',
    },
  },
  resultB: {
    content: 'Resultado da configuração B...',
    renderedSystemPrompt: 'System B',
    renderedUserPrompt: 'User B',
    metrics: {
      inputTokens: 120,
      outputTokens: 450,
      totalTokens: 570,
      durationMs: 3000,
      estimatedCost: 0.02,
      modelName: 'GPT-4o',
      modelSlug: 'gpt-4o',
      providerName: 'OpenAI',
      providerSlug: 'openai',
      promptName: 'Prompt B',
      promptVersion: '2.0.0',
    },
  },
};

describe('AiPlaygroundPageComponent', () => {
  let component: AiPlaygroundPageComponent;
  let fixture: ComponentFixture<AiPlaygroundPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiPlaygroundPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiPlaygroundPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const promptReq = httpTesting.expectOne((r) => r.url === promptsUrl);
    promptReq.flush(MOCK_PROMPTS);

    const modelReq = httpTesting.expectOne((r) => r.url === modelsUrl);
    modelReq.flush(MOCK_MODELS);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load prompts and models on init', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    expect(component.prompts().length).toBe(1);
    expect(component.models().length).toBe(1);
    expect(component.loadingPrompts()).toBe(false);
    expect(component.loadingModels()).toBe(false);
  }));

  it('should show empty state initially', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhuma geração executada');
  }));

  it('should handle prompts load error', fakeAsync(() => {
    fixture.detectChanges();

    const promptReq = httpTesting.expectOne((r) => r.url === promptsUrl);
    promptReq.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });

    const modelReq = httpTesting.expectOne((r) => r.url === modelsUrl);
    modelReq.flush(MOCK_MODELS);
    tick();

    expect(component.prompts().length).toBe(0);
    expect(component.loadingPrompts()).toBe(false);
  }));

  it('should handle models load error', fakeAsync(() => {
    fixture.detectChanges();

    const promptReq = httpTesting.expectOne((r) => r.url === promptsUrl);
    promptReq.flush(MOCK_PROMPTS);

    const modelReq = httpTesting.expectOne((r) => r.url === modelsUrl);
    modelReq.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.models().length).toBe(0);
    expect(component.loadingModels()).toBe(false);
  }));

  it('should load test data', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptTypeA.set('defesa_previa');
    component.loadTestData();

    const req = httpTesting.expectOne(`${playgroundUrl}/test-data/defesa_previa`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_TEST_DATA);
    tick();

    expect(component.testDataKeys().length).toBe(22);
    expect(component.testData()['nome']).toBe('João da Silva');
    expect(component.loadingTestData()).toBe(false);
  }));

  it('should handle test data load error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptTypeA.set('defesa_previa');
    component.loadTestData();

    const req = httpTesting.expectOne(`${playgroundUrl}/test-data/defesa_previa`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.testDataKeys().length).toBe(0);
    expect(component.loadingTestData()).toBe(false);
  }));

  it('should not load test data without prompt type', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptTypeA.set('');
    component.loadTestData();
    // No HTTP request should be made
    expect(component.loadingTestData()).toBe(false);
  }));

  it('should execute generation successfully', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptIdA.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdA.set('550e8400-e29b-41d4-a716-446655440020');
    component.testData.set(MOCK_TEST_DATA.placeholders);

    component.executeGeneration();

    const req = httpTesting.expectOne(`${playgroundUrl}/execute`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.promptId).toBe('550e8400-e29b-41d4-a716-446655440010');
    expect(req.request.body.modelId).toBe('550e8400-e29b-41d4-a716-446655440020');
    req.flush(MOCK_EXECUTE_RESULT);
    tick();

    expect(component.resultA()).toBeTruthy();
    expect(component.resultA()!.content).toBe('Excelentíssimo Senhor Presidente da JARI...');
    expect(component.resultA()!.metrics.totalTokens).toBe(650);
    expect(component.executing()).toBe(false);
  }));

  it('should show result after execution', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptIdA.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdA.set('550e8400-e29b-41d4-a716-446655440020');
    component.testData.set(MOCK_TEST_DATA.placeholders);

    component.executeGeneration();
    const req = httpTesting.expectOne(`${playgroundUrl}/execute`);
    req.flush(MOCK_EXECUTE_RESULT);
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Excelentíssimo Senhor Presidente da JARI...');
    expect(el.textContent).toContain('650');
    expect(el.textContent).toContain('2.5s');
  }));

  it('should handle execute error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptIdA.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdA.set('550e8400-e29b-41d4-a716-446655440020');
    component.testData.set(MOCK_TEST_DATA.placeholders);

    component.executeGeneration();
    const req = httpTesting.expectOne(`${playgroundUrl}/execute`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.resultA()).toBeNull();
    expect(component.executing()).toBe(false);
  }));

  it('should not execute without required fields', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    expect(component.canExecute()).toBe(false);

    component.executeGeneration();
    // No HTTP request should be made
    expect(component.executing()).toBe(false);
  }));

  it('should toggle compare mode', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    expect(component.compareMode()).toBe(false);

    component.onCompareModeChange(true);
    expect(component.compareMode()).toBe(true);

    component.selectedPromptIdB.set('some-id');
    component.selectedModelIdB.set('some-model-id');

    component.onCompareModeChange(false);
    expect(component.compareMode()).toBe(false);
    expect(component.selectedPromptIdB()).toBe('');
    expect(component.selectedModelIdB()).toBe('');
  }));

  it('should require config B in compare mode', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptIdA.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdA.set('550e8400-e29b-41d4-a716-446655440020');
    component.testData.set(MOCK_TEST_DATA.placeholders);

    expect(component.canExecute()).toBe(true);

    component.onCompareModeChange(true);
    expect(component.canExecute()).toBe(false);

    component.selectedPromptIdB.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdB.set('550e8400-e29b-41d4-a716-446655440020');
    expect(component.canExecute()).toBe(true);
  }));

  it('should execute comparison successfully', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptIdA.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdA.set('550e8400-e29b-41d4-a716-446655440020');
    component.testData.set(MOCK_TEST_DATA.placeholders);
    component.onCompareModeChange(true);
    component.selectedPromptIdB.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdB.set('550e8400-e29b-41d4-a716-446655440020');

    component.executeGeneration();

    const req = httpTesting.expectOne(`${playgroundUrl}/compare`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.configA.promptId).toBe('550e8400-e29b-41d4-a716-446655440010');
    expect(req.request.body.configB.promptId).toBe('550e8400-e29b-41d4-a716-446655440010');
    req.flush(MOCK_COMPARE_RESULT);
    tick();

    expect(component.resultA()).toBeTruthy();
    expect(component.resultB()).toBeTruthy();
    expect(component.resultA()!.content).toBe('Resultado da configuração A...');
    expect(component.resultB()!.content).toBe('Resultado da configuração B...');
    expect(component.executing()).toBe(false);
  }));

  it('should handle compare error', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptIdA.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdA.set('550e8400-e29b-41d4-a716-446655440020');
    component.testData.set(MOCK_TEST_DATA.placeholders);
    component.onCompareModeChange(true);
    component.selectedPromptIdB.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdB.set('550e8400-e29b-41d4-a716-446655440020');

    component.executeGeneration();
    const req = httpTesting.expectOne(`${playgroundUrl}/compare`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Error' });
    tick();

    expect(component.resultA()).toBeNull();
    expect(component.resultB()).toBeNull();
    expect(component.executing()).toBe(false);
  }));

  it('should show compare results side by side', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.selectedPromptIdA.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdA.set('550e8400-e29b-41d4-a716-446655440020');
    component.testData.set(MOCK_TEST_DATA.placeholders);
    component.onCompareModeChange(true);
    component.selectedPromptIdB.set('550e8400-e29b-41d4-a716-446655440010');
    component.selectedModelIdB.set('550e8400-e29b-41d4-a716-446655440020');

    component.executeGeneration();
    const req = httpTesting.expectOne(`${playgroundUrl}/compare`);
    req.flush(MOCK_COMPARE_RESULT);
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Resultado A');
    expect(el.textContent).toContain('Resultado B');
    expect(el.textContent).toContain('Resultado da configuração A...');
    expect(el.textContent).toContain('Resultado da configuração B...');
  }));

  it('should update test data fields', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.testData.set({ nome: 'Original', cpf: '000.000.000-00' });
    component.updateTestDataField('nome', 'Novo Nome');

    expect(component.testData()['nome']).toBe('Novo Nome');
    expect(component.testData()['cpf']).toBe('000.000.000-00');
  }));

  it('should format duration correctly', () => {
    expect(component.formatDuration(500)).toBe('500ms');
    expect(component.formatDuration(2500)).toBe('2.5s');
    expect(component.formatDuration(10000)).toBe('10.0s');
    expect(component.formatDuration(999)).toBe('999ms');
  });

  it('should show skeleton while loading prompts', fakeAsync(() => {
    fixture.detectChanges();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const skeletons = el.querySelectorAll('[role="status"]');
    expect(skeletons.length).toBeGreaterThan(0);

    flushInitialRequests();
    tick();
    fixture.detectChanges();

    expect(component.loadingPrompts()).toBe(false);
    expect(component.loadingModels()).toBe(false);
  }));

  it('should clear result B when disabling compare mode', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();

    component.resultB.set(MOCK_COMPARE_RESULT.resultB);
    component.onCompareModeChange(false);

    expect(component.resultB()).toBeNull();
  }));

  it('should display prompt type options', fakeAsync(() => {
    fixture.detectChanges();
    flushInitialRequests();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Defesa Prévia');
    expect(el.textContent).toContain('Recurso 1ª Instância');
    expect(el.textContent).toContain('Recurso 2ª Instância');
  }));
});
