import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { BoardingStatus } from '../../drizzle/schema/trips';

export class MarkBoardingDto {
    @IsUUID()
    @IsNotEmpty()
    employeeId: string;

    @IsUUID()
    @IsNotEmpty()
    stopId: string;

    @IsEnum(BoardingStatus)
    status: BoardingStatus;

    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;
}
