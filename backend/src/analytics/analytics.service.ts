import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FleetService } from '../fleet/fleet.service';

@Injectable()
export class AnalyticsService {
    constructor(
        private readonly usersService: UsersService,
        private readonly fleetService: FleetService,
    ) { }

    async getOverview() {
        // 1. Total Users (Drivers + Admins)
        const users = await this.usersService.findAll();
        const totalUsers = users.length;

        // 2. Active Vehicles
        const vehicles = await this.fleetService.findAllVehicles();
        const activeVehicles = vehicles.filter(v => v.status === 'active').length;
        // Assuming status is string for now, or use enum if imported

        // 3. Mock Data for Trips (until TripsModule is fully populated)
        const totalTrips = 156;
        const onTimeRate = 98.5;

        return {
            totalUsers,
            totalVehicles: vehicles.length,
            activeVehicles,
            totalTrips,
            onTimeRate,
        };
    }
}
