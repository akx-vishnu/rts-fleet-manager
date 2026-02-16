import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TripStatus } from '../../drizzle/schema/trips';

export class UpdateTripDto {
    @IsEnum(TripStatus)
    @IsOptional()
    status?: TripStatus;

    @IsNumber()
    @IsOptional()
    distance_traveled_km?: number;

    @IsOptional()
    driverId?: string;

    @IsOptional()
    vehicleId?: string;
}
