import { IsDateString, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { RosterType } from '../../drizzle/schema/rosters';

export class CreateRosterDto {
    @IsUUID()
    employeeId: string;

    @IsUUID()
    routeId: string;

    @IsDateString()
    date: string; // YYYY-MM-DD

    @IsEnum(RosterType)
    type: RosterType;
}
