import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { rosterAssignments, rotationTracking, AssignmentStatus, rosterAssignmentEmployees } from '../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';


@Injectable()
export class RosterAssignmentsService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(createAssignmentDto: any) {
        const { driverId, vehicleId, routeId, date, shiftType } = createAssignmentDto;

        // 1. Check if driver is on leave (Leave system has been removed)
        // const onLeave = await this.leaveService.isDriverOnLeave(driverId, date);
        // if (onLeave) {
        //     throw new ConflictException('Driver is on approved leave on this date');
        // }

        // Note: Removed the single-assignment-per-day constraint.
        // Drivers can now have multiple assignments (different routes/shifts) on the same day.

        // Note: Vehicle conflict check has also been removed.
        // Admin has full control and can assign vehicles as needed (e.g., for overlapping shifts or quick turnarounds).
        // Conflict checks are handled by AI suggestions, not hard constraints.

        // Create assignment
        const [assignment] = await this.db.insert(rosterAssignments).values({
            driver_id: driverId,
            vehicle_id: vehicleId,
            route_id: routeId,
            date: date,
            shift_type: shiftType,
            trip_type: createAssignmentDto.tripType,
            scheduled_time: createAssignmentDto.scheduledTime,
            status: AssignmentStatus.ASSIGNED,
            notes: createAssignmentDto.notes,
        }).returning();

        // Assign employees
        if (createAssignmentDto.employeeIds && createAssignmentDto.employeeIds.length > 0) {
            await this.db.insert(rosterAssignmentEmployees).values(
                createAssignmentDto.employeeIds.map((empId: string) => ({
                    roster_assignment_id: assignment.id,
                    employee_id: empId,
                }))
            );
        }

        // Update rotation tracking
        await this.updateRotationTracking(driverId, date, shiftType);

