import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(identifier: string, pass: string): Promise<any> {
        console.log(`[AuthService] Validating user: "${identifier}"`);
        const user = await this.usersService.findByIdentifier(identifier);

        if (!user) {
            console.log(`[AuthService] User not found for identifier: "${identifier}"`);
            return null;
        }

        const isPasswordMatching = await bcrypt.compare(pass, user.password_hash);
        console.log(`[AuthService] Password match for "${identifier}": ${isPasswordMatching}`);

        if (isPasswordMatching) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Restrict login to specific roles
        const allowedRoles = [Role.SUPER_ADMIN, Role.ADMIN, Role.DRIVER];
        if (!allowedRoles.includes(user.role)) {
            console.log(`[AuthService] Login denied for user "${user.email || user.phone}" with role: ${user.role}`);
            throw new UnauthorizedException('Your account does not have permission to log into this system.');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}
