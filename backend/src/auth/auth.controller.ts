import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(loginDto);
    const ip =
      req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';

    // Fire-and-forget audit log for successful login
    this.auditService
      .log(
        'LOGIN',
        result.user.id,
        `User logged in: ${result.user.email || result.user.phone}`,
        ip,
      )
      .catch((err) =>
        console.error('[Audit] Failed to log login:', err.message),
      );

    return result;
  }
}
