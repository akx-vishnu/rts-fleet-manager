import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';

import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';

@Injectable()
export class UsersService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const { password, ...rest } = createUserDto;

        try {
            // Check if phone already exists
            const existingPhone = await this.db.query.users.findFirst({
                where: eq(users.phone, createUserDto.phone),
            });

            if (existingPhone) {
                throw new ConflictException('Phone number already exists');
            }

            // Check if email already exists if provided
            if (createUserDto.email) {
                const existingEmail = await this.db.query.users.findFirst({
                    where: eq(users.email, createUserDto.email),
                });
                if (existingEmail) {
                    throw new ConflictException('Email already exists');
                }
            }

            const salt = await bcrypt.genSalt();
            const passwordToHash = password || Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            const password_hash = await bcrypt.hash(passwordToHash, salt);

            const [user] = await this.db.insert(users).values({
                ...rest,
                password_hash,
            }).returning();

            return user;
        } catch (error) {
            // Re-throw ConflictException as is
            if (error instanceof ConflictException) {
                throw error;
            }

            // Handle database unique constraint error (23505)
            if (error.code === '23505') {
                if (error.detail?.includes('phone')) {
                    throw new ConflictException('Phone number already exists');
                }
                throw new ConflictException('Email already exists');
            }

            // Re-throw other errors
            throw error;
        }
    }

    async findAll() {
        return this.db.select().from(users);
    }

    async findOne(id: string) {
        const user = await this.db.query.users.findFirst({
            where: eq(users.id, id),
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.db.query.users.findFirst({
            where: eq(users.email, email),
        });
    }

    async findByIdentifier(identifier: string) {
        if (!identifier) return null;
        const iden = identifier.trim();
        console.log(`[UsersService] Looking up user by identifier: "${iden}"`);

        return this.db.query.users.findFirst({
            where: (u, { or, eq }) => or(
                eq(u.email, iden),
                eq(u.phone, iden)
            ),
        });
    }

    async update(id: string, updateUserDto: any) {
        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt();
            updateUserDto.password_hash = await bcrypt.hash(updateUserDto.password, salt);
            delete updateUserDto.password;
        }

        const [updatedUser] = await this.db.update(users)
            .set({ ...updateUserDto, updated_at: new Date() })
            .where(eq(users.id, id))
            .returning();

        return updatedUser || null;
    }
}
