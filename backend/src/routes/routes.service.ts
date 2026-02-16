import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { routes, stops, routeStops } from '../drizzle/schema';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { eq, desc } from 'drizzle-orm';
import { StopType } from '../drizzle/schema/routes';

@Injectable()
export class RoutesService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(createRouteDto: CreateRouteDto) {
        return this.db.transaction(async (tx) => {
            // 1. Create Route
            const [route] = await tx.insert(routes).values({
                name: createRouteDto.name,
                origin: createRouteDto.origin,
                destination: createRouteDto.destination,
                estimated_duration_mins: createRouteDto.estimated_duration,
            }).returning();

            // 2. Process Stops
            let sequence = 1;
            for (const stopDto of createRouteDto.stops) {
                const [stop] = await tx.insert(stops).values({
                    name: stopDto.name,
                    lat: stopDto.lat,
                    lng: stopDto.lng,
                    type: (stopDto.type as any) || schema.StopType.PICKUP,
                }).returning();

                await tx.insert(routeStops).values({
                    route_id: route.id,
                    stop_id: stop.id,
                    sequence_order: sequence++,
                    expected_time_offset_mins: 0,
                });
            }

            // Return the created route using the SAME transaction
            // We cannot use this.findOne(id) because it uses this.db (outside tx)
            const createdRoute = await tx.query.routes.findFirst({
                where: eq(routes.id, route.id),
                with: {
                    stops: {
                        with: {
                            stop: true
                        },
                        orderBy: (routeStops: any, { asc }: any) => [asc(routeStops.sequence_order)],
                    }
                }
            });

            return createdRoute;
        });
    }

    async findAll() {
        return this.db.query.routes.findMany({
            with: {
                stops: {
                    with: {
                        stop: true
                    }
                }
            },
            orderBy: [desc(routes.created_at)],
        });
    }

    async findOne(id: string) {
        const route = await this.db.query.routes.findFirst({
            where: eq(routes.id, id),
            with: {
                stops: {
                    with: {
                        stop: true
                    },
                    orderBy: (routeStops: any, { asc }: any) => [asc(routeStops.sequence_order)],
                }
            }
        });

        if (!route) throw new NotFoundException(`Route #${id} not found`);
        return route;
    }

    async update(id: string, updateRouteDto: UpdateRouteDto) {
        const route = await this.findOne(id);

        const updateData: any = {
            updated_at: new Date(),
        };

        if (updateRouteDto.driverId) updateData.driver_id = updateRouteDto.driverId;
        if (updateRouteDto.vehicleId) updateData.vehicle_id = updateRouteDto.vehicleId;
        if (updateRouteDto.name) updateData.name = updateRouteDto.name;
        if (updateRouteDto.origin) updateData.origin = updateRouteDto.origin;
        if (updateRouteDto.destination) updateData.destination = updateRouteDto.destination;
        if (updateRouteDto.estimated_duration) updateData.estimated_duration_mins = updateRouteDto.estimated_duration;

        const [updatedRoute] = await this.db.update(routes)
            .set(updateData)
            .where(eq(routes.id, id))
            .returning();

        return updatedRoute;
    }

    async remove(id: string) {
        await this.db.delete(routes).where(eq(routes.id, id));
    }
}
