import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { trips, tripBoardingLogs, tripGPSLogs } from '../drizzle/schema';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { MarkBoardingDto } from './dto/mark-boarding.dto';
import { RoutesService } from '../routes/routes.service';
import { FleetService } from '../fleet/fleet.service';
import { EventsGateway } from '../events/events.gateway';
import { eq, desc, and } from 'drizzle-orm';

@Injectable()
export class TripsService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
        private routesService: RoutesService,
        private fleetService: FleetService,
        private eventsGateway: EventsGateway,
    ) { }

    async create(createTripDto: CreateTripDto) {
        // Validation could be stricter

        const [trip] = await this.db.insert(trips).values({
            route_id: createTripDto.routeId,
            driver_id: createTripDto.driverId,
            vehicle_id: createTripDto.vehicleId,
            start_time: new Date(createTripDto.start_time),
            status: schema.TripStatus.SCHEDULED,
            type: schema.TripType.PICKUP, // Default or from DTO
        }).returning();

        this.eventsGateway.server.emit('tripsUpdated');

        return trip;
    }

    async findAll(driverId?: string, status?: string) {


        const query = this.db.query.trips.findMany({
            where: (trips, { eq, and, inArray }) => {
                const conditions = [];
                if (driverId) conditions.push(eq(trips.driver_id, driverId));
                if (status) {
                    const statusList = status.split(',').map(s => s.trim());
                    conditions.push(inArray(trips.status, statusList as any));
                }
                return and(...conditions);
            },
            with: {
                route: {
                    with: {
                        stops: {
                            with: {
                                stop: true
                            },
                            orderBy: (routeStops, { asc }) => [asc(routeStops.sequence_order)],
                        }
                    }
                },
                driver: {
                    with: {
                        user: true
                    }
                },
                vehicle: true,
            },
            orderBy: [desc(trips.start_time)],
        });

        return query;
    }

    async findDriverByUserId(userId: string) {
        return this.db.query.drivers.findFirst({
            where: (drivers, { eq }) => eq(drivers.user_id, userId),
        });
    }

    async findOne(id: string) {
        const trip = await this.db.query.trips.findFirst({
            where: eq(trips.id, id),
            with: {
                route: {
                    with: {
                        stops: {
                            with: {
                                stop: true
                            }
                        }
                    }
                },
                driver: true,
                vehicle: true,
            },
        });
        if (!trip) throw new NotFoundException(`Trip #${id} not found`);
        return trip;
    }

    async update(id: string, updateTripDto: UpdateTripDto) {
        // Handle updates
        const updateData: any = { ...updateTripDto, updated_at: new Date() };
        // Map DTO keys to schema keys if different, but assuming similar standard (camelCase vs snake_case might be an issue if DTO uses camelCase and we pass it directly to update)
        // Drizzle schema uses snake_case keys for columns.
        // updateTripDto properties not mapped automatically.
        // We should map them.

        const mappedData: any = { updated_at: new Date() };
        if (updateTripDto.status) mappedData.status = updateTripDto.status;
        if (updateTripDto.driverId) mappedData.driver_id = updateTripDto.driverId;
        if (updateTripDto.vehicleId) mappedData.vehicle_id = updateTripDto.vehicleId;
        // Add other fields as needed

        const [updatedTrip] = await this.db.update(trips)
            .set(mappedData)
            .where(eq(trips.id, id))
            .returning();

        this.eventsGateway.server.emit('tripsUpdated');

        return this.findOne(updatedTrip.id);
    }

    async markBoarding(tripId: string, markBoardingDto: MarkBoardingDto) {
        // Verify trip exists
        const trip = await this.findOne(tripId);

        // Insert boarding log
        const [boardingLog] = await this.db.insert(tripBoardingLogs).values({
            trip_id: tripId,
            employee_id: markBoardingDto.employeeId,
            stop_id: markBoardingDto.stopId,
            status: markBoardingDto.status,
            boarded_at: new Date(),
        }).returning();

        // Emit real-time event to admin dashboard
        this.eventsGateway.server.to('admins').emit('employeeBoarding', {
            tripId,
            boardingLog,
            location: {
                lat: markBoardingDto.lat,
                lng: markBoardingDto.lng,
            },
        });

        return boardingLog;
    }

    async getBoardingLogs(tripId: string) {
        return this.db.query.tripBoardingLogs.findMany({
            where: eq(tripBoardingLogs.trip_id, tripId),
            with: {
                employee: true,
                stop: true,
            },
            orderBy: [desc(tripBoardingLogs.boarded_at)],
        });
    }

    async remove(id: string) {
        // Find the trip first to verify existence
        await this.findOne(id);

        // Delete logs first (manual cleanup since no cascade in schema)
        await this.db.delete(tripBoardingLogs).where(eq(tripBoardingLogs.trip_id, id));
        await this.db.delete(tripGPSLogs).where(eq(tripGPSLogs.trip_id, id));

        // Delete the trip
        const [deletedTrip] = await this.db.delete(trips)
            .where(eq(trips.id, id))
            .returning();

        this.eventsGateway.server.emit('tripsUpdated');

        return deletedTrip;
    }
}
