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
import { sql } from 'drizzle-orm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const fleetService = app.get(FleetService);
  const employeesService = app.get(EmployeesService);
  const db: NodePgDatabase<typeof schema> = app.get(DRIZZLE);

  console.log('==========================================================');
  console.log('🚀 RTS Fleet Manager - Database Reset & Fresh Seed');
  console.log('==========================================================\n');

  // ────────────────────────────────────────────────────────────
  // RESET DATABASE
  // ────────────────────────────────────────────────────────────
  console.log('🧹 [0/6] Resetting Database (Truncating all tables)...');

  try {
    // Use a single TRUNCATE command for all tables to handle foreign keys efficiently
    await db.execute(sql`
            TRUNCATE TABLE 
                "trip_boarding_logs", 
                "trip_gps_logs", 
                "trips", 
                "roster_assignment_employees", 
                "roster_assignments", 
                "rotation_tracking", 
                "driver_shifts", 
                "rosters", 
                "employees", 
                "drivers", 
                "route_stops", 
                "routes", 
                "stops", 
                "vehicles", 
                "audit_logs", 
                "users" 
            RESTART IDENTITY CASCADE;
        `);
    console.log('   ✅ Database cleared successfully.');
  } catch (e) {
    console.error('   ❌ Database reset failed:', e.message);
    await app.close();
    return;
  }

  // ────────────────────────────────────────────────────────────
  // 1. ADMIN USER
  // ────────────────────────────────────────────────────────────
  console.log('\n📌 [1/6] Seeding Admin User...');

  const adminData = {
    name: 'Super Admin',
    email: 'admin@rts.com',
    phone: '9000000000',
    password: 'rts!@#',
    role: Role.SUPER_ADMIN,
  };

  const admin = await usersService.create(adminData);
  console.log(`   ✅ Admin: ${adminData.email}`);

  // ────────────────────────────────────────────────────────────
  // 2. DRIVERS
  // ────────────────────────────────────────────────────────────
  console.log('\n📌 [2/6] Seeding 5 Drivers...');

  const driversData = [
    {
      name: 'Rajesh Kumar',
      phone: '9100000001',
      email: 'driver1@rts.com',
      license: 'DL-14-2024-0001',
    },
    {
      name: 'Suresh Menon',
      phone: '9100000002',
      email: 'driver2@rts.com',
      license: 'DL-14-2024-0002',
    },
    {
      name: 'Vijay Prakash',
      phone: '9100000003',
      email: 'driver3@rts.com',
      license: 'DL-14-2024-0003',
    },
    {
      name: 'Arun Nair',
      phone: '9100000004',
      email: 'driver4@rts.com',
      license: 'DL-14-2024-0004',
    },
    {
      name: 'Manoj Chandran',
      phone: '9100000005',
      email: 'driver5@rts.com',
      license: 'DL-14-2024-0005',
    },
  ];

  const driverPassword = 'Driver@123';
  const createdDrivers = [];

  for (const d of driversData) {
    const user = await usersService.create({
      phone: d.phone,
      name: d.name,
      email: d.email,
      password: driverPassword,
      role: Role.DRIVER,
    });

    const driver = await fleetService.createDriver({
      userId: user.id,
      license_number: d.license,
      status: 'active',
    });

    createdDrivers.push(driver);
    console.log(`   ✅ Driver: ${d.name}`);
  }

  // ────────────────────────────────────────────────────────────
  // 3. VEHICLES
  // ────────────────────────────────────────────────────────────
  console.log('\n📌 [3/6] Seeding 10 Vehicles...');

  const vehiclesDataArr = [
    {
      license_plate: 'KL-14-AA-1234',
      model: 'Force Traveller 3350',
      capacity: 17,
      owner: 'RTS Fleet',
      owner_phone: '9400012345',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-14-BB-5678',
      model: 'Bharat Benz 407',
      capacity: 32,
      owner: 'City Transport',
      owner_phone: '9400067890',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-14-CC-9012',
      model: 'Tata Winger',
      capacity: 13,
      owner: 'Kerala Fleet',
      owner_phone: '9400011223',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-14-DD-3456',
      model: 'Eicher Starline',
      capacity: 25,
      owner: 'Rudra Travels',
      owner_phone: '9400012345',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-14-EE-7890',
      model: 'Mahindra Bolero Maxx',
      capacity: 7,
      owner: 'Private Hire',
      owner_phone: '9400055667',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-07-FF-2468',
      model: 'Toyota Innova Crysta',
      capacity: 6,
      owner: 'RTS Fleet',
      owner_phone: '9400099887',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-07-GG-1357',
      model: 'Tempo Traveller',
      capacity: 12,
      owner: 'Green Line',
      owner_phone: '9400033445',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-08-HH-8888',
      model: 'Marcopolo Starbus',
      capacity: 42,
      owner: 'Public Carrier',
      owner_phone: '9400011111',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-09-II-9999',
      model: 'SML Isuzu Executive',
      capacity: 20,
      owner: 'Corporate Travels',
      owner_phone: '9400022222',
      status: VehicleStatus.ACTIVE,
    },
    {
      license_plate: 'KL-10-JJ-0000',
      model: 'Ashok Leyland Lynx',
      capacity: 36,
      owner: 'RTS Fleet',
      owner_phone: '9400033333',
      status: VehicleStatus.ACTIVE,
    },
  ];

  const createdVehicles = [];

  for (const v of vehiclesDataArr) {
    const vehicle = await fleetService.createVehicle(v);
    createdVehicles.push(vehicle);
    console.log(`   ✅ Vehicle: ${v.license_plate}`);
  }

  // ────────────────────────────────────────────────────────────
  // 4. EMPLOYEES
  // ────────────────────────────────────────────────────────────
  console.log('\n📌 [4/6] Seeding 5 Employees...');

  const employeesData = [
    {
      name: 'John Doe',
      phone: '9200000001',
      empId: 'EMP001',
      dept: 'Engineering',
      designation: 'Software Engineer',
    },
    {
      name: 'Jane Smith',
      phone: '9200000002',
      empId: 'EMP002',
      dept: 'Operations',
      designation: 'Ops Lead',
    },
    {
      name: 'Alice Johnson',
      phone: '9200000003',
      empId: 'EMP003',
      dept: 'HR',
      designation: 'HR Executive',
    },
    {
      name: 'Bob Wilson',
      phone: '9200000004',
      empId: 'EMP004',
      dept: 'Marketing',
      designation: 'Marketing Manager',
    },
    {
      name: 'Charlie Brown',
      phone: '9200000005',
      empId: 'EMP005',
      dept: 'Finance',
      designation: 'Sr. Accountant',
    },
  ];

  const createdEmployees = [];

  for (const emp of employeesData) {
    const empRecord = await employeesService.create({
      name: emp.name,
      phone: emp.phone,
      employee_id: emp.empId,
      department: emp.dept,
      designation: emp.designation,
      shift_start: '09:00',
      shift_end: '18:00',
    });
    createdEmployees.push(empRecord);
    console.log(`   ✅ Employee: ${emp.name}`);
  }

  // ────────────────────────────────────────────────────────────
  // 5. ROUTES
  // ────────────────────────────────────────────────────────────
  console.log('\n📌 [5/6] Seeding 5 Routes...');

  const routesData = [
    {
      name: 'Tech Park North Express',
      origin: 'Palakkad Town',
      destination: 'Kinfra North Tech',
      stops: [
        {
          name: 'Main Bus Stand',
          lat: 10.7765,
          lng: 76.6538,
          type: StopType.PICKUP,
        },
        {
          name: 'Civil Station',
          lat: 10.779,
          lng: 76.658,
          type: StopType.PICKUP,
        },
        {
          name: 'Chandranagar',
          lat: 10.781,
          lng: 76.662,
          type: StopType.PICKUP,
        },
        {
          name: 'Pudussery West',
          lat: 10.788,
          lng: 76.68,
          type: StopType.PICKUP,
        },
        {
          name: 'Industrial Estate Gate',
          lat: 10.795,
          lng: 76.695,
          type: StopType.PICKUP,
        },
        {
          name: 'Kinfra North Block',
          lat: 10.805,
          lng: 76.705,
          type: StopType.DROP,
        },
      ],
    },
    {
      name: 'Olavakkode Junction Shuttle',
      origin: 'Junction Station',
      destination: 'South Gate Industrial',
      stops: [
        {
          name: 'Railway Station Front',
          lat: 10.7883,
          lng: 76.6305,
          type: StopType.PICKUP,
        },
        {
          name: 'Co-operative Hospital',
          lat: 10.785,
          lng: 76.635,
          type: StopType.PICKUP,
        },
        {
          name: 'Haji Junction',
          lat: 10.782,
          lng: 76.64,
          type: StopType.PICKUP,
        },
        { name: 'YMCA Cross', lat: 10.778, lng: 76.648, type: StopType.PICKUP },
        {
          name: 'Fort Maidan',
          lat: 10.775,
          lng: 76.652,
          type: StopType.PICKUP,
        },
        {
          name: 'South Gate Main',
          lat: 10.77,
          lng: 76.658,
          type: StopType.DROP,
        },
      ],
    },
    {
      name: 'Green Valleys Route',
      origin: 'Municipal Park',
      destination: 'Eco-Park HQ',
      stops: [
        {
          name: 'Park Entrance',
          lat: 10.7765,
          lng: 76.6538,
          type: StopType.PICKUP,
        },
        {
          name: 'Govt. Hospital',
          lat: 10.78,
          lng: 76.646,
          type: StopType.PICKUP,
        },
        {
          name: 'Victoria Circle',
          lat: 10.785,
          lng: 76.638,
          type: StopType.PICKUP,
        },
        {
          name: 'Lake Side Stop',
          lat: 10.795,
          lng: 76.625,
          type: StopType.PICKUP,
        },
        {
          name: 'Gardens Gate',
          lat: 10.805,
          lng: 76.615,
          type: StopType.PICKUP,
        },
        {
          name: 'Resort Junction',
          lat: 10.812,
          lng: 76.61,
          type: StopType.PICKUP,
        },
        { name: 'Eco-Park HQ', lat: 10.82, lng: 76.6, type: StopType.DROP },
      ],
    },
    {
      name: 'Corporate Corridor East',
      origin: 'East Gate',
      destination: 'Palakkad Town Center',
      stops: [
        {
          name: 'East Gate Terminal',
          lat: 10.782,
          lng: 76.77,
          type: StopType.PICKUP,
        },
        {
          name: 'Plantation Road',
          lat: 10.784,
          lng: 76.755,
          type: StopType.PICKUP,
        },
        {
          name: 'Steel Plant Road',
          lat: 10.786,
          lng: 76.74,
          type: StopType.PICKUP,
        },
        {
          name: 'Substation Stop',
          lat: 10.788,
          lng: 76.725,
          type: StopType.PICKUP,
        },
        {
          name: 'Medical College Inbound',
          lat: 10.79,
          lng: 76.71,
          type: StopType.PICKUP,
        },
        {
          name: 'Town Hall Circle',
          lat: 10.778,
          lng: 76.68,
          type: StopType.PICKUP,
        },
        {
          name: 'Center Plaza',
          lat: 10.7765,
          lng: 76.6538,
          type: StopType.DROP,
        },
      ],
    },
    {
      name: 'Hospital Heartlands',
      origin: 'Old Fort',
      destination: 'Specialist Center',
      stops: [
        {
          name: 'Fort Main Gate',
          lat: 10.7795,
          lng: 76.6497,
          type: StopType.PICKUP,
        },
        {
          name: 'Sultanpet Market',
          lat: 10.7725,
          lng: 76.645,
          type: StopType.PICKUP,
        },
        {
          name: 'Post Office Road',
          lat: 10.77,
          lng: 76.643,
          type: StopType.PICKUP,
        },
        {
          name: 'Nurani South',
          lat: 10.768,
          lng: 76.642,
          type: StopType.PICKUP,
        },
        {
          name: 'Diamond Junction',
          lat: 10.765,
          lng: 76.645,
          type: StopType.PICKUP,
        },
        {
          name: 'Specialist Center',
          lat: 10.762,
          lng: 76.648,
          type: StopType.DROP,
        },
      ],
    },
  ];

  const createdRoutes = [];

  for (const rData of routesData) {
    const [route] = await db
      .insert(routes)
      .values({
        name: rData.name,
        origin: rData.origin,
        destination: rData.destination,
        estimated_duration_mins: 30,
      })
      .returning();

    createdRoutes.push(route);
    console.log(`   ✅ Route: ${rData.name}`);

    let seq = 1;
    for (const sData of rData.stops) {
      const [stop] = await db
        .insert(stops)
        .values({
          name: sData.name,
          lat: sData.lat,
          lng: sData.lng,
          type: sData.type as any,
        })
        .returning();

      await db.insert(routeStops).values({
        route_id: route.id,
        stop_id: stop.id,
        sequence_order: seq++,
        expected_time_offset_mins: (seq - 2) * 5,
      });
    }
  }

  // ────────────────────────────────────────────────────────────
  // 6. ROSTERS
  // ────────────────────────────────────────────────────────────
  console.log('\n📌 [6/6] Seeding 5 Detailed Rosters...');

  const today = new Date().toISOString().split('T')[0];

  const rostersToSeed = [
    {
      driver_id: (createdDrivers[0] as any).id,
      vehicle_id: (createdVehicles[0] as any).id,
      route_id: createdRoutes[0].id,
      shift_type: schema.ShiftType.MORNING,
      notes:
        'High priority morning pickup for Engineering block. Ensure all 5 employees are picked up by 08:30 AM.',
      empIndices: [0, 1, 2, 3, 4],
    },
    {
      driver_id: (createdDrivers[1] as any).id,
      vehicle_id: (createdVehicles[1] as any).id,
      route_id: createdRoutes[1].id,
      shift_type: schema.ShiftType.AFTERNOON,
      notes:
        'Afternoon rotation for South Gate industrial block. 2 new joiners included in the list.',
      empIndices: [0, 2],
    },
    {
      driver_id: (createdDrivers[2] as any).id,
      vehicle_id: (createdVehicles[2] as any).id,
      route_id: createdRoutes[2].id,
      shift_type: schema.ShiftType.NIGHT,
      notes:
        'Night drop for Eco-Park HQ. Please wait at the main entrance for all employees to board before departing.',
      empIndices: [1, 3, 4],
    },
    {
      driver_id: (createdDrivers[3] as any).id,
      vehicle_id: (createdVehicles[3] as any).id,
      route_id: createdRoutes[3].id,
      shift_type: schema.ShiftType.MORNING,
      notes:
        'Corporate Corridor East route. Route includes several construction zones, expects 5-10 mins delay.',
      empIndices: [0, 4],
    },
    {
      driver_id: (createdDrivers[4] as any).id,
      vehicle_id: (createdVehicles[4] as any).id,
      route_id: createdRoutes[4].id,
      shift_type: schema.ShiftType.AFTERNOON,
      notes:
        'Hospital Heartlands emergency standby route. Keep communication channel open for real-time updates.',
      empIndices: [2],
    },
  ];

  for (const r of rostersToSeed) {
    const [assignment] = await db
      .insert(schema.rosterAssignments)
      .values({
        driver_id: r.driver_id,
        vehicle_id: r.vehicle_id,
        route_id: r.route_id,
        date: today,
        shift_type: r.shift_type as any,
        trip_type: schema.TripType.PICKUP,
        scheduled_time: '08:00:00',
        notes: r.notes,
        status: schema.AssignmentStatus.ASSIGNED,
      })
      .returning();

    for (const idx of r.empIndices) {
      await db.insert(schema.rosterAssignmentEmployees).values({
        roster_assignment_id: assignment.id,
        employee_id: (createdEmployees[idx] as any).id,
      });
    }
    console.log(`   ✅ Roster: Driver ID ${r.driver_id.substring(0, 8)}...`);
  }

  console.log('\n==========================================================');
  console.log('🔑 FRESH LOGIN CREDENTIALS');
  console.log('==========================================================');
  console.log(`ADMIN: ${adminData.email} / ${adminData.password}`);
  console.log(
    `DRIVERS: Use logic driver1@rts.com to driver5@rts.com (Password: ${driverPassword})`,
  );
  console.log('==========================================================');
  console.log('✨ Reset & Seeding complete!');
  console.log('==========================================================');

  await app.close();
}

bootstrap();
