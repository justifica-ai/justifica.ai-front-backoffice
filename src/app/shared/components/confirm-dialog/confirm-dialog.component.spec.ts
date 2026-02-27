import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start closed', () => {
    expect(component.open()).toBe(false);
  });

  it('should open on show()', () => {
    component.show();
    expect(component.open()).toBe(true);
  });

  it('should close on hide()', () => {
    component.show();
    component.hide();
    expect(component.open()).toBe(false);
  });

  it('should emit confirmed and close on confirm()', () => {
    let emitCount = 0;
    component.confirmed.subscribe(() => { emitCount++; });
    component.show();
    component.confirm();
    expect(component.open()).toBe(false);
    expect(emitCount).toBe(1);
  });

  it('should emit cancelled and close on cancel()', () => {
    let emitCount = 0;
    component.cancelled.subscribe(() => { emitCount++; });
    component.show();
    component.cancel();
    expect(component.open()).toBe(false);
    expect(emitCount).toBe(1);
  });

  it('should render dialog content when open', () => {
    component.show();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alertdialog"]')).toBeTruthy();
  });

  it('should not render dialog when closed', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alertdialog"]')).toBeNull();
  });
});
