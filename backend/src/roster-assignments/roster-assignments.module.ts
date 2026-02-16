import { Module } from '@nestjs/common';
import { RosterAssignmentsService } from './roster-assignments.service';
import { RosterAssignmentsController } from './roster-assignments.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';


@Module({
    imports: [DrizzleModule],
    controllers: [RosterAssignmentsController],
    providers: [RosterAssignmentsService],
    exports: [RosterAssignmentsService],
})
export class RosterAssignmentsModule { }
