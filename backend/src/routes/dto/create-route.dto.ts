import { IsString, IsArray, ValidateNested, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStopDto {
    @IsString()
    name: string;

    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;

    @IsString()
    @IsOptional()
    type: string; // 'pickup' | 'drop'
}

export class CreateRouteDto {
    @IsString()
    name: string;

    @IsString()
    origin: string;

    @IsString()
    destination: string;

    @IsNumber()
    estimated_duration: number; // in minutes

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateStopDto) // Assuming we pass stops directly for simplicity, or IDs
    stops: CreateStopDto[];
}
