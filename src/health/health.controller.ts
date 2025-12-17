import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {
    // Verify dependency injection worked
    if (!this.healthService) {
      console.error('[HEALTH] CRITICAL: healthService is not injected!');
      throw new Error('HealthService dependency injection failed');
    }
    console.log('[HEALTH] Controller instantiated with service:', !!this.healthService);
  }

  @Get()
  @ApiOperation({ summary: 'Basic health check endpoint' })
  @ApiOkResponse({ description: 'Service is up and running' })
  getHealth() {
    console.log('[HEALTH] Health check endpoint called');
    console.log('[HEALTH] Service available:', !!this.healthService);
    
    if (!this.healthService) {
      console.error('[HEALTH] Service is undefined at call time!');
      throw new Error('HealthService is not available');
    }
    
    try {
      const result = this.healthService.getHealth();
      console.log('[HEALTH] Health check result:', result);
      return result;
    } catch (error) {
      console.error('[HEALTH] Error in health check:', error);
      throw error;
    }
  }
}


