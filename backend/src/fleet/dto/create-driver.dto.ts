import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { DriverStatus } from '../../drizzle/schema/fleet';

export class CreateDriverDto {
    @IsUUID()
    userId: string; // Link to existing User

    @IsString()
    @Transform(({ value }) => value?.toUpperCase())
    license_number: string;

    @IsEnum(DriverStatus)
    @IsOptional()
    status?: DriverStatus;
}
