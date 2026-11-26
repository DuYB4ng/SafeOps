import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { OptimisticLockVersionMismatchError } from 'typeorm';

const codes: Record<number, string> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN_ROLE',
  404: 'NOT_FOUND',
  409: 'INVALID_TRANSITION',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_SERVER_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    let statusCode = 500;
    let code = codes[500];
    let message: string | string[] = 'Internal server error';
    let details: unknown;
    if (exception instanceof OptimisticLockVersionMismatchError) {
      statusCode = 409;
      code = 'CONCURRENT_MODIFICATION';
      message = 'The resource was modified concurrently. Reload and retry.';
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      code = codes[statusCode] ?? 'HTTP_ERROR';
      if (statusCode < 500 || statusCode === 503) {
        const body = exception.getResponse();
        if (typeof body === 'string') message = body;
        else {
          const payload = body as {
            code?: string;
            message?: string | string[];
            details?: unknown;
          };
          code = payload.code ?? code;
          message = payload.message ?? exception.message;
          details = payload.details;
        }
      }
    }
    if (statusCode >= 500)
      this.logger.error('Request failed with HTTP ' + statusCode);
    response.status(statusCode).json({
      statusCode,
      code,
      message,
      ...(details === undefined ? {} : { details }),
      timestamp: new Date().toISOString(),
      path: request.path,
    });
  }
}
