import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { FleetService } from './fleet/fleet.service';
import { Role } from './common/enums/role.enum';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const fleetService = app.get(FleetService);

    console.log('🌱 Seeding 5 test drivers...');

    const driversData = [
        { name: 'Rajesh Kumar', phone: '9000000001', license: 'TN-37-2023-0001' },
        { name: 'Suresh Raina', phone: '9000000002', license: 'TN-37-2023-0002' },
        { name: 'Vijay Sethu', phone: '9000000003', license: 'TN-37-2023-0003' },
        { name: 'Ajith Kumar', phone: '9000000004', license: 'TN-37-2023-0004' },
        { name: 'Surya Sivakumar', phone: '9000000005', license: 'TN-37-2023-0005' },
    ];

    const password = 'driver123';

    console.log('--------------------------------------------------');
    console.log('📋 DRIVER LOGIN CREDENTIALS:');
    console.log('--------------------------------------------------');

    for (const d of driversData) {
        try {
            // 1. Create User
            const user = await usersService.create({
                phone: d.phone,
                name: d.name,
                password: password,
                role: Role.DRIVER,
            });

            // 2. Create Driver Profile
            await fleetService.createDriver({
                userId: user.id,
                license_number: d.license,
                status: 'active',
            });

            console.log(`✅ Driver: ${d.name}`);
            console.log(`   Phone: ${d.phone}`);
            console.log(`   Password: ${password}`);
            console.log('--------------------------------------------------');
        } catch (error) {
            console.error(`❌ Error seeding driver ${d.name}:`, error.message);
        }
    }

    console.log('✨ Driver seeding complete!');
    await app.close();
}

bootstrap();
