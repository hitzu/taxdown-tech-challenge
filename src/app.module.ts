import { Module } from "@nestjs/common";
import { ConfigurationModule } from "./shared/config/configuration.module";
import { LoggingModule } from "./shared/logging/logging.module";
import { HealthModule } from "./health/health.module";
import { CustomerModule } from "./customer/infrastructure/http/customer.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getTypeOrmConfig } from "./shared/persistence/typeorm.config";

@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    HealthModule,
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    CustomerModule,
  ],
})
export class AppModule {}
