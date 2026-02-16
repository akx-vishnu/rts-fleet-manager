import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { driverShifts } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ShiftsService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(createShiftDto: any) {
        // Check for conflicts - same driver, same day, overlapping dates
        const conflicts = await this.db.query.driverShifts.findMany({
            where: and(
                eq(driverShifts.driver_id, createShiftDto.driverId),
                eq(driverShifts.day_of_week, createShiftDto.dayOfWeek),
                eq(driverShifts.is_active, true)
            ),
        });

        if (conflicts.length > 0) {
            throw new ConflictException('Driver already has a shift on this day');
        }

        const [shift] = await this.db.insert(driverShifts).values({
            driver_id: createShiftDto.driverId,
            shift_type: createShiftDto.shiftType,
            day_of_week: createShiftDto.dayOfWeek,
            is_active: true,
            effective_from: createShiftDto.effectiveFrom,
            effective_until: createShiftDto.effectiveUntil,
        }).returning();

        return this.findOne(shift.id);
    }

    async findAll(driverId?: string) {
        const where = driverId ? eq(driverShifts.driver_id, driverId) : undefined;

        return this.db.query.driverShifts.findMany({
            where,
            with: {
                driver: {
                    with: {
                        user: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const shift = await this.db.query.driverShifts.findFirst({
            where: eq(driverShifts.id, id),
            with: {
                driver: {
                    with: {
                        user: true,
                    },
                },
            },
        });

        if (!shift) {
            throw new NotFoundException(`Shift with ID ${id} not found`);
        }

        return shift;
    }

    async update(id: string, updateShiftDto: any) {
        const shift = await this.findOne(id);

        const updateData: any = {
            updated_at: new Date(),
        };

        if (updateShiftDto.shiftType) updateData.shift_type = updateShiftDto.shiftType;
        if (updateShiftDto.dayOfWeek !== undefined) updateData.day_of_week = updateShiftDto.dayOfWeek;
        if (updateShiftDto.isActive !== undefined) updateData.is_active = updateShiftDto.isActive;
        if (updateShiftDto.effectiveFrom) updateData.effective_from = updateShiftDto.effectiveFrom;
        if (updateShiftDto.effectiveUntil !== undefined) updateData.effective_until = updateShiftDto.effectiveUntil;

        await this.db.update(driverShifts)
            .set(updateData)
            .where(eq(driverShifts.id, id));

        return this.findOne(id);
    }

    async remove(id: string) {
        // Soft delete by marking as inactive
        await this.db.update(driverShifts)
            .set({ is_active: false, updated_at: new Date() })
            .where(eq(driverShifts.id, id));
    }

    async getDriverShiftsByDate(driverId: string, date: Date) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        // Convert to our format (0 = Monday)
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const dateStr = date.toISOString().split('T')[0];

        return this.db.query.driverShifts.findMany({
            where: and(
                eq(driverShifts.driver_id, driverId),
                eq(driverShifts.day_of_week, adjustedDay),
                eq(driverShifts.is_active, true)
            ),
        });
    }
}
