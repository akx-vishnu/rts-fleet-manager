import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RostersService } from './rosters.service';
import { CreateRosterDto } from './dto/create-roster.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('rosters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RostersController {
    constructor(private readonly rostersService: RostersService) { }

    @Post()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    create(@Body() createRosterDto: CreateRosterDto) {
        return this.rostersService.create(createRosterDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER, Role.EMPLOYEE) // Employees might check their own roster
    findAll(
        @Query('date') date?: string,
        @Query('employeeId') employeeId?: string,
    ) {
        return this.rostersService.findAll(date, employeeId);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    findOne(@Param('id') id: string) {
        return this.rostersService.findOne(id);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.rostersService.remove(id);
    }
}
