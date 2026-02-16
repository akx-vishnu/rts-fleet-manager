import { Module } from '@nestjs/common';

import { RostersService } from './rosters.service';
import { RostersController } from './rosters.controller';
import { UsersModule } from '../users/users.module';
import { RoutesModule } from '../routes/routes.module';

@Module({
    imports: [
        UsersModule,
        RoutesModule,
    ],
    controllers: [RostersController],
    providers: [RostersService],
    exports: [RostersService],
})
export class RostersModule { }
