
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DRIZZLE } from './src/drizzle/drizzle.module';
import * as schema from './src/drizzle/schema';
import { eq } from 'drizzle-orm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const db = app.get(DRIZZLE);

    const today = new Date().toISOString().split('T')[0];
    console.log('Checking for date:', today);

    const assignments = await db.query.rosterAssignments.findMany({
        where: eq(schema.rosterAssignments.date, today),
    });

    console.log(`Found ${assignments.length} roster assignments for ${today}`);

    const allAssignments = await db.query.rosterAssignments.findMany({ limit: 5 });
    console.log('Sample assignments (any date):', allAssignments);

    await app.close();
}
bootstrap();
