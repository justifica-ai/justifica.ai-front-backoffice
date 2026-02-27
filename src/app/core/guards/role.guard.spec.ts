import { TestBed } from '@angular/core/testing';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  it('should be defined', () => {
    expect(roleGuard).toBeDefined();
    expect(typeof roleGuard).toBe('function');
  });
});
