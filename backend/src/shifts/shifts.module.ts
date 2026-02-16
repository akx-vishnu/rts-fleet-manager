import { Module } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [ShiftsController],
    providers: [ShiftsService],
    exports: [ShiftsService],
})
export class ShiftsModule { }
