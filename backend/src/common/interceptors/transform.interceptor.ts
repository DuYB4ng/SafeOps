import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
@Injectable()
export class TransformInterceptor implements NestInterceptor<unknown, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((result: unknown) => {
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          return {
            statusCode: response.statusCode,
            data: result.data,
            meta: result.meta,
          };
        }
        return { statusCode: response.statusCode, data: result };
      }),
    );
  }
}
