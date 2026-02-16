import { pgTable, uuid, text, date, timestamp, pgEnum, integer, boolean, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { drivers } from './fleet';
import { users, routes, vehicles } from './index';
import { employees } from './rosters';
import { TripType, tripTypeEnum } from './trips';

// Enums
export enum ShiftType {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
    NIGHT = 'night',
    WEEKEND = 'weekend',
}



export enum AssignmentStatus {
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

// Enum definitions for PostgreSQL
export const shiftTypeEnum = pgEnum('shift_type', [
    ShiftType.MORNING,
    ShiftType.AFTERNOON,
    ShiftType.NIGHT,
    ShiftType.WEEKEND,
]);

export const assignmentStatusEnum = pgEnum('assignment_status', [
    AssignmentStatus.ASSIGNED,
    AssignmentStatus.IN_PROGRESS,
    AssignmentStatus.COMPLETED,
    AssignmentStatus.CANCELLED,
]);

// Tables

// Driver shift schedules (recurring patterns)
export const driverShifts = pgTable('driver_shifts', {
    id: uuid('id').defaultRandom().primaryKey(),
    driver_id: uuid('driver_id').references(() => drivers.id).notNull(),
    shift_type: shiftTypeEnum('shift_type').notNull(),
    day_of_week: integer('day_of_week').notNull(), // 0 = Monday, 6 = Sunday
    is_active: boolean('is_active').default(true).notNull(),
    effective_from: date('effective_from').notNull(),
    effective_until: date('effective_until'), // nullable for ongoing
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Daily roster assignments (driver-vehicle-route for specific date)
export const rosterAssignments = pgTable('roster_assignments', {
    id: uuid('id').defaultRandom().primaryKey(),
    driver_id: uuid('driver_id').references(() => drivers.id).notNull(),
    vehicle_id: uuid('vehicle_id').references(() => vehicles.id).notNull(),
    route_id: uuid('route_id').references(() => routes.id).notNull(),
    date: date('date').notNull(),
    shift_type: shiftTypeEnum('shift_type').notNull(),
    trip_type: tripTypeEnum('trip_type').default(TripType.PICKUP),
    scheduled_time: time('scheduled_time'),
    status: assignmentStatusEnum('status').default(AssignmentStatus.ASSIGNED).notNull(),
    notes: text('notes'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Junction table for employees assigned to roster
export const rosterAssignmentEmployees = pgTable('roster_assignment_employees', {
    id: uuid('id').defaultRandom().primaryKey(),
    roster_assignment_id: uuid('roster_assignment_id').references(() => rosterAssignments.id, { onDelete: 'cascade' }).notNull(),
    employee_id: uuid('employee_id').references(() => employees.id).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// Rotation fairness tracking (monthly metrics per driver)
export const rotationTracking = pgTable('rotation_tracking', {
    id: uuid('id').defaultRandom().primaryKey(),
    driver_id: uuid('driver_id').references(() => drivers.id).notNull(),
    month: date('month').notNull(), // YYYY-MM-01 format
    weekend_count: integer('weekend_count').default(0).notNull(),
    night_shift_count: integer('night_shift_count').default(0).notNull(),
    total_shifts: integer('total_shifts').default(0).notNull(),
    last_weekend_date: date('last_weekend_date'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const driverShiftsRelations = relations(driverShifts, ({ one }) => ({
    driver: one(drivers, {
        fields: [driverShifts.driver_id],
        references: [drivers.id],
    }),
}));

export const rosterAssignmentsRelations = relations(rosterAssignments, ({ one, many }) => ({
    driver: one(drivers, {
        fields: [rosterAssignments.driver_id],
        references: [drivers.id],
    }),
    vehicle: one(vehicles, {
        fields: [rosterAssignments.vehicle_id],
        references: [vehicles.id],
    }),
    route: one(routes, {
        fields: [rosterAssignments.route_id],
        references: [routes.id],
    }),
    employees: many(rosterAssignmentEmployees),
}));

export const rosterAssignmentEmployeesRelations = relations(rosterAssignmentEmployees, ({ one }) => ({
    rosterAssignment: one(rosterAssignments, {
        fields: [rosterAssignmentEmployees.roster_assignment_id],
        references: [rosterAssignments.id],
    }),
    employee: one(employees, {
        fields: [rosterAssignmentEmployees.employee_id],
        references: [employees.id],
    }),
}));

export const rotationTrackingRelations = relations(rotationTracking, ({ one }) => ({
    driver: one(drivers, {
        fields: [rotationTracking.driver_id],
        references: [drivers.id],
    }),
}));
