import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FleetService } from './fleet/fleet.service';
import { VehicleStatus } from './drizzle/schema/fleet';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const fleetService = app.get(FleetService);

    console.log('🌱 Seeding 5 test vehicles...');

    const vehiclesData = [
        { license_plate: 'TN-37-AA-1234', model: 'Force Traveller', capacity: 17, owner: 'Rudra Travels', owner_phone: '9843012345', status: VehicleStatus.ACTIVE },
        { license_plate: 'TN-37-BB-5678', model: 'Bharat Benz Bus', capacity: 32, owner: 'SRM Transport', owner_phone: '9843067890', status: VehicleStatus.ACTIVE },
        { license_plate: 'TN-38-CC-9012', model: 'Tata Winger', capacity: 13, owner: 'City Fleet', owner_phone: '9843011223', status: VehicleStatus.ACTIVE },
        { license_plate: 'TN-38-DD-3456', model: 'Eicher Starline', capacity: 25, owner: 'Rudra Travels', owner_phone: '9843012345', status: VehicleStatus.ACTIVE },
        { license_plate: 'TN-01-EE-7890', model: 'Mahindra TUV300', capacity: 7, owner: 'Private Hire', owner_phone: '9843055667', status: VehicleStatus.MAINTENANCE },
    ];

    for (const v of vehiclesData) {
        try {
            await fleetService.createVehicle(v);
            console.log(`✅ Vehicle: ${v.license_plate} (${v.model}) - Owner: ${v.owner}`);
        } catch (error) {
            console.error(`❌ Error seeding vehicle ${v.license_plate}:`, error.message);
        }
    }

    console.log('✨ Vehicle seeding complete!');
    await app.close();
}

bootstrap();
