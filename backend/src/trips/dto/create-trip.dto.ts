import { IsUUID, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { TripStatus } from '../../drizzle/schema/trips';

export class CreateTripDto {
    @IsUUID()
    routeId: string;

    @IsUUID()
    driverId: string;

    @IsUUID()
    vehicleId: string;

    @IsDateString()
    start_time: string;
}
