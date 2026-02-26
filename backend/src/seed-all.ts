import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { FleetService } from './fleet/fleet.service';
import { EmployeesService } from './rosters/employees/employees.service';
import { Role } from './common/enums/role.enum';
import { DRIZZLE } from './drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle/schema';
import { routes, stops, routeStops, StopType } from './drizzle/schema/routes';
import { VehicleStatus } from './drizzle/schema/fleet';
import { eq } from 'drizzle-orm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const fleetService = app.get(FleetService);
    const employeesService = app.get(EmployeesService);
    const db: NodePgDatabase<typeof schema> = app.get(DRIZZLE);

    console.log('==========================================================');
    console.log('🚀 RTS Fleet Manager - Complete Database Seeder');
    console.log('==========================================================\n');

    // ────────────────────────────────────────────────────────────
    // 1. ADMIN USERS
    // ────────────────────────────────────────────────────────────
    console.log('📌 [1/6] Seeding Admin Users...');

    const admins = [
        { name: 'Super Admin', email: 'admin@rts.com', phone: '9000000000', password: 'Admin@123', role: Role.SUPER_ADMIN },
        { name: 'Fleet Manager', email: 'manager@rts.com', phone: '9000000099', password: 'Admin@123', role: Role.ADMIN },
    ];

    for (const a of admins) {
        try {
            const existing = await db.query.users.findFirst({ where: eq(schema.users.phone, a.phone) });
            if (!existing) {
                await usersService.create({ phone: a.phone, name: a.name, email: a.email, password: a.password, role: a.role });
                console.log(`   ✅ ${a.role}: ${a.name} (${a.phone})`);
            } else {
                await usersService.update(existing.id, { password: a.password });
                console.log(`   ℹ️  ${a.role} already exists: ${a.name} — password reset`);
            }
        } catch (e) { console.error(`   ❌ ${a.name}:`, e.message); }
    }

    // ────────────────────────────────────────────────────────────
    // 2. DRIVERS (users + driver profiles)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 [2/6] Seeding Drivers...');

    const driversData = [
        { name: 'Rajesh Kumar', phone: '9100000001', license: 'KL-14-2024-0001' },
        { name: 'Suresh Menon', phone: '9100000002', license: 'KL-14-2024-0002' },
        { name: 'Vijay Prakash', phone: '9100000003', license: 'KL-14-2024-0003' },
        { name: 'Arun Nair', phone: '9100000004', license: 'KL-14-2024-0004' },
        { name: 'Manoj Chandran', phone: '9100000005', license: 'KL-14-2024-0005' },
    ];
    const driverPassword = 'Driver@123';
    const createdDriverIds: string[] = [];

    for (const d of driversData) {
        try {
            let user = await db.query.users.findFirst({ where: eq(schema.users.phone, d.phone) });
            if (!user) {
                user = await usersService.create({ phone: d.phone, name: d.name, password: driverPassword, role: Role.DRIVER });
                console.log(`   ✅ User: ${d.name} (${d.phone})`);
            } else {
                await usersService.update(user.id, { password: driverPassword });
                console.log(`   ℹ️  User exists: ${d.name} — password reset`);
            }

            // Create driver profile
            const existingDrivers = await fleetService.findAllDrivers();
            const hasProfile = existingDrivers.find((dr: any) => dr.user_id === user!.id);
            if (!hasProfile) {
                const driver = await fleetService.createDriver({ userId: user.id, license_number: d.license, status: 'active' });
                createdDriverIds.push((driver as any).id);
                console.log(`   ✅ Driver profile: ${d.license}`);
            } else {
                createdDriverIds.push((hasProfile as any).id);
                console.log(`   ℹ️  Driver profile exists: ${d.license}`);
            }
        } catch (e) { console.error(`   ❌ ${d.name}:`, e.message); }
    }

    // ────────────────────────────────────────────────────────────
    // 3. VEHICLES
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 [3/6] Seeding Vehicles...');

    const vehiclesData = [
        { license_plate: 'KL-14-AA-1234', model: 'Force Traveller 3350', capacity: 17, owner: 'Rudra Travels', owner_phone: '9400012345', status: VehicleStatus.ACTIVE },
        { license_plate: 'KL-14-BB-5678', model: 'Bharat Benz 407', capacity: 32, owner: 'City Transport', owner_phone: '9400067890', status: VehicleStatus.ACTIVE },
        { license_plate: 'KL-14-CC-9012', model: 'Tata Winger', capacity: 13, owner: 'Kerala Fleet', owner_phone: '9400011223', status: VehicleStatus.ACTIVE },
        { license_plate: 'KL-14-DD-3456', model: 'Eicher Starline', capacity: 25, owner: 'Rudra Travels', owner_phone: '9400012345', status: VehicleStatus.ACTIVE },
        { license_plate: 'KL-14-EE-7890', model: 'Mahindra Bolero Maxx', capacity: 7, owner: 'Private Hire', owner_phone: '9400055667', status: VehicleStatus.ACTIVE },
        { license_plate: 'KL-07-FF-2468', model: 'Toyota Innova Crysta', capacity: 6, owner: 'RTS Fleet', owner_phone: '9400099887', status: VehicleStatus.ACTIVE },
        { license_plate: 'KL-07-GG-1357', model: 'Tempo Traveller', capacity: 12, owner: 'Green Line', owner_phone: '9400033445', status: VehicleStatus.MAINTENANCE },
    ];
    const createdVehicleIds: string[] = [];

    for (const v of vehiclesData) {
        try {
            const existing = await fleetService.findAllVehicles();
            const found = existing.find((ev: any) => ev.license_plate === v.license_plate);
            if (!found) {
                const vehicle = await fleetService.createVehicle(v);
                createdVehicleIds.push((vehicle as any).id);
                console.log(`   ✅ Vehicle: ${v.license_plate} (${v.model}) — Owner: ${v.owner}`);
            } else {
                createdVehicleIds.push((found as any).id);
                console.log(`   ℹ️  Vehicle exists: ${v.license_plate}`);
            }
        } catch (e) { console.error(`   ❌ ${v.license_plate}:`, e.message); }
    }

    // ────────────────────────────────────────────────────────────
    // 4. EMPLOYEES (users + employee profiles)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 [4/6] Seeding Employees...');

    const employeesData = [
        { name: 'Anil Sharma', phone: '9200000001', empId: 'EMP001', dept: 'Engineering', designation: 'Software Engineer', shiftStart: '09:00', shiftEnd: '18:00' },
        { name: 'Priya Nair', phone: '9200000002', empId: 'EMP002', dept: 'Engineering', designation: 'Sr. Developer', shiftStart: '09:00', shiftEnd: '18:00' },
        { name: 'Deepa Menon', phone: '9200000003', empId: 'EMP003', dept: 'HR', designation: 'HR Manager', shiftStart: '09:30', shiftEnd: '18:30' },
        { name: 'Ravi Teja', phone: '9200000004', empId: 'EMP004', dept: 'Marketing', designation: 'Marketing Lead', shiftStart: '10:00', shiftEnd: '19:00' },
        { name: 'Meena Kumari', phone: '9200000005', empId: 'EMP005', dept: 'Finance', designation: 'Accountant', shiftStart: '09:00', shiftEnd: '18:00' },
        { name: 'Karthik Rajan', phone: '9200000006', empId: 'EMP006', dept: 'Operations', designation: 'Ops Manager', shiftStart: '08:00', shiftEnd: '17:00' },
        { name: 'Lakshmi Devi', phone: '9200000007', empId: 'EMP007', dept: 'Engineering', designation: 'QA Engineer', shiftStart: '09:00', shiftEnd: '18:00' },
        { name: 'Sanjay Gupta', phone: '9200000008', empId: 'EMP008', dept: 'Design', designation: 'UI/UX Designer', shiftStart: '10:00', shiftEnd: '19:00' },
        { name: 'Neha Pillai', phone: '9200000009', empId: 'EMP009', dept: 'Engineering', designation: 'DevOps Engineer', shiftStart: '09:00', shiftEnd: '18:00' },
        { name: 'Ramesh Babu', phone: '9200000010', empId: 'EMP010', dept: 'Administration', designation: 'Admin Executive', shiftStart: '08:30', shiftEnd: '17:30' },
    ];
    const createdEmployeeIds: string[] = [];

    for (const emp of employeesData) {
        try {
            let user = await db.query.users.findFirst({ where: eq(schema.users.phone, emp.phone) });
            if (!user) {
                user = await usersService.create({ phone: emp.phone, name: emp.name, password: 'password123', role: Role.EMPLOYEE });
                console.log(`   ✅ User: ${emp.name} (${emp.phone})`);
            } else {
                console.log(`   ℹ️  User exists: ${emp.name}`);
            }

            // Check if employee record exists
            const existingEmp = await db.query.employees.findFirst({ where: eq(schema.employees.user_id, user.id) });
            if (!existingEmp) {
                const empRecord = await employeesService.create({
                    userId: user.id,
                    employee_id: emp.empId,
                    department: emp.dept,
                    designation: emp.designation,
                    shift_start: emp.shiftStart,
                    shift_end: emp.shiftEnd,
                });
                createdEmployeeIds.push((empRecord as any).id);
                console.log(`   ✅ Employee: ${emp.empId} — ${emp.designation} (${emp.dept})`);
            } else {
                createdEmployeeIds.push(existingEmp.id);
                console.log(`   ℹ️  Employee exists: ${emp.empId}`);
            }
        } catch (e) { console.error(`   ❌ ${emp.name}:`, e.message); }
    }

    // ────────────────────────────────────────────────────────────
    // 5. ROUTES & STOPS
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 [5/6] Seeding Routes & Stops...');

    const routesData = [
        {
            name: 'Tech Park Express',
            origin: 'Palakkad Town',
            destination: 'Kinfra Tech Park',
            duration: 25,
            stops: [
                { name: 'Palakkad Town Bus Stand', lat: 10.7765, lng: 76.6538, type: StopType.PICKUP },
                { name: 'Chandranagar Junction', lat: 10.7810, lng: 76.6620, type: StopType.PICKUP },
                { name: 'Koppam Junction', lat: 10.7850, lng: 76.6700, type: StopType.PICKUP },
                { name: 'Pudussery', lat: 10.7920, lng: 76.6850, type: StopType.PICKUP },
                { name: 'Kinfra Tech Park Gate', lat: 10.8050, lng: 76.7050, type: StopType.DROP },
            ]
        },
        {
            name: 'Olavakkode Shuttle',
            origin: 'Olavakkode',
            destination: 'Palakkad Junction',
            duration: 20,
            stops: [
                { name: 'Olavakkode Railway Station', lat: 10.7883, lng: 76.6305, type: StopType.PICKUP },
                { name: 'Kallekad Junction', lat: 10.7830, lng: 76.6380, type: StopType.PICKUP },
                { name: 'Head Post Office', lat: 10.7770, lng: 76.6500, type: StopType.PICKUP },
                { name: 'Palakkad Junction Railway', lat: 10.7757, lng: 76.6552, type: StopType.DROP },
            ]
        },
        {
            name: 'Malampuzha Green Route',
            origin: 'Palakkad Town',
            destination: 'Malampuzha Dam',
            duration: 30,
            stops: [
                { name: 'Palakkad Municipal Stand', lat: 10.7765, lng: 76.6538, type: StopType.PICKUP },
                { name: 'Victoria College', lat: 10.7800, lng: 76.6460, type: StopType.PICKUP },
                { name: 'Kalmandapam', lat: 10.7900, lng: 76.6350, type: StopType.PICKUP },
                { name: 'Malampuzha Gardens', lat: 10.8000, lng: 76.6200, type: StopType.PICKUP },
                { name: 'Malampuzha Dam View Point', lat: 10.8140, lng: 76.6050, type: StopType.DROP },
            ]
        },
        {
            name: 'Industrial Corridor',
            origin: 'Walayar',
            destination: 'Palakkad Town',
            duration: 35,
            stops: [
                { name: 'Walayar Check Post', lat: 10.7820, lng: 76.7700, type: StopType.PICKUP },
                { name: 'Kanjikode Industrial Area', lat: 10.7800, lng: 76.7400, type: StopType.PICKUP },
                { name: 'KSRTC Bus Depot Palakkad', lat: 10.7780, lng: 76.7000, type: StopType.PICKUP },
                { name: 'Stadium Junction', lat: 10.7760, lng: 76.6600, type: StopType.PICKUP },
                { name: 'Palakkad Town Center', lat: 10.7765, lng: 76.6538, type: StopType.DROP },
            ]
        },
        {
            name: 'Hospital Ring Route',
            origin: 'Palakkad Fort',
            destination: 'District Hospital',
            duration: 15,
            stops: [
                { name: 'Palakkad Fort Entrance', lat: 10.7795, lng: 76.6497, type: StopType.PICKUP },
                { name: 'Sultanpet Junction', lat: 10.7725, lng: 76.6450, type: StopType.PICKUP },
                { name: 'Nurani Junction', lat: 10.7680, lng: 76.6420, type: StopType.PICKUP },
                { name: 'District Hospital', lat: 10.7650, lng: 76.6480, type: StopType.DROP },
            ]
        },
    ];

    const createdRouteIds: string[] = [];

    for (const rData of routesData) {
        try {
            // Check if route with this name already exists
            const existingRoute = await db.query.routes.findFirst({ where: eq(schema.routes.name, rData.name) });
            if (existingRoute) {
                createdRouteIds.push(existingRoute.id);
                console.log(`   ℹ️  Route exists: ${rData.name}`);
                continue;
            }

            await db.transaction(async (tx) => {
                const [route] = await tx.insert(routes).values({
                    name: rData.name,
                    origin: rData.origin,
                    destination: rData.destination,
                    estimated_duration_mins: rData.duration,
                }).returning();

                createdRouteIds.push(route.id);
                console.log(`   ✅ Route: ${rData.name} (${rData.origin} → ${rData.destination})`);

                let seq = 1;
                for (const sData of rData.stops) {
                    const [stop] = await tx.insert(stops).values({
                        name: sData.name,
                        lat: sData.lat,
                        lng: sData.lng,
                        type: sData.type as any,
                    }).returning();

                    await tx.insert(routeStops).values({
                        route_id: route.id,
                        stop_id: stop.id,
                        sequence_order: seq++,
                        expected_time_offset_mins: (seq - 2) * 5,
                    });
                    console.log(`      🔹 Stop ${seq - 1}: ${sData.name}`);
                }
            });
        } catch (e) { console.error(`   ❌ ${rData.name}:`, e.message); }
    }

    // ────────────────────────────────────────────────────────────
    // 6. TRIPS (linking drivers, vehicles, and routes)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 [6/6] Seeding Trips...');

    if (createdDriverIds.length >= 3 && createdVehicleIds.length >= 3 && createdRouteIds.length >= 3) {
        const tripsData = [
            {
                route_id: createdRouteIds[0],
                driver_id: createdDriverIds[0],
                vehicle_id: createdVehicleIds[0],
                status: 'scheduled' as const,
                type: 'pickup' as const,
                start_time: new Date('2026-02-26T07:00:00'),
            },
            {
                route_id: createdRouteIds[1],
                driver_id: createdDriverIds[1],
                vehicle_id: createdVehicleIds[1],
                status: 'scheduled' as const,
                type: 'drop' as const,
                start_time: new Date('2026-02-26T08:30:00'),
            },
            {
                route_id: createdRouteIds[2],
                driver_id: createdDriverIds[2],
                vehicle_id: createdVehicleIds[2],
                status: 'scheduled' as const,
                type: 'pickup' as const,
                start_time: new Date('2026-02-26T09:00:00'),
            },
            {
                route_id: createdRouteIds[3],
                driver_id: createdDriverIds[3],
                vehicle_id: createdVehicleIds[3],
                status: 'completed' as const,
                type: 'both' as const,
                start_time: new Date('2026-02-25T07:00:00'),
                end_time: new Date('2026-02-25T07:35:00'),
                distance_traveled_km: 18.5,
            },
            {
                route_id: createdRouteIds[4],
                driver_id: createdDriverIds[4],
                vehicle_id: createdVehicleIds[4],
                status: 'ongoing' as const,
                type: 'pickup' as const,
                start_time: new Date('2026-02-25T17:30:00'),
            },
        ];

        for (const t of tripsData) {
            try {
                await db.insert(schema.trips).values(t as any);
                console.log(`   ✅ Trip: Route ${createdRouteIds.indexOf(t.route_id) + 1} — ${t.status} (${t.type})`);
            } catch (e) { console.error(`   ❌ Trip:`, e.message); }
        }
    } else {
        console.log('   ⚠️  Not enough drivers/vehicles/routes to seed trips. Skipping.');
    }

    // ────────────────────────────────────────────────────────────
    // CREDENTIALS SUMMARY
    // ────────────────────────────────────────────────────────────
    console.log('\n==========================================================');
    console.log('🔑 LOGIN CREDENTIALS SUMMARY');
    console.log('==========================================================');
    console.log('');
    console.log('┌──────────────────────────────────────────────────────────┐');
    console.log('│  ADMIN ACCOUNTS                                         │');
    console.log('├─────────────────────┬──────────────┬─────────────────────┤');
    console.log('│ Name                │ Phone        │ Password            │');
    console.log('├─────────────────────┼──────────────┼─────────────────────┤');
    for (const a of admins) {
        console.log(`│ ${a.name.padEnd(20)}│ ${a.phone.padEnd(13)}│ ${a.password.padEnd(20)}│`);
    }
    console.log('└─────────────────────┴──────────────┴─────────────────────┘');
    console.log('');
    console.log('┌──────────────────────────────────────────────────────────┐');
    console.log('│  DRIVER ACCOUNTS  (Role: driver)                        │');
    console.log('├─────────────────────┬──────────────┬─────────────────────┤');
    console.log('│ Name                │ Phone        │ Password            │');
    console.log('├─────────────────────┼──────────────┼─────────────────────┤');
    for (const d of driversData) {
        console.log(`│ ${d.name.padEnd(20)}│ ${d.phone.padEnd(13)}│ ${driverPassword.padEnd(20)}│`);
    }
    console.log('└─────────────────────┴──────────────┴─────────────────────┘');
    console.log('');
    console.log('==========================================================');
    console.log('✨ Seeding complete!');
    console.log('==========================================================');

    await app.close();
}

bootstrap();
