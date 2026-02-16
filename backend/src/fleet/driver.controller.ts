import { Controller, Get, Post, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BoardingStatus } from '../drizzle/schema/trips';
import { Role } from '../common/enums/role.enum';

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
export class DriverController {
    constructor(private readonly fleetService: FleetService) { }

    @Get('me')
    async getProfile(@Request() req: any) {
        const driver = await this.fleetService.findDriverByUserId(req.user.userId);
        if (!driver) {
            throw new NotFoundException('Driver profile not found');
        }
        return driver;
    }

    @Get('trips')
    async getTrips(@Request() req: any) {
        return this.fleetService.getDriverTrips(req.user.userId);
    }

    @Get('trips/:id')
    async getTripDetails(@Param('id') id: string) {
        return this.fleetService.getTripDetails(id);
    }

    @Post('trips/:id/start')
    async startTrip(@Param('id') id: string) {
        return this.fleetService.startTrip(id);
    }

    @Post('trips/:id/complete')
    async completeTrip(@Param('id') id: string, @Body('distance') distance: number) {
        return this.fleetService.completeTrip(id, distance);
    }

    @Post('trips/:id/stops/:stopId/employees/:employeeId/status')
    async updateEmployeeStatus(
        @Param('id') tripId: string,
        @Param('stopId') stopId: string,
        @Param('employeeId') employeeId: string,
        @Body('status') status: BoardingStatus
    ) {
        return this.fleetService.updateEmployeeStatus(tripId, stopId, employeeId, status);
    }

    @Post('trips/:id/location')
    async updateLocation(
        @Param('id') tripId: string,
        @Body() location: { lat: number; lng: number }
    ) {
        return this.fleetService.updateTripLocation(tripId, location.lat, location.lng);
    }
}
