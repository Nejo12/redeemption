import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { PasswordHasher } from './password-hasher';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionTokenService } from './session-token.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthService,
    AuthTokenService,
    PasswordHasher,
    SessionTokenService,
    SessionAuthGuard,
  ],
  exports: [SessionTokenService, SessionAuthGuard],
})
export class AuthModule {}
