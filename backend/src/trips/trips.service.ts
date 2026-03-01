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

import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TripsService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private routesService: RoutesService,
    private fleetService: FleetService,
    private eventsGateway: EventsGateway,
  ) { }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkUpcomingTrips() {
    const fifteenMinsFromNow = new Date(Date.now() + 15 * 60 * 1000);
    const now = new Date();

    // Find scheduled trips starting within the next 15 minutes that haven't been notified
    // For simplicity in this demo, we just find all in the window. 
    // In a real app, we'd track 'notified' state.
    const upcomingTrips = await this.db.query.trips.findMany({
      where: (trips, { and, eq, lte, gte }) => and(
        eq(trips.status, schema.TripStatus.SCHEDULED),
        lte(trips.start_time, fifteenMinsFromNow),
        gte(trips.start_time, now)
      ),
      with: {
        driver: {
          with: { user: true }
        }
      }
    });

    for (const trip of upcomingTrips) {
      if (trip.driver?.user_id && trip.start_time) {
        this.eventsGateway.sendNotification(`user_${trip.driver.user_id}`, {
          title: 'Trip Starting Soon',
          body: `Your scheduled trip #${trip.id.slice(0, 8)} starts at ${trip.start_time.toLocaleTimeString()}`,
          data: { tripId: trip.id }
        });
      }
    }
  }

  async create(createTripDto: CreateTripDto) {
    // Validation could be stricter

    const [trip] = await this.db
      .insert(trips)
      .values({
        route_id: createTripDto.routeId,
        driver_id: createTripDto.driverId,
        vehicle_id: createTripDto.vehicleId,
        start_time: new Date(createTripDto.start_time),
        status: schema.TripStatus.SCHEDULED,
        type: schema.TripType.PICKUP, // Default or from DTO
      })
      .returning();

    // Notify driver about new scheduled trip
    const driver = await this.db.query.drivers.findFirst({
      where: eq(schema.drivers.id, createTripDto.driverId),
      with: { user: true },
    });

    if (driver?.user_id) {
      this.eventsGateway.sendNotification(`user_${driver.user_id}`, {
        title: 'New Trip Assigned',
        body: `You have a new trip scheduled for ${new Date(createTripDto.start_time).toLocaleString()}`,
        data: { tripId: trip.id },
      });
    }

    this.eventsGateway.server.emit('tripsUpdated');

    return trip;
  }

  async findAll(driverId?: string, status?: string) {
    const query = this.db.query.trips.findMany({
      where: (trips, { eq, and, inArray }) => {
        const conditions = [];
        if (driverId) conditions.push(eq(trips.driver_id, driverId));
        if (status) {
          const statusList = status.split(',').map((s) => s.trim());
          conditions.push(inArray(trips.status, statusList as any));
        }
        return and(...conditions);
      },
      with: {
        route: {
          with: {
            stops: {
              with: {
                stop: true,
              },
              orderBy: (routeStops, { asc }) => [
                asc(routeStops.sequence_order),
              ],
            },
          },
        },
        driver: {
          with: {
            user: true,
          },
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
                stop: true,
              },
            },
          },
        },
        driver: {
          with: {
            user: true,
          },
        },
        vehicle: true,
      },
    });
    if (!trip) throw new NotFoundException(`Trip #${id} not found`);
    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    // Handle updates
    const updateData: any = { ...updateTripDto, updated_at: new Date() };

    const mappedData: any = { updated_at: new Date() };
    if (updateTripDto.status) mappedData.status = updateTripDto.status;
    if (updateTripDto.driverId) mappedData.driver_id = updateTripDto.driverId;
    if (updateTripDto.vehicleId)
      mappedData.vehicle_id = updateTripDto.vehicleId;
    // Add other fields as needed

    const oldTrip = await this.findOne(id);
    const [updatedTrip] = await this.db
      .update(trips)
      .set(mappedData)
      .where(eq(trips.id, id))
      .returning();

    // Notify admins when trip starts or ends
    if (updateTripDto.status && updateTripDto.status !== oldTrip.status) {
      if (updateTripDto.status === schema.TripStatus.ONGOING) {
        this.eventsGateway.sendNotification('admins', {
          title: 'Trip Started',
          body: `Driver ${oldTrip.driver?.user?.name || 'Unknown'} has started Trip #${id.slice(0, 8)}`,
          data: { tripId: id },
        });
      } else if (updateTripDto.status === schema.TripStatus.COMPLETED) {
        this.eventsGateway.sendNotification('admins', {
          title: 'Trip Completed',
          body: `Driver ${oldTrip.driver?.user?.name || 'Unknown'} has completed Trip #${id.slice(0, 8)}`,
          data: { tripId: id },
        });
      }
    }

    this.eventsGateway.server.emit('tripsUpdated');

    return this.findOne(updatedTrip.id);
  }

  async markBoarding(tripId: string, markBoardingDto: MarkBoardingDto) {
    // Verify trip exists
    const trip = await this.findOne(tripId);

    // Insert boarding log
    const [boardingLog] = await this.db
      .insert(tripBoardingLogs)
      .values({
        trip_id: tripId,
        employee_id: markBoardingDto.employeeId,
        stop_id: markBoardingDto.stopId,
        status: markBoardingDto.status,
        boarded_at: new Date(),
      })
      .returning();

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
    await this.db
      .delete(tripBoardingLogs)
      .where(eq(tripBoardingLogs.trip_id, id));
    await this.db.delete(tripGPSLogs).where(eq(tripGPSLogs.trip_id, id));

    // Delete the trip
    const [deletedTrip] = await this.db
      .delete(trips)
      .where(eq(trips.id, id))
      .returning();

    this.eventsGateway.server.emit('tripsUpdated');

    return deletedTrip;
  }
}
