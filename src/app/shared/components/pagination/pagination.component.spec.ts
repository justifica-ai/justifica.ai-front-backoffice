import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('pagination', { page: 1, limit: 20, total: 100, totalPages: 5 });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit page change', () => {
    fixture.componentRef.setInput('pagination', { page: 1, limit: 20, total: 100, totalPages: 5 });
    fixture.detectChanges();
    const emitted: number[] = [];
    component.pageChange.subscribe((p: number) => emitted.push(p));
    component.goToPage(2);
    expect(emitted).toEqual([2]);
  });

  it('should not emit for same page', () => {
    fixture.componentRef.setInput('pagination', { page: 1, limit: 20, total: 100, totalPages: 5 });
    fixture.detectChanges();
    const emitted: number[] = [];
    component.pageChange.subscribe((p: number) => emitted.push(p));
    component.goToPage(1);
    expect(emitted).toEqual([]);
  });

  it('should not emit for out of range page', () => {
    fixture.componentRef.setInput('pagination', { page: 1, limit: 20, total: 100, totalPages: 5 });
    fixture.detectChanges();
    const emitted: number[] = [];
    component.pageChange.subscribe((p: number) => emitted.push(p));
    component.goToPage(0);
    component.goToPage(6);
    expect(emitted).toEqual([]);
  });

  it('should calculate start and end items', () => {
    fixture.componentRef.setInput('pagination', { page: 2, limit: 20, total: 50, totalPages: 3 });
    fixture.detectChanges();
    expect(component.startItem()).toBe(21);
    expect(component.endItem()).toBe(40);
  });

  it('should calculate end item for last page', () => {
    fixture.componentRef.setInput('pagination', { page: 3, limit: 20, total: 50, totalPages: 3 });
    fixture.detectChanges();
    expect(component.endItem()).toBe(50);
  });

  it('should return all pages when totalPages <= 7', () => {
    fixture.componentRef.setInput('pagination', { page: 1, limit: 20, total: 100, totalPages: 5 });
    fixture.detectChanges();
    expect(component.visiblePages()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should show ellipsis for many pages', () => {
    fixture.componentRef.setInput('pagination', { page: 5, limit: 20, total: 200, totalPages: 10 });
    fixture.detectChanges();
    const pages = component.visiblePages();
    expect(pages[0]).toBe(1);
    expect(pages).toContain(-1); // ellipsis
    expect(pages[pages.length - 1]).toBe(10);
  });

  it('should not render when totalPages is 1', () => {
    fixture.componentRef.setInput('pagination', { page: 1, limit: 20, total: 5, totalPages: 1 });
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).toBeNull();
  });
});
