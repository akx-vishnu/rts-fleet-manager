import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { Role } from '../../common/enums/role.enum';

export const roleEnum = pgEnum('role', [Role.SUPER_ADMIN, Role.ADMIN, Role.DRIVER, Role.EMPLOYEE]);

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').unique(),
    name: text('name'),
    phone: text('phone').unique().notNull(),
    password_hash: text('password_hash').notNull(),
    role: roleEnum('role').default(Role.DRIVER).notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});
