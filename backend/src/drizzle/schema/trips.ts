import { pgTable, uuid, timestamp, doublePrecision, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { routes, stops } from './routes';
import { drivers, vehicles } from './fleet';
import { users } from './users';

export enum TripStatus {
    SCHEDULED = 'scheduled',
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum TripType {
    PICKUP = 'pickup',
    DROP = 'drop',
    RETURN = 'return',
    BOTH = 'both',
}

export enum BoardingStatus {
    BOARDED = 'boarded',
    MISSED = 'missed',
    NO_SHOW = 'no_show',
    SKIPPED = 'skipped',
}

export const tripStatusEnum = pgEnum('trip_status', [TripStatus.SCHEDULED, TripStatus.ONGOING, TripStatus.COMPLETED, TripStatus.CANCELLED]);
export const tripTypeEnum = pgEnum('trip_type', [TripType.PICKUP, TripType.DROP, TripType.RETURN, TripType.BOTH]);
export const boardingStatusEnum = pgEnum('boarding_status', [BoardingStatus.BOARDED, BoardingStatus.MISSED, BoardingStatus.NO_SHOW, BoardingStatus.SKIPPED]);

export const trips = pgTable('trips', {
    id: uuid('id').defaultRandom().primaryKey(),
    route_id: uuid('route_id').references(() => routes.id).notNull(),
    driver_id: uuid('driver_id').references(() => drivers.id).notNull(),
    vehicle_id: uuid('vehicle_id').references(() => vehicles.id).notNull(),
    status: tripStatusEnum('status').default(TripStatus.SCHEDULED).notNull(),
    type: tripTypeEnum('type').default(TripType.PICKUP).notNull(),
    start_time: timestamp('start_time'),
    end_time: timestamp('end_time'),
    distance_traveled_km: doublePrecision('distance_traveled_km').default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        driverIdx: index('trip_driver_idx').on(table.driver_id),
        vehicleIdx: index('trip_vehicle_idx').on(table.vehicle_id),
        routeIdx: index('trip_route_idx').on(table.route_id),
    };
});

export const tripBoardingLogs = pgTable('trip_boarding_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    trip_id: uuid('trip_id').references(() => trips.id).notNull(),
    employee_id: uuid('employee_id').references(() => users.id).notNull(),
    stop_id: uuid('stop_id').references(() => stops.id).notNull(),
    status: boardingStatusEnum('status').default(BoardingStatus.BOARDED).notNull(),
    boarded_at: timestamp('boarded_at').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

export const tripGPSLogs = pgTable('trip_gps_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    trip_id: uuid('trip_id').references(() => trips.id).notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    speed_kmh: doublePrecision('speed_kmh'),
    timestamp: timestamp('timestamp').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        tripTimestampIdx: index('trip_gps_log_trip_timestamp_idx').on(table.trip_id, table.timestamp),
    };
});

// Define relations
export const tripsRelations = relations(trips, ({ one, many }) => ({
    route: one(routes, {
        fields: [trips.route_id],
        references: [routes.id],
    }),
    driver: one(drivers, {
        fields: [trips.driver_id],
        references: [drivers.id],
    }),
    vehicle: one(vehicles, {
        fields: [trips.vehicle_id],
        references: [vehicles.id],
    }),
    boardingLogs: many(tripBoardingLogs),
    gpsLogs: many(tripGPSLogs),
}));

export const tripBoardingLogsRelations = relations(tripBoardingLogs, ({ one }) => ({
    trip: one(trips, {
        fields: [tripBoardingLogs.trip_id],
        references: [trips.id],
    }),
    employee: one(users, {
        fields: [tripBoardingLogs.employee_id],
        references: [users.id],
    }),
    stop: one(stops, {
        fields: [tripBoardingLogs.stop_id],
        references: [stops.id],
    }),
}));

export const tripGPSLogsRelations = relations(tripGPSLogs, ({ one }) => ({
    trip: one(trips, {
        fields: [tripGPSLogs.trip_id],
        references: [trips.id],
    }),
}));
