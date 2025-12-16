import { HealthService } from './health.service';

describe('HealthService', () => {
  it('should return ok status and metadata', () => {
    const service = new HealthService();
    const res = service.getHealth();

    expect(res.status).toBe('ok');
    expect(typeof res.timestamp).toBe('string');
    expect(typeof res.uptime).toBe('number');
  });
});


