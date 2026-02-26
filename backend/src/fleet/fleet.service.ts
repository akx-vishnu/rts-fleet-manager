import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { vehicles, drivers, users } from '../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { EventsGateway } from '../events/events.gateway';
import { TripStatus, BoardingStatus } from '../drizzle/schema/trips';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class FleetService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
        private eventsGateway: EventsGateway
    ) { }

    async createVehicle(createVehicleDto: any) {
        const [vehicle] = await this.db.insert(vehicles).values(createVehicleDto).returning();
        return vehicle;
    }

    async createDriver(createDriverDto: any) {
        // Map camelCase userId to snake_case user_id for database
        const driverData = {
            user_id: createDriverDto.userId,
            license_number: createDriverDto.license_number,
            status: createDriverDto.status,
        };

        const [driver] = await this.db.insert(drivers).values(driverData).returning();
        return driver;
    }

    async findAllVehicles() {
        return this.db.select().from(vehicles);
    }

    async findAllDrivers() {
        return this.db.query.drivers.findMany({
            with: {
                user: true,
            },
        });
    }

    async updateDriver(id: string, updateDriverDto: any) {
        // Find the driver first to get the user_id
        const driver = await this.db.query.drivers.findFirst({
            where: eq(drivers.id, id),
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        try {
            // Update user information if provided
            if (updateDriverDto.name || updateDriverDto.email || updateDriverDto.phone || updateDriverDto.password) {
                // Check if email is being changed and if new email already exists
                if (updateDriverDto.email) {
                    const existingUser = await this.db.query.users.findFirst({
                        where: eq(users.email, updateDriverDto.email),
                    });

                    // If email exists and belongs to different user
                    if (existingUser && existingUser.id !== driver.user_id) {
                        throw new ConflictException('Email already exists');
                    }
                }

                const userUpdateData: any = {};
                if (updateDriverDto.name) userUpdateData.name = updateDriverDto.name;
                if (updateDriverDto.email) userUpdateData.email = updateDriverDto.email;
                if (updateDriverDto.phone) userUpdateData.phone = updateDriverDto.phone;

                if (updateDriverDto.password) {
                    userUpdateData.password_hash = await bcrypt.hash(updateDriverDto.password, 10);
                }

                userUpdateData.updated_at = new Date();

                await this.db.update(users)
                    .set(userUpdateData)
                    .where(eq(users.id, driver.user_id));
            }

            // Update driver specific fields
            const driverUpdateData: any = {};
            if (updateDriverDto.license_number) driverUpdateData.license_number = updateDriverDto.license_number;
            if (updateDriverDto.status) driverUpdateData.status = updateDriverDto.status;
            // Vehicle assignment is now managed through trips

            if (Object.keys(driverUpdateData).length > 0) {
                driverUpdateData.updated_at = new Date();
                await this.db.update(drivers)
                    .set(driverUpdateData)
                    .where(eq(drivers.id, id));
            }

            // Return updated driver with user info
            return this.db.query.drivers.findFirst({
                where: eq(drivers.id, id),
                with: {
                    user: true,
                },
            });
        } catch (error) {
            // Re-throw ConflictException as is
            if (error instanceof ConflictException) {
                throw error;
            }

            // Handle database unique constraint error
            if (error.code === '23505') {
                throw new ConflictException('Email already exists');
            }

            throw error;
        }
    }

    async findDriverByUserId(userId: string) {
        const driver = await this.db.query.drivers.findFirst({
            where: eq(drivers.user_id, userId),
            with: {
                user: true,
            },
        });

        if (!driver) return null;

        // Calculate completed trips
        const completedTripsResult = await this.db.query.trips.findMany({
            where: and(
                eq(schema.trips.driver_id, driver.id),
                eq(schema.trips.status, TripStatus.COMPLETED)
            )
        });

        return {
            ...driver,
            tripsCompleted: completedTripsResult.length
        };
    }

    async removeDriver(id: string) {
        // First check if driver exists
        const driver = await this.db.query.drivers.findFirst({
            where: eq(drivers.id, id),
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        try {
            await this.db.delete(drivers).where(eq(drivers.id, id));
            return { message: 'Driver deleted successfully' };
        } catch (error: any) {
            // Check for foreign key constraint violation
            if (error.code === '23503' || (error.cause as any)?.code === '23503') {
                throw new ConflictException('Cannot delete driver with existing trips or assignments');
            }
            throw error;
        }
    }

    // Vehicle Methods

    async updateVehicle(id: string, updateVehicleDto: any) {
        const vehicle = await this.db.query.vehicles.findFirst({
            where: eq(vehicles.id, id),
        });

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID ${id} not found`);
        }

        const updateData: any = {};
        if (updateVehicleDto.license_plate) updateData.license_plate = updateVehicleDto.license_plate;
        if (updateVehicleDto.model) updateData.model = updateVehicleDto.model;
        if (updateVehicleDto.capacity) updateData.capacity = updateVehicleDto.capacity;
        if (updateVehicleDto.status) updateData.status = updateVehicleDto.status;

        if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date();
            await this.db.update(vehicles)
                .set(updateData)
                .where(eq(vehicles.id, id));
        }

        return this.db.query.vehicles.findFirst({
            where: eq(vehicles.id, id),
        });
    }

    async removeVehicle(id: string) {
        const vehicle = await this.db.query.vehicles.findFirst({
            where: eq(vehicles.id, id),
        });

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID ${id} not found`);
        }

        try {
            await this.db.delete(vehicles).where(eq(vehicles.id, id));
            return { message: 'Vehicle deleted successfully' };
        } catch (error: any) {
            if (error.code === '23503' || (error.cause as any)?.code === '23503') {
                throw new ConflictException('Cannot delete vehicle with existing assignments or trips');
            }
            throw error;
        }
    }

    // Driver Portal Methods

    async getDriverTrips(userId: string) {
        const driver = await this.findDriverByUserId(userId);
        if (!driver) {
            throw new NotFoundException('Driver profile not found');
        }

        // Get trips for today and future
        // For simplicity getting all non-completed/cancelled or recent completed
        const driverTrips = await this.db.query.trips.findMany({
            where: eq(schema.trips.driver_id, driver.id),
            with: {
                route: true,
                vehicle: true,
            },
            orderBy: [desc(schema.trips.start_time)],
            limit: 50, // Limit history
        });

        return driverTrips;
    }

    async getTripDetails(tripId: string) {
        const trip = await this.db.query.trips.findFirst({
            where: eq(schema.trips.id, tripId),
            with: {
                route: {
                    with: {
                        stops: {
                            with: {
                                stop: true,
                            },
                            orderBy: (routeStops, { asc }) => [asc(routeStops.sequence_order)],
                        },
                    },
                },
                vehicle: true,
                boardingLogs: {
                    with: {
                        employee: true,
                    }
                },
            },
        });

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        return trip;
    }

    async startTrip(tripId: string) {
        // Update status to ONGOING
        await this.db.update(schema.trips)
            .set({
                status: TripStatus.ONGOING,
                updated_at: new Date()
            })
            .where(eq(schema.trips.id, tripId));

        // Also update driver status to ON_TRIP
        const trip = await this.db.query.trips.findFirst({
            where: eq(schema.trips.id, tripId),
            with: {
                route: true,
                driver: { with: { user: true } },
                vehicle: true
            }
        });

        if (trip) {
            await this.db.update(schema.drivers)
                .set({ status: schema.DriverStatus.ON_TRIP })
                .where(eq(schema.drivers.id, trip.driver_id));

            // Broadcast trip status change to admins
            this.eventsGateway.server.emit('tripStatusChanged', {
                tripId: trip.id,
                status: TripStatus.ONGOING,
                trip
            });
        }

        return { message: 'Trip started' };
    }

    async completeTrip(tripId: string, distance?: number) {
        // Fetch current trip to check existing distance
        const currentTrip = await this.db.query.trips.findFirst({
            where: eq(schema.trips.id, tripId),
        });

        await this.db.update(schema.trips)
            .set({
                status: TripStatus.COMPLETED,
                end_time: new Date(),
                distance_traveled_km: distance && distance > 0 ? distance : (currentTrip?.distance_traveled_km || 0),
                updated_at: new Date()
            })
            .where(eq(schema.trips.id, tripId));

        // Set driver back to ACTIVE (or OFF_DUTY? let's say ACTIVE for next trip)
        const trip = await this.db.query.trips.findFirst({
            where: eq(schema.trips.id, tripId),
            with: {
                route: true,
                driver: { with: { user: true } },
                vehicle: true
            }
        });

        if (trip) {
            await this.db.update(schema.drivers)
                .set({ status: schema.DriverStatus.ACTIVE })
                .where(eq(schema.drivers.id, trip.driver_id));

            // Broadcast trip status change to admins
            this.eventsGateway.server.emit('tripStatusChanged', {
                tripId: trip.id,
                status: TripStatus.COMPLETED,
                trip
            });
        }

        return { message: 'Trip completed' };
    }

    async updateEmployeeStatus(tripId: string, stopId: string, employeeId: string, status: BoardingStatus) {
        // Check if log exists
        const existingLog = await this.db.query.tripBoardingLogs.findFirst({
            where: and(
                eq(schema.tripBoardingLogs.trip_id, tripId),
                eq(schema.tripBoardingLogs.stop_id, stopId),
                eq(schema.tripBoardingLogs.employee_id, employeeId)
            ),
        });

        if (existingLog) {
            // Update
            await this.db.update(schema.tripBoardingLogs)
                .set({
                    status: status,
                    boarded_at: new Date() // Updates timestamp of status change
                })
                .where(eq(schema.tripBoardingLogs.id, existingLog.id));
        } else {
            // Insert
            await this.db.insert(schema.tripBoardingLogs).values({
                trip_id: tripId,
                stop_id: stopId,
                employee_id: employeeId,
                status: status,
                boarded_at: new Date(),
            });
        }

        return { message: 'Status updated' };
    }

    async updateTripLocation(tripId: string, lat: number, lng: number) {
        // 1. Get the last known location for this trip to calculate distance delta
        const lastLog = await this.db.query.tripGPSLogs.findFirst({
            where: eq(schema.tripGPSLogs.trip_id, tripId),
            orderBy: [desc(schema.tripGPSLogs.timestamp)],
        });

        let distanceDelta = 0;
        if (lastLog) {
            distanceDelta = this.calculateDistance(lastLog.lat, lastLog.lng, lat, lng);
        }

        // 2. Insert new GPS log
        await this.db.insert(schema.tripGPSLogs).values({
            trip_id: tripId,
            lat,
            lng,
            timestamp: new Date(),
        });

        // 3. Update trip with new distance and vehicle with current location
        const trip = await this.db.query.trips.findFirst({
            where: eq(schema.trips.id, tripId),
        });

        if (trip) {
            const newDistance = (trip.distance_traveled_km || 0) + distanceDelta;

            await this.db.update(schema.trips)
                .set({
                    distance_traveled_km: newDistance,
                    updated_at: new Date()
                })
                .where(eq(schema.trips.id, tripId));

            await this.db.update(schema.vehicles)
                .set({
                    current_lat: lat,
                    current_lng: lng,
                    updated_at: new Date()
                })
                .where(eq(schema.vehicles.id, trip.vehicle_id));
        }

        return { message: 'Location updated', distanceDelta };
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
