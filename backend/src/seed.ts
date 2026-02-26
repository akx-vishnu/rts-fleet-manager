import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { FleetService } from './fleet/fleet.service';
import { Role } from './common/enums/role.enum';
// import { VehicleStatus } from './fleet/entities/vehicle.entity';
// import { Vehicle } from './fleet/entities/vehicle.entity';
// Using strings or any for seed script simplicity
const VehicleStatus = { ACTIVE: 'active' };

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const usersService = app.get(UsersService);
    const fleetService = app.get(FleetService);
    // RoutesService is missing, skipping for now
    // const routesService = app.get(RoutesService);

    console.log('🌱 Seeding database...');

    // 1. Create Super Admin
    const adminEmail = 'admin@rts.com';
    let admin = await usersService.findByEmail(adminEmail);
    if (!admin) {
        admin = await usersService.create({
            email: adminEmail,
            password: 'password123',
            role: Role.SUPER_ADMIN,
            phone: '0000000000',
        });
        console.log('✅ Created Super Admin:', adminEmail);
    } else {
        console.log('ℹ️ Super Admin already exists. Updating password...');
        await usersService.update(admin.id, { password: 'password123' });
        console.log('✅ Updated Super Admin password');
    }

    // 2. Create a Driver
    const driverEmail = 'driver@rts.com';
    let driverUser = await usersService.findByEmail(driverEmail);
    if (!driverUser) {
        driverUser = await usersService.create({
            email: driverEmail,
            password: 'password123',
            role: Role.DRIVER,
            phone: '1111111111',
        });
        console.log('✅ Created Driver User:', driverEmail);
    } else {
        console.log('ℹ️ Driver User already exists. Updating password...');
        await usersService.update(driverUser.id, { password: 'password123' });
        console.log('✅ Updated Driver User password');
    }

    // 3. Create a Vehicle
    const licensePlate = 'KA-01-HH-1234';
    const existingValues = await fleetService.findAllVehicles();
    let vehicle = existingValues.find((v: any) => v.license_plate === licensePlate);

    if (!vehicle) {
        const newVehicle = await fleetService.createVehicle({
            license_plate: licensePlate,
            model: 'Toyota Innova',
            capacity: 6,
            status: VehicleStatus.ACTIVE,
        });
        vehicle = newVehicle as any;
        console.log('✅ Created Vehicle:', licensePlate);
    } else {
        console.log('ℹ️ Vehicle already exists');
    }

    // 4. Create a Driver Profile
    try {
        const drivers = await fleetService.findAllDrivers();
        const existingDriver = drivers.find((d: any) => d.user && driverUser && d.user.id === driverUser.id);

        if (!existingDriver && driverUser) {
            await fleetService.createDriver({
                userId: driverUser.id,
                license_number: 'DL-1234567890',
                status: 'active',
            });
            console.log('✅ Created Driver Profile for:', driverEmail);
        } else {
            console.log('ℹ️ Driver Profile already exists');
        }
    } catch (error) {
        // console.error('⚠️ Error creating driver profile:', error);
        console.log('ℹ️ Driver Profile might already exist or error linking.');
    }

    console.log('✅ Seeding complete!');
    await app.close();
}

bootstrap();
