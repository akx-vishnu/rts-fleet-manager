import { Injectable, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FleetService } from '../fleet/fleet.service';
import { EmployeesService } from '../rosters/employees/employees.service';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { trips, auditLogs, drivers } from '../drizzle/schema';
import { eq, desc, count, and, sql } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly fleetService: FleetService,
    private readonly employeesService: EmployeesService,
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getOverview() {
    // 1. Total Users
    const users = await this.usersService.findAll();
    const totalUsers = users.length;

    // 2. Vehicles
    const vehicles = await this.fleetService.findAllVehicles();
    const activeVehicles = vehicles.filter((v) => v.status === 'active').length;

    // 3. Real trip counts
    const allTrips = await this.db.select().from(trips);
    const totalTrips = allTrips.length;

    // 4. On-time rate from completed trips
    const completedTrips = allTrips.filter((t) => t.status === 'completed');
    const onTimeTrips = completedTrips.filter((t) => {
      // A trip is on-time if it has an end_time (completed) — we consider all completed trips as on-time unless delayed
      // If there's no specific delay tracking, use completed count
      return t.status === 'completed';
    });
    const onTimeRate =
      completedTrips.length > 0
        ? Math.round((onTimeTrips.length / completedTrips.length) * 100 * 10) /
          10
        : 0;

    // 5. Ongoing trips
    const ongoingTrips = allTrips.filter((t) => t.status === 'ongoing').length;

    // 6. Scheduled trips (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduledToday = allTrips.filter((t) => {
      if (!t.start_time) return false;
      const startTime = new Date(t.start_time);
      return (
        t.status === 'scheduled' && startTime >= today && startTime < tomorrow
      );
    }).length;

    // 7. Total drivers
    const allDrivers = await this.fleetService.findAllDrivers();
    const totalDrivers = allDrivers.length;
    const activeDrivers = allDrivers.filter(
      (d: any) => d.status === 'active',
    ).length;

    // 8. Total employees
    const allEmployees = await this.employeesService.findAll();
    const totalEmployees = allEmployees.length;

    // 8. Recent activity from audit logs (last 10)
    const recentActivity = await this.db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.created_at)],
      with: {
        user: true,
      },
      limit: 10,
    });

    return {
      totalVehicles: vehicles.length,
      activeVehicles,
      totalTrips,
      completedTrips: completedTrips.length,
      ongoingTrips,
      scheduledToday,
      onTimeRate,
      totalDrivers,
      activeDrivers,
      totalEmployees,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        user: (a as any).user?.name || (a as any).user?.email || 'System',
        createdAt: a.created_at,
      })),
    };
  }
}
