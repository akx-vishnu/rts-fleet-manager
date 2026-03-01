import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { EmployeesService } from './rosters/employees/employees.service';
import { Role } from './common/enums/role.enum';
import { DRIZZLE } from './drizzle/drizzle.module';
import { employees, users } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const employeesService = app.get(EmployeesService);
    const db = app.get(DRIZZLE);

    console.log('🌱 Clearing existing employees...');
    try {
        // Delete all employees first
        await db.delete(employees);
        console.log('✅ Employees cleared');
    } catch (error) {
        console.error('❌ Error clearing employees:', error);
    }

    const testEmployees = [
        { name: 'John Doe', phone: '9876543210', id: 'EMP001', dept: 'Engineering', post: 'Software Engineer' },
        { name: 'Jane Smith', phone: '9876543211', id: 'EMP002', dept: 'HR', post: 'HR Manager' },
        { name: 'Alice Johnson', phone: '9876543212', id: 'EMP003', dept: 'Marketing', post: 'Creative Lead' },
        { name: 'Bob Wilson', phone: '9876543213', id: 'EMP004', dept: 'Operations', post: 'Operations Head' },
        { name: 'Charlie Brown', phone: '9876543214', id: 'EMP005', dept: 'Finance', post: 'Accountant' },
    ];

    console.log('🌱 Seeding 5 test employees...');

    for (const emp of testEmployees) {
        try {
            // Create employee record directly
            await employeesService.create({
                name: emp.name,
                phone: emp.phone,
                employee_id: emp.id,
                department: emp.dept,
                designation: emp.post,
                shift_start: '09:00',
                shift_end: '18:00'
            });
            console.log(`✅ Created employee: ${emp.id} (${emp.name})`);
        } catch (error) {
            console.error(`❌ Error seeding ${emp.name}:`, error.message);
        }
    }

    console.log('✅ Employee seeding complete!');
    await app.close();
}

bootstrap();
