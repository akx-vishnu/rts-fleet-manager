import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RosterAssignmentsService } from './roster-assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('roster-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RosterAssignmentsController {
    constructor(private readonly rosterAssignmentsService: RosterAssignmentsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    create(@Body() createAssignmentDto: any) {
        return this.rosterAssignmentsService.create(createAssignmentDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    findAll(
        @Query('date') date?: string,
        @Query('driverId') driverId?: string,
        @Query('vehicleId') vehicleId?: string,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string
    ) {
        return this.rosterAssignmentsService.findAll(date, driverId, vehicleId, fromDate, toDate);
    }

    @Get('suggestions')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    suggestDrivers(
        @Query('date') date: string,
        @Query('routeId') routeId: string
    ) {
        return this.rosterAssignmentsService.suggestDriversForDate(date, routeId);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    findOne(@Param('id') id: string) {
        return this.rosterAssignmentsService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() updateAssignmentDto: any) {
        return this.rosterAssignmentsService.update(id, updateAssignmentDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.rosterAssignmentsService.remove(id);
    }
}
