import { pgTable, uuid, text, integer, doublePrecision, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export enum VehicleStatus {
    ACTIVE = 'active',
    MAINTENANCE = 'maintenance',
    INACTIVE = 'inactive',
}

export enum DriverStatus {
    ACTIVE = 'active',
    ON_TRIP = 'on_trip',
    OFF_DUTY = 'off_duty',
}

export const vehicleStatusEnum = pgEnum('vehicle_status', [VehicleStatus.ACTIVE, VehicleStatus.MAINTENANCE, VehicleStatus.INACTIVE]);
export const driverStatusEnum = pgEnum('driver_status', [DriverStatus.ACTIVE, DriverStatus.ON_TRIP, DriverStatus.OFF_DUTY]);

export const vehicles = pgTable('vehicles', {
    id: uuid('id').defaultRandom().primaryKey(),
    license_plate: text('license_plate').unique().notNull(),
    model: text('model').notNull(),
    capacity: integer('capacity').notNull(),
    owner: text('owner').default('RTS'),
    owner_phone: text('owner_phone'),
    status: vehicleStatusEnum('status').default(VehicleStatus.ACTIVE).notNull(),
    current_lat: doublePrecision('current_lat'),
    current_lng: doublePrecision('current_lng'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const drivers = pgTable('drivers', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => users.id).notNull().unique(),
    license_number: text('license_number').notNull(),
    status: driverStatusEnum('status').default(DriverStatus.OFF_DUTY).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const driversRelations = relations(drivers, ({ one }) => ({
    user: one(users, {
        fields: [drivers.user_id],
        references: [users.id],
    }),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
    drivers: many(drivers),
}));
