import { Module } from '@nestjs/common';
import { ConfigurationModule } from './shared/config/configuration.module';
import { LoggingModule } from './shared/logging/logging.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigurationModule, LoggingModule, HealthModule]
})
export class AppModule {}


