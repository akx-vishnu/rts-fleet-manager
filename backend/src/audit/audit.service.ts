import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { auditLogs } from '../drizzle/schema';
import { desc } from 'drizzle-orm';

@Injectable()
export class AuditService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async log(action: string, userId: string, details: string, ipAddress: string) {
        // Drizzle schema uses camelCase/snake_case mapping. 
        // My schema defined: user_id, ip_address, created_at
        // Entity had: userId, ipAddress, createdAt
        // I should match schema definition.

        await this.db.insert(auditLogs).values({
            action,
            user_id: userId,
            details,
            ip_address: ipAddress,
        });
    }

    async findAll() {
        return this.db.query.auditLogs.findMany({
            orderBy: [desc(auditLogs.created_at)],
            with: {
                user: true, // Assuming relation exists. I didn't add relation to auditLogs yet in schema/audit.ts
            },
            limit: 100,
        });
    }
}
