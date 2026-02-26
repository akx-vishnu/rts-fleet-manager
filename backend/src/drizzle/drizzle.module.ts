import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dns from 'dns';
import * as schema from './schema';

// Force Node.js to prefer IPv4 over IPv6 for DNS resolution
// This avoids ENETUNREACH errors when IPv6 addresses are unreachable
dns.setDefaultResultOrder('ipv4first');

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
    providers: [
        {
            provide: DRIZZLE,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const connectionString = configService.get<string>('DATABASE_URL');
                const pool = new Pool({
                    connectionString,
                    ssl: { rejectUnauthorized: false },
                });
                return drizzle(pool, { schema });
            },
        },
    ],
    exports: [DRIZZLE],
})
export class DrizzleModule { }
