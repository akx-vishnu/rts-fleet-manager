import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DRIZZLE } from './drizzle/drizzle.module';
import { routes, stops, routeStops, StopType } from './drizzle/schema/routes';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle/schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const db: NodePgDatabase<typeof schema> = app.get(DRIZZLE);

    console.log('🌱 Seeding Coimbatore routes...');

    const sampleRoutes = [
        {
            name: 'Saravanampatti Tech Connect',
            origin: 'Gandhipuram',
            destination: 'Saravanampatti',
            duration: 35,
            stops: [
                { name: 'Gandhipuram Central Bus Stand', lat: 11.0183, lng: 76.9644, type: StopType.PICKUP },
                { name: 'GP Signal', lat: 11.0250, lng: 76.9650, type: StopType.PICKUP },
                { name: 'Ganapathy', lat: 11.0370, lng: 76.9750, type: StopType.PICKUP },
                { name: 'Sathy Road CMC Colony', lat: 11.0500, lng: 76.9850, type: StopType.PICKUP },
                { name: 'Saravanampatti IT Park', lat: 11.0768, lng: 77.0168, type: StopType.PICKUP }
            ]
        },
        {
            name: 'Education Hub Express',
            origin: 'Peelamedu',
            destination: 'RS Puram',
            duration: 45,
            stops: [
                { name: 'Peelamedu (PSG Tech)', lat: 11.0247, lng: 77.0017, type: StopType.PICKUP },
                { name: 'Hopes College', lat: 11.0280, lng: 77.0100, type: StopType.PICKUP },
                { name: 'Lakshmi Mills', lat: 11.0150, lng: 76.9850, type: StopType.PICKUP },
                { name: 'Coimbatore Railway Station', lat: 11.0000, lng: 76.9650, type: StopType.PICKUP },
                { name: 'RS Puram East', lat: 11.0094, lng: 76.9458, type: StopType.PICKUP }
            ]
        },
        {
            name: 'Heritage Business Loop',
            origin: 'Race Course',
            destination: 'Town Hall',
            duration: 25,
            stops: [
                { name: 'Race Course Garden', lat: 10.9996, lng: 76.9744, type: StopType.PICKUP },
                { name: 'Collector Office', lat: 11.0010, lng: 76.9680, type: StopType.PICKUP },
                { name: 'Court Complex', lat: 11.0020, lng: 76.9650, type: StopType.PICKUP },
                { name: 'Lanka Corner', lat: 10.9980, lng: 76.9620, type: StopType.PICKUP },
                { name: 'Town Hall Clock Tower', lat: 10.9961, lng: 76.9602, type: StopType.PICKUP }
            ]
        },
        {
            name: 'Southern Access Route',
            origin: 'Kuniamuthur',
            destination: 'Ukkadam',
            duration: 30,
            stops: [
                { name: 'Kuniamuthur Junction', lat: 10.9669, lng: 76.9497, type: StopType.PICKUP },
                { name: 'Kovaipudur Pirivu', lat: 10.9750, lng: 76.9530, type: StopType.PICKUP },
                { name: 'Karumbukadai', lat: 10.9850, lng: 76.9580, type: StopType.PICKUP },
                { name: 'Ukkadam Bus Stand', lat: 10.9902, lng: 76.9610, type: StopType.PICKUP }
            ]
        },
        {
            name: 'Residential Parkway',
            origin: 'Vadavalli',
            destination: 'Thudiyalur',
            duration: 40,
            stops: [
                { name: 'Vadavalli Bus Terminus', lat: 11.0205, lng: 76.9025, type: StopType.PICKUP },
                { name: 'Pappanaickenpudur', lat: 11.0350, lng: 76.9150, type: StopType.PICKUP },
                { name: 'PN Pudur Signal', lat: 11.0450, lng: 76.9200, type: StopType.PICKUP },
                { name: 'Edayarpalayam Junction', lat: 11.0550, lng: 76.9250, type: StopType.PICKUP },
                { name: 'Thudiyalur Market', lat: 11.0768, lng: 76.9416, type: StopType.PICKUP }
            ]
        }
    ];

    for (const rData of sampleRoutes) {
        try {
            await db.transaction(async (tx) => {
                const [route] = await tx.insert(routes).values({
                    name: rData.name,
                    origin: rData.origin,
                    destination: rData.destination,
                    estimated_duration_mins: rData.duration,
                }).returning();

                console.log(`✅ Created Route: ${rData.name}`);

                let sequence = 1;
                for (const sData of rData.stops) {
                    const [stop] = await tx.insert(stops).values({
                        name: sData.name,
                        lat: sData.lat,
                        lng: sData.lng,
                        type: sData.type as any,
                    }).returning();

                    await tx.insert(routeStops).values({
                        route_id: route.id,
                        stop_id: stop.id,
                        sequence_order: sequence++,
                        expected_time_offset_mins: 0,
                    });
                    console.log(`   - Added Stop: ${sData.name}`);
                }
            });
        } catch (error) {
            console.error(`❌ Error seeding route ${rData.name}:`, error.message);
        }
    }

    console.log('✨ Coimbatore routes seeding complete!');
    await app.close();
}

bootstrap();
