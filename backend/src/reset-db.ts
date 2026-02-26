import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DRIZZLE } from './drizzle/drizzle.module';
import { sql } from 'drizzle-orm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const db = app.get(DRIZZLE);

    console.log('⚠️  WARNING: Preparing to truncate all tables for a fresh start...');

    const tables = [
        'boarding_logs',
        'gps_logs',
        'trips',
        'rosters',
        'employees',
        'drivers',
        'audit_logs',
        'vehicles',
        'routes',
        'users',
        'leave_requests'
    ];

    for (const table of tables) {
        try {
            // Using raw SQL for efficient truncation with CASCADE
            await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
            console.log(`✅ Truncated table: ${table}`);
        } catch (error) {
            console.log(`ℹ️  Table ${table} skip/error:`, error instanceof Error ? error.message : String(error));
        }
    }

    console.log('✨ All tables cleared. You can now run the schema push command.');
    await app.close();
}

bootstrap();
