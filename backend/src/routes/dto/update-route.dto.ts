import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStopDto } from './create-route.dto';

export class UpdateRouteDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    origin?: string;

    @IsString()
    @IsOptional()
    destination?: string;

    @IsNumber()
    @IsOptional()
    estimated_duration?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateStopDto)
    @IsOptional()
    stops?: CreateStopDto[];

    @IsString()
    @IsOptional()
    driverId?: string;

    @IsString()
    @IsOptional()
    vehicleId?: string;
}
