import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { rosters, trips } from '../drizzle/schema';
import { eq, and, notExists } from 'drizzle-orm';
import { FleetService } from '../fleet/fleet.service';

@Injectable()
export class TripGeneratorService {
    private readonly logger = new Logger(TripGeneratorService.name);

    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
        private fleetService: FleetService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async generateDailyTrips(targetDate?: Date) {
        this.logger.log('Generating daily trips from rosters...');

        // Default to tomorrow if no date provided (for Cron)
        const dateToProcess = targetDate || new Date();
        if (!targetDate) {
            dateToProcess.setDate(dateToProcess.getDate() + 1);
        }

        const dateStr = dateToProcess.toISOString().split('T')[0];
        this.logger.log(`Processing date: ${dateStr}`);

        // 1. Get assignments for the date
        const assignments = await this.db.query.rosterAssignments.findMany({
            where: eq(schema.rosterAssignments.date, dateStr),
            with: {
                employees: {
                    with: {
                        employee: {
                            with: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        this.logger.log(`Found ${assignments.length} assignments`);

        const shiftStartTimes: Record<string, string> = {
            'morning': '07:00:00',
            'afternoon': '15:00:00',
            'night': '22:00:00',
            'weekend': '09:00:00',
        };

        const createdTrips = [];

        for (const assignment of assignments) {
            // Determine start time
            const timeStr = shiftStartTimes[assignment.shift_type] || '08:00:00';
            const startTime = new Date(`${dateStr}T${timeStr}`);

            // Check if trip already exists
            const existingTrip = await this.db.query.trips.findFirst({
                where: and(
                    eq(trips.driver_id, assignment.driver_id),
                    eq(trips.vehicle_id, assignment.vehicle_id),
                    eq(trips.route_id, assignment.route_id),
                    eq(trips.start_time, startTime)
                )
            });

            if (!existingTrip) {
                const [newTrip] = await this.db.insert(trips).values({
                    driver_id: assignment.driver_id,
                    vehicle_id: assignment.vehicle_id,
                    route_id: assignment.route_id,
                    start_time: startTime,
                    status: schema.TripStatus.SCHEDULED,
                    type: schema.TripType.PICKUP, // Default
                }).returning();

                // Assign employees to the trip's boarding logs
                if (assignment.employees && assignment.employees.length > 0) {
                    // Fetch the route details to get the first stop
                    const routeWithStops = await this.db.query.routes.findFirst({
                        where: eq(schema.routes.id, assignment.route_id),
                        with: {
                            stops: {
                                orderBy: (routeStops, { asc }) => [asc(routeStops.sequence_order)],
                                limit: 1
                            }
                        }
                    });

                    // If route has stops, assign employees to the first stop by default
                    if (routeWithStops && routeWithStops.stops.length > 0) {
                        const firstStopId = routeWithStops.stops[0].stop_id;

                        const boardingLogs = assignment.employees.map(emp => ({
                            trip_id: newTrip.id,
                            employee_id: emp.employee?.user_id, // Get the ID from user table reference
                            stop_id: firstStopId,
                            status: schema.BoardingStatus.PENDING, // Default status for generated
                            boarded_at: new Date(0),
                        })).filter(log => log.employee_id); // Ensure no nulls if relation fails

                        if (boardingLogs.length > 0) {
                            await this.db.insert(schema.tripBoardingLogs).values(boardingLogs);
                        }
                    }
                }

                createdTrips.push(newTrip);
            }
        }

        this.logger.log(`Generated ${createdTrips.length} new trips for ${dateStr}`);
        return { generated: createdTrips.length, date: dateStr };
    }
}
