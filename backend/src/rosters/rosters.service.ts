import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { rosters, users, routes } from '../drizzle/schema';
import { CreateRosterDto } from './dto/create-roster.dto';
import { UpdateRosterDto } from './dto/update-roster.dto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class RostersService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(createRosterDto: CreateRosterDto) {
        // Validate employee and route existence if needed, but FK constraints handle it mostly.
        const [roster] = await this.db.insert(rosters).values({
            employee_id: createRosterDto.employeeId,
            route_id: createRosterDto.routeId,
            date: createRosterDto.date,
            type: createRosterDto.type as any,
        }).returning();

        return this.findOne(roster.id);
    }

    async findAll(date?: string, employeeId?: string) {
        const filters: any[] = [];
        if (date) filters.push(eq(rosters.date, date));
        if (employeeId) filters.push(eq(rosters.employee_id, employeeId));

        return this.db.query.rosters.findMany({
            where: filters.length ? and(...filters) : undefined,
            with: {
                employee: true,
                route: true,
            },
        });
    }

    async findOne(id: string) {
        const roster = await this.db.query.rosters.findFirst({
            where: eq(rosters.id, id),
            with: {
                employee: true,
                route: true,
            },
        });

        if (!roster) throw new NotFoundException(`Roster #${id} not found`);
        return roster;
    }

    async update(id: string, updateRosterDto: UpdateRosterDto) {
        const updateData: any = {
            updated_at: new Date(),
        };

        if (updateRosterDto.employeeId) updateData.employee_id = updateRosterDto.employeeId;
        if (updateRosterDto.routeId) updateData.route_id = updateRosterDto.routeId;
        if (updateRosterDto.date) updateData.date = updateRosterDto.date;
        if (updateRosterDto.type) updateData.type = updateRosterDto.type;
        if (updateRosterDto.status) updateData.status = updateRosterDto.status;

        const [updatedRoster] = await this.db.update(rosters)
            .set(updateData)
            .where(eq(rosters.id, id))
            .returning();

        return this.findOne(updatedRoster.id);
    }

    async remove(id: string) {
        await this.db.delete(rosters).where(eq(rosters.id, id));
    }

    async findByDate(date: string) {
        return this.db.query.rosters.findMany({
            where: eq(rosters.date, date),
            with: {
                employee: true,
                route: true,
            },
        });
    }
}
