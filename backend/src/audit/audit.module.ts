import { Module, Global } from '@nestjs/common';

import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditLoggingInterceptor } from './audit-logging.interceptor';

@Global()
@Module({
  imports: [],
  providers: [AuditService, AuditLoggingInterceptor],
  controllers: [AuditController],
  exports: [AuditService, AuditLoggingInterceptor],
})
export class AuditModule {}
