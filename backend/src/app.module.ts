import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FleetModule } from './fleet/fleet.module';
import { RoutesModule } from './routes/routes.module';
import { RostersModule } from './rosters/rosters.module';
import { TripsModule } from './trips/trips.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EventsModule } from './events/events.module';
import { AuditModule } from './audit/audit.module';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmployeesModule } from './rosters/employees/employees.module';

import { RosterAssignmentsModule } from './roster-assignments/roster-assignments.module';
import { AuditLoggingInterceptor } from './audit/audit-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DrizzleModule,
    UsersModule,
    AuthModule,
    FleetModule,
    EmployeesModule,
    RoutesModule,
    RostersModule,
    TripsModule,

    RosterAssignmentsModule,
    AnalyticsModule,
    EventsModule,
    AuditModule,
    RedisModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLoggingInterceptor,
    },
  ],
})
export class AppModule {}
