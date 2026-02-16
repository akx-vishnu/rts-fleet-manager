import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Controller('fleet')
export class FleetController {
    constructor(private readonly fleetService: FleetService) { }

    @Post('vehicles')
    createVehicle(@Body() createVehicleDto: CreateVehicleDto) {
        return this.fleetService.createVehicle(createVehicleDto);
    }

    @Post('drivers')
    createDriver(@Body() createDriverDto: CreateDriverDto) {
        return this.fleetService.createDriver(createDriverDto);
    }

    @Get('vehicles')
    findAllVehicles() {
        return this.fleetService.findAllVehicles();
    }

    @Get('drivers')
    findAllDrivers() {
        return this.fleetService.findAllDrivers();
    }

    @Patch('drivers/:id')
    updateDriver(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
        return this.fleetService.updateDriver(id, updateDriverDto);
    }

    @Delete('drivers/:id')
    deleteDriver(@Param('id') id: string) {
        return this.fleetService.removeDriver(id);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@GetUser() user: any) {
        if (user.role !== 'driver') {
            // For now, only drivers have a "fleet profile". 
            // Admins just have user details.
            return user;
        }
        return this.fleetService.findDriverByUserId(user.userId);
    }

    @Patch('vehicles/:id')
    updateVehicle(@Param('id') id: string, @Body() updateVehicleDto: any) {
        return this.fleetService.updateVehicle(id, updateVehicleDto);
    }

    @Delete('vehicles/:id')
    deleteVehicle(@Param('id') id: string) {
        return this.fleetService.removeVehicle(id);
    }
}
