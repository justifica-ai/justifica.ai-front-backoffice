import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  it('should be defined', () => {
    expect(errorInterceptor).toBeDefined();
    expect(typeof errorInterceptor).toBe('function');
  });
});
