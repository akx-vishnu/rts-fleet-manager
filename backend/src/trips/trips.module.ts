import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { RoutesModule } from '../routes/routes.module';
import { FleetModule } from '../fleet/fleet.module';
import { EventsModule } from '../events/events.module';
import { TripGeneratorService } from './trip-generator.service';

@Module({
    imports: [
        RoutesModule,
        FleetModule,
        EventsModule,
    ],
    controllers: [TripsController],
    providers: [TripsService, TripGeneratorService],
    exports: [TripsService],
})
export class TripsModule { }
