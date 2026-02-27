import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('should add a success toast', () => {
    service.success('Sucesso', 'Operação concluída');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].title).toBe('Sucesso');
    expect(toasts[0].message).toBe('Operação concluída');
  });

  it('should add an error toast', () => {
    service.error('Erro', 'Algo falhou');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('should add a warning toast', () => {
    service.warning('Aviso', 'Cuidado');
    expect(service.toasts()[0].type).toBe('warning');
  });

  it('should add an info toast', () => {
    service.info('Informação');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should dismiss a toast by id', () => {
    service.success('Toast 1');
    service.success('Toast 2');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].title).toBe('Toast 2');
  });
});
