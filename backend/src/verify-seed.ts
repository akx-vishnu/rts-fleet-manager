import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DRIZZLE } from './drizzle/drizzle.module';
import { users, employees } from './drizzle/schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const db = app.get(DRIZZLE);

    console.log('🔍 Verifying seeded data...');

    const allUsers = await db.select().from(users);
    console.log(`User Count: ${allUsers.length}`);
    allUsers.forEach((u: any) => console.log(`- User: ${u.name} | Phone: ${u.phone} | Email: ${u.email}`));

    const allEmployees = await db.select().from(employees);
    console.log(`Employee Count: ${allEmployees.length}`);
    allEmployees.forEach((e: any) => console.log(`- Emp ID: ${e.employee_id} | User UUID: ${e.user_id}`));

    await app.close();
}

bootstrap();
