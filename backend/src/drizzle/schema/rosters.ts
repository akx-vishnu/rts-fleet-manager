import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { routes } from './routes';

export enum RosterType {
  PICKUP = 'pickup',
  DROP = 'drop',
}

export enum RosterStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export const rosterTypeEnum = pgEnum('roster_type', [
  RosterType.PICKUP,
  RosterType.DROP,
]);
export const rosterStatusEnum = pgEnum('roster_status', [
  RosterStatus.SCHEDULED,
  RosterStatus.CANCELLED,
  RosterStatus.COMPLETED,
]);

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.id), // Changed to optional
  employee_id: text('employee_id').notNull().unique(), // The external ID (e.g. EMP001)
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  department: text('department').notNull(),
  designation: text('designation').notNull(),
  shift_start: text('shift_start'),
  shift_end: text('shift_end'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const rosters = pgTable('rosters', {
  id: uuid('id').defaultRandom().primaryKey(),
  employee_id: uuid('employee_id')
    .references(() => employees.id)
    .notNull(), // Now references employees.id
  route_id: uuid('route_id')
    .references(() => routes.id)
    .notNull(),
  date: date('date').notNull(),
  type: rosterTypeEnum('type').notNull(),
  status: rosterStatusEnum('status').default(RosterStatus.SCHEDULED).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const employeesRelations = relations(employees, ({ one }) => ({
  user: one(users, {
    fields: [employees.user_id],
    references: [users.id],
  }),
}));

export const rostersRelations = relations(rosters, ({ one }) => ({
  employee: one(employees, {
    fields: [rosters.employee_id],
    references: [employees.id],
  }),
  route: one(routes, {
    fields: [rosters.route_id],
    references: [routes.id],
  }),
}));
