import { requestIdInterceptor } from './request-id.interceptor';

describe('requestIdInterceptor', () => {
  it('should be defined', () => {
    expect(requestIdInterceptor).toBeDefined();
    expect(typeof requestIdInterceptor).toBe('function');
  });
});
