import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { VehicleStatus } from '../../drizzle/schema/fleet';

export class CreateVehicleDto {
    @IsString()
    @Transform(({ value }) => value?.toUpperCase())
    license_plate: string;

    @IsOptional()
    @IsString()
    owner?: string;

    @IsOptional()
    @IsString()
    owner_phone?: string;

    @IsString()
    model: string;

    @IsNumber()
    capacity: number;

    @IsEnum(VehicleStatus)
    @IsOptional()
    status?: VehicleStatus;
}