        return this.findOne(assignment.id);
    }

    async findAll(date?: string, driverId?: string, vehicleId?: string, fromDate?: string, toDate?: string) {
        const filters: any[] = [];
        if (date) filters.push(eq(rosterAssignments.date, date));
        if (driverId) filters.push(eq(rosterAssignments.driver_id, driverId));
        if (vehicleId) filters.push(eq(rosterAssignments.vehicle_id, vehicleId));
        if (fromDate) filters.push(gte(rosterAssignments.date, fromDate));
        if (toDate) filters.push(lte(rosterAssignments.date, toDate));

        return this.db.query.rosterAssignments.findMany({
            where: filters.length ? and(...filters) : undefined,
            with: {
                driver: {
                    with: {
                        user: true,
                    },
                },
                vehicle: true,
                route: true,
                employees: {
                    with: {
                        employee: {
                            with: {
                                user: true
                            }
                        }
                    }
                }
            },
            orderBy: (rosterAssignments, { asc }) => [asc(rosterAssignments.date)],
        });
    }

    async findOne(id: string) {
        const assignment = await this.db.query.rosterAssignments.findFirst({
            where: eq(rosterAssignments.id, id),
            with: {
                driver: {
                    with: {
                        user: true,
                    },
                },
                vehicle: true,
                route: true,
                employees: {
                    with: {
                        employee: {
                            with: {
                                user: true
                            }
                        }
                    }
                }
            },
        });

        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${id} not found`);
        }

        return assignment;
    }

    async update(id: string, updateAssignmentDto: any) {
        await this.findOne(id);

        const updateData: any = {
            updated_at: new Date(),
        };

        if (updateAssignmentDto.status) updateData.status = updateAssignmentDto.status;
        if (updateAssignmentDto.notes !== undefined) updateData.notes = updateAssignmentDto.notes;
        if (updateAssignmentDto.tripType) updateData.trip_type = updateAssignmentDto.tripType;
        if (updateAssignmentDto.scheduledTime) updateData.scheduled_time = updateAssignmentDto.scheduledTime;

        await this.db.update(rosterAssignments)
            .set(updateData)
            .where(eq(rosterAssignments.id, id));

        // Handle employee updates
        if (updateAssignmentDto.employeeIds !== undefined) {
            await this.db.delete(rosterAssignmentEmployees)
                .where(eq(rosterAssignmentEmployees.roster_assignment_id, id));

            if (updateAssignmentDto.employeeIds.length > 0) {
                await this.db.insert(rosterAssignmentEmployees).values(
                    updateAssignmentDto.employeeIds.map((empId: string) => ({
                        roster_assignment_id: id,
                        employee_id: empId,
                    }))
                );
            }
        }

        return this.findOne(id);
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.db.delete(rosterAssignments).where(eq(rosterAssignments.id, id));
    }

    private async updateRotationTracking(driverId: string, date: string, shiftType: string) {
        const assignmentDate = new Date(date);
        const month = new Date(assignmentDate.getFullYear(), assignmentDate.getMonth(), 1)
            .toISOString().split('T')[0];

        const dayOfWeek = assignmentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isNightShift = shiftType === 'night';

        // Find or create rotation tracking for this month
        let tracking = await this.db.query.rotationTracking.findFirst({
            where: and(
                eq(rotationTracking.driver_id, driverId),
                eq(rotationTracking.month, month)
            ),
        });

        if (!tracking) {
            // Create new tracking record
            const [newTracking] = await this.db.insert(rotationTracking).values({
                driver_id: driverId,
                month: month,
                weekend_count: isWeekend ? 1 : 0,
                night_shift_count: isNightShift ? 1 : 0,
                total_shifts: 1,
                last_weekend_date: isWeekend ? date : null,
            }).returning();
            return newTracking;
        } else {
            // Update existing tracking
            await this.db.update(rotationTracking)
                .set({
                    weekend_count: tracking.weekend_count + (isWeekend ? 1 : 0),
                    night_shift_count: tracking.night_shift_count + (isNightShift ? 1 : 0),
                    total_shifts: tracking.total_shifts + 1,
                    last_weekend_date: isWeekend ? date : tracking.last_weekend_date,
                    updated_at: new Date(),
                })
                .where(eq(rotationTracking.id, tracking.id));
        }
    }

    async getFairnessScore(driverId: string, month: string): Promise<number> {
        const tracking = await this.db.query.rotationTracking.findFirst({
            where: and(
                eq(rotationTracking.driver_id, driverId),
                eq(rotationTracking.month, month)
            ),
        });

        if (!tracking) {
            return 0; // New driver, lowest score (most deserving)
        }

        // Lower score = more deserving
        // Weekend shifts are weighted heavily (2x)
        // Night shifts weighted moderately (1.5x)
        // Total shifts weighted lightly (0.5x)
        return (tracking.weekend_count * 2) +
            (tracking.night_shift_count * 1.5) +
            (tracking.total_shifts * 0.5);
    }

    async suggestDriversForDate(date: string, routeId: string) {
        // Get all drivers
        const allDrivers = await this.db.query.drivers.findMany({
            with: {
                user: true,
            },
        });

        const month = new Date(date).toISOString().slice(0, 7) + '-01';
        const suggestions = [];

        for (const driver of allDrivers) {
            // Check availability (Leave system has been removed)
            // const onLeave = await this.leaveService.isDriverOnLeave(driver.id, date);
            // if (onLeave) continue;

            // Check existing assignment
            const hasAssignment = await this.db.query.rosterAssignments.findFirst({
                where: and(
                    eq(rosterAssignments.driver_id, driver.id),
                    eq(rosterAssignments.date, date)
                ),
            });
            if (hasAssignment) continue;

            // Calculate fairness score
            const fairnessScore = await this.getFairnessScore(driver.id, month);

            suggestions.push({
                driver,
                fairnessScore,
                confidence: 1 / (fairnessScore + 1), // Higher confidence for lower scores
                reasoning: this.getReasoningText(fairnessScore, false),
            });
        }

        // Sort by fairness score (ascending - lower is better)
        suggestions.sort((a, b) => a.fairnessScore - b.fairnessScore);

        return suggestions.slice(0, 5); // Return top 5 suggestions
    }

    private getReasoningText(fairnessScore: number, onLeave: boolean): string {
        if (fairnessScore === 0) {
            return 'New driver or no assignments this month - highly recommended';
        } else if (fairnessScore < 5) {
            return 'Low assignment count this month - good choice for fair rotation';
        } else if (fairnessScore < 10) {
            return 'Moderate assignment count - acceptable choice';
        } else {
            return 'High assignment count - consider other drivers for better fairness';
        }
    }
}
