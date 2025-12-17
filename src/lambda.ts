import "reflect-metadata";

import {
  ValidationPipe,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { Callback, Context, Handler } from "aws-lambda";

import { AppModule } from "./app.module";

@Catch()
class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : "Internal server error";

    const errorDetails = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === "string"
          ? message
          : (message as any)?.message || message,
      error:
        exception instanceof Error
          ? {
              name: exception.name,
              message: exception.message,
              stack: exception.stack,
            }
          : exception,
    };

    console.error(
      "[EXCEPTION_FILTER] Unhandled exception:",
      JSON.stringify(errorDetails, null, 2)
    );

    response.status(status).json({
      statusCode: status,
      message:
        typeof message === "string"
          ? message
          : (message as any)?.message || "Internal server error",
      timestamp: errorDetails.timestamp,
      path: errorDetails.path,
    });
  }
}

// @vendia/serverless-express is CommonJS; in this repo we compile to CJS without esModuleInterop,
// so we use `require()` and cast to the default export type to avoid `.default is not a function` at runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverlessExpress =
  require("@vendia/serverless-express") as typeof import("@vendia/serverless-express").default;

let cachedServer: Handler | null = null;

function normalizeApiGatewayEvent(event: any): any {
  if (!event || typeof event !== "object") return event;
  if (!event.headers || typeof event.headers !== "object") return event;

  const headers: Record<string, any> = event.headers;
  const body: unknown = event.body;

  // If API Gateway/offline provides a Content-Length that doesn't match the body bytes,
  // Express' body-parser can throw: "request size did not match content length".
  // Normalize (or remove) the header so the generated Node req stream is consistent.
  if (typeof body === "string") {
    const buf = event.isBase64Encoded
      ? Buffer.from(body, "base64")
      : Buffer.from(body, "utf8");
    headers["content-length"] = String(buf.length);
    headers["Content-Length"] = String(buf.length);
  } else if (body == null) {
    // No body: ensure we don't advertise a non-zero length.
    if (headers["content-length"] && String(headers["content-length"]) !== "0")
      delete headers["content-length"];
    if (headers["Content-Length"] && String(headers["Content-Length"]) !== "0")
      delete headers["Content-Length"];
  }

  return event;
}

async function bootstrapServer(): Promise<Handler> {
  try {
    console.log("[BOOTSTRAP] Starting NestJS app creation...");
    console.log("[BOOTSTRAP] Environment variables:", {
      NODE_ENV: process.env.NODE_ENV,
      DB_URL: process.env.DB_URL ? "SET" : "NOT SET",
      DB_SCHEMA: process.env.DB_SCHEMA,
    });

    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    // const logger = app.get(Logger);
    // app.useLogger(logger);

    app.setGlobalPrefix("api");

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
      })
    );

    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    const serverlessHandler = serverlessExpress({ app: expressApp });
    console.log("[BOOTSTRAP] Serverless express handler created");

    return serverlessHandler;
  } catch (error: any) {
    console.error("[BOOTSTRAP] Error bootstrapping Nest app in Lambda:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      errors: error?.errors,
      error: error,
    });
    throw error;
  }
}

export const handler: Handler = async (
  event: any,
  context: Context,
  _callback: Callback
) => {
  // Log request details for debugging
  console.log("[LAMBDA] Handler invoked", {
    path: event?.path || event?.requestContext?.http?.path || "unknown",
    method:
      event?.httpMethod || event?.requestContext?.http?.method || "unknown",
    headers: event?.headers ? Object.keys(event.headers) : [],
    hasBody: !!event?.body,
    environment: process.env.NODE_ENV,
    dbUrlSet: !!process.env.DB_URL,
    dbSchema: process.env.DB_SCHEMA,
  });

  try {
    if (!cachedServer) {
      console.log("[LAMBDA] Bootstrapping server...");
      cachedServer = await bootstrapServer();
      console.log("[LAMBDA] Server bootstrapped successfully");
    }

    const normalizedEvent = normalizeApiGatewayEvent(event);
    console.log("[LAMBDA] Calling serverless-express handler");

    const result = await new Promise((resolve, reject) => {
      try {
        const handlerResult = (cachedServer as any)(
          normalizedEvent,
          context,
          (error: any, response: any) => {
            if (error) {
              console.error("[LAMBDA] Handler callback error:", error);
              reject(error);
            } else {
              console.log("[LAMBDA] Handler success:", {
                statusCode: response?.statusCode,
                headers: response?.headers ? Object.keys(response.headers) : [],
              });
              resolve(response);
            }
          }
        );

        // Handle promise-based responses
        if (handlerResult && typeof handlerResult.then === "function") {
          handlerResult
            .then((response: any) => {
              console.log("[LAMBDA] Handler promise resolved:", {
                statusCode: response?.statusCode,
              });
              resolve(response);
            })
            .catch((error: any) => {
              console.error("[LAMBDA] Handler promise rejected:", error);
              reject(error);
            });
        } else if (handlerResult) {
          resolve(handlerResult);
        }
      } catch (error) {
        console.error("[LAMBDA] Error in handler execution:", error);
        reject(error);
      }
    });

    return result;
  } catch (error: any) {
    console.error("[LAMBDA] Unhandled error in handler:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      error: error,
    });

    // Return a proper error response
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error?.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
