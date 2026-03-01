import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

// Sensitive fields to redact from logged request bodies
const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'token',
  'access_token',
  'secret',
];

function redactSensitiveFields(body: any): any {
  if (!body || typeof body !== 'object') return body;
  const redacted = { ...body };
  for (const key of Object.keys(redacted)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    }
  }
  return redacted;
}

function buildActionLabel(method: string, path: string): string {
  // e.g. "POST /fleet/vehicles" -> "CREATE_VEHICLE"
  // Keep it human-readable: "POST /fleet/vehicles"
  return `${method.toUpperCase()} ${path}`;
}

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();

    // Only log mutating requests
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Skip logging for GPS location updates (too noisy)
    const path: string = request.route?.path || request.url || '';
    if (path.includes('/location')) {
      return next.handle();
    }

    const user = request.user; // Set by JwtAuthGuard
    const action = buildActionLabel(method, request.url);
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';

    // Build details from request body
    const details = request.body
      ? JSON.stringify(redactSensitiveFields(request.body))
      : null;

    return next.handle().pipe(
      tap({
        next: () => {
          // Fire-and-forget: log after successful response
          if (user?.userId || user?.sub) {
            const userId = user.userId || user.sub;
            this.auditService
              .log(action, userId, details || '', ip)
              .catch((err) =>
                console.error('[AuditInterceptor] Failed to log:', err.message),
              );
          }
        },
        error: () => {
          // Optionally log failed attempts too
          if (user?.userId || user?.sub) {
            const userId = user.userId || user.sub;
            this.auditService
              .log(`${action} [FAILED]`, userId, details || '', ip)
              .catch((err) =>
                console.error(
                  '[AuditInterceptor] Failed to log error:',
                  err.message,
                ),
              );
          }
        },
      }),
    );
  }
}
