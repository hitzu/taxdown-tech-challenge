import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import type { Callback, Context, Handler } from 'aws-lambda';

import { AppModule } from './app.module';

// @vendia/serverless-express is CommonJS; in this repo we compile to CJS without esModuleInterop,
// so we use `require()` and cast to the default export type to avoid `.default is not a function` at runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverlessExpress = require('@vendia/serverless-express') as typeof import('@vendia/serverless-express').default;

let cachedServer: Handler | null = null;

function normalizeApiGatewayEvent(event: any): any {
  if (!event || typeof event !== 'object') return event;
  if (!event.headers || typeof event.headers !== 'object') return event;

  const headers: Record<string, any> = event.headers;
  const body: unknown = event.body;

  // If API Gateway/offline provides a Content-Length that doesn't match the body bytes,
  // Express' body-parser can throw: "request size did not match content length".
  // Normalize (or remove) the header so the generated Node req stream is consistent.
  if (typeof body === 'string') {
    const buf = event.isBase64Encoded ? Buffer.from(body, 'base64') : Buffer.from(body, 'utf8');
    headers['content-length'] = String(buf.length);
    headers['Content-Length'] = String(buf.length);
  } else if (body == null) {
    // No body: ensure we don't advertise a non-zero length.
    if (headers['content-length'] && String(headers['content-length']) !== '0') delete headers['content-length'];
    if (headers['Content-Length'] && String(headers['Content-Length']) !== '0') delete headers['Content-Length'];
  }

  return event;
}

async function bootstrapServer(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false
    })
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }

  return (cachedServer as any)(normalizeApiGatewayEvent(event), context, callback);
};


