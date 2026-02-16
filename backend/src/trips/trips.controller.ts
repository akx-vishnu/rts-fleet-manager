import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { EventsGateway } from '../events/events.gateway';
import { TripGeneratorService } from './trip-generator.service';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
    constructor(
        private readonly tripsService: TripsService,
        private readonly tripGeneratorService: TripGeneratorService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    @Post('generate')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    async generateTrips(@Body('date') date?: string) {
        const targetDate = date ? new Date(date) : undefined;
        const result = await this.tripGeneratorService.generateDailyTrips(targetDate);
        this.eventsGateway.server.emit('tripsUpdated');
        return result;
    }

    @Post()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    create(@Body() createTripDto: CreateTripDto) {
        return this.tripsService.create(createTripDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER)
    async findAll(
        @Query('driverId') driverId?: string,
        @Query('status') status?: string,
        @GetUser() user?: any
    ) {
        // If driver requests their own trips or "me" is passed
        if (driverId === 'me' || (user?.role === Role.DRIVER && !driverId)) {
            // Find driver record for the user
            const driver = await this.tripsService.findDriverByUserId(user.userId);
            if (!driver) {
                return []; // Or throw error
            }
            driverId = driver.id;
        }

        return this.tripsService.findAll(driverId, status);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER)
    findOne(@Param('id') id: string) {
        return this.tripsService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER)
    update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
        return this.tripsService.update(id, updateTripDto);
    }

    @Post(':id/boarding')
    @Roles(Role.DRIVER)
    markBoarding(@Param('id') tripId: string, @Body() markBoardingDto: any) {
        return this.tripsService.markBoarding(tripId, markBoardingDto);
    }

    @Get(':id/boarding')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER)
    getBoardingLogs(@Param('id') tripId: string) {
        return this.tripsService.getBoardingLogs(tripId);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.tripsService.remove(id);
    }
}
