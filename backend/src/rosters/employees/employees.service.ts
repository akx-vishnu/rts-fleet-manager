import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/schema';
import { employees, users } from '../../drizzle/schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class EmployeesService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const [employee] = await this.db
      .insert(employees)
      .values({
        user_id: createEmployeeDto.userId,
        employee_id: createEmployeeDto.employee_id,
        name: createEmployeeDto.name,
        phone: createEmployeeDto.phone,
        department: createEmployeeDto.department,
        designation: createEmployeeDto.designation,
        shift_start: createEmployeeDto.shift_start,
        shift_end: createEmployeeDto.shift_end,
      })
      .returning();

    return employee;
  }

  async findAll() {
    return this.db.query.employees.findMany({
      with: {
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.db.query.employees.findFirst({
      where: eq(employees.id, id),
      with: {
        user: true,
      },
    });
    return employee || null;
  }

  async update(id: string, updateEmployeeDto: any) {
    const employee = await this.findOne(id);
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);

    const updateData: any = { updated_at: new Date() };

    if (updateEmployeeDto.employee_id) {
      if (updateEmployeeDto.employee_id !== employee.employee_id) {
        const existing = await this.db.query.employees.findFirst({
          where: eq(employees.employee_id, updateEmployeeDto.employee_id),
        });
        if (existing) throw new ConflictException('Employee ID already exists');
      }
      updateData.employee_id = updateEmployeeDto.employee_id;
    }

    if (updateEmployeeDto.name) updateData.name = updateEmployeeDto.name;
    if (updateEmployeeDto.phone) updateData.phone = updateEmployeeDto.phone;
    if (updateEmployeeDto.department)
      updateData.department = updateEmployeeDto.department;
    if (updateEmployeeDto.designation)
      updateData.designation = updateEmployeeDto.designation;
    if (updateEmployeeDto.shift_start)
      updateData.shift_start = updateEmployeeDto.shift_start;
    if (updateEmployeeDto.shift_end)
      updateData.shift_end = updateEmployeeDto.shift_end;

    // Sync with user record if exists and details provided
    if (
      employee.user_id &&
      (updateEmployeeDto.name ||
        updateEmployeeDto.phone ||
        updateEmployeeDto.email)
    ) {
      const userUpdate: any = { updated_at: new Date() };
      if (updateEmployeeDto.name) userUpdate.name = updateEmployeeDto.name;
      if (updateEmployeeDto.phone) userUpdate.phone = updateEmployeeDto.phone;
      if (updateEmployeeDto.email) userUpdate.email = updateEmployeeDto.email;

      await this.db
        .update(users)
        .set(userUpdate)
        .where(eq(users.id, employee.user_id));
    }

    await this.db.update(employees).set(updateData).where(eq(employees.id, id));

    return this.findOne(id);
  }

  async remove(id: string) {
    const employee = await this.findOne(id);
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);

    await this.db.delete(employees).where(eq(employees.id, id));
    return { message: 'Employee deleted successfully' };
  }
}
