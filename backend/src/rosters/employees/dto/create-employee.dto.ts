import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateEmployeeDto {
    @IsUUID()
    userId: string;

    @IsString()
    department: string;

    @IsString()
    designation: string;

    @IsString()
    employee_id: string;

    @IsString()
    @IsOptional()
    shift_start?: string;

    @IsString()
    @IsOptional()
    shift_end?: string;
}
