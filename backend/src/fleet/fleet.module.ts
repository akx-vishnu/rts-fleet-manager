import { Module } from '@nestjs/common';

import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';
import { DriverController } from './driver.controller';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [EventsModule],
    controllers: [FleetController, DriverController],
    providers: [FleetService],
    exports: [FleetService],
})
export class FleetModule { }
