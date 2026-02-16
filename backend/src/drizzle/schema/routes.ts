import { pgTable, uuid, text, integer, doublePrecision, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { drivers, vehicles } from './fleet';

export enum StopType {
    PICKUP = 'pickup',
    DROP = 'drop',
}

export const stopTypeEnum = pgEnum('stop_type', [StopType.PICKUP, StopType.DROP]);

export const stops = pgTable('stops', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    type: stopTypeEnum('type').default(StopType.PICKUP).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const routes = pgTable('routes', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    origin: text('origin').notNull(),
    destination: text('destination').notNull(),
    estimated_duration_mins: integer('estimated_duration_mins'),
    is_active: boolean('is_active').default(true).notNull(),
    driver_id: uuid('driver_id').references(() => drivers.id),
    vehicle_id: uuid('vehicle_id').references(() => vehicles.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const routeStops = pgTable('route_stops', {
    id: uuid('id').defaultRandom().primaryKey(),
    route_id: uuid('route_id').references(() => routes.id, { onDelete: 'cascade' }).notNull(),
    stop_id: uuid('stop_id').references(() => stops.id).notNull(),
    sequence_order: integer('sequence_order').notNull(),
    expected_time_offset_mins: integer('expected_time_offset_mins'),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const routesRelations = relations(routes, ({ one, many }) => ({
    driver: one(drivers, {
        fields: [routes.driver_id],
        references: [drivers.id],
    }),
    vehicle: one(vehicles, {
        fields: [routes.vehicle_id],
        references: [vehicles.id],
    }),
    stops: many(routeStops),
}));

export const stopsRelations = relations(stops, ({ many }) => ({
    routes: many(routeStops),
}));

export const routeStopsRelations = relations(routeStops, ({ one }) => ({
    route: one(routes, {
        fields: [routeStops.route_id],
        references: [routes.id],
    }),
    stop: one(stops, {
        fields: [routeStops.stop_id],
        references: [stops.id],
    }),
}));
