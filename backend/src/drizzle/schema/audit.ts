import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    action: text('action').notNull(),
    details: text('details'),
    user_id: uuid('user_id').references(() => users.id).notNull(),
    ip_address: text('ip_address').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

import { relations } from 'drizzle-orm';

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.user_id],
        references: [users.id],
    }),
}));
