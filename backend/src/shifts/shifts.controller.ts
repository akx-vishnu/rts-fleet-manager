import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
    constructor(private readonly shiftsService: ShiftsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    create(@Body() createShiftDto: any) {
        return this.shiftsService.create(createShiftDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    findAll(@Query('driverId') driverId?: string) {
        return this.shiftsService.findAll(driverId);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    findOne(@Param('id') id: string) {
        return this.shiftsService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() updateShiftDto: any) {
        return this.shiftsService.update(id, updateShiftDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.shiftsService.remove(id);
    }
}
