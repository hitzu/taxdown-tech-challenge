import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true
                }
              }
            : undefined,
        level: process.env.LOG_LEVEL ?? 'info'
      }
    })
  ]
})
export class LoggingModule {}


