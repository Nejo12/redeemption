import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SenderProfileController } from './sender-profile.controller';
import { SenderProfileRepository } from './sender-profile.repository';
import { SenderProfileService } from './sender-profile.service';

@Module({
  imports: [AuthModule],
  controllers: [SenderProfileController],
  providers: [SenderProfileRepository, SenderProfileService],
})
export class SenderProfileModule {}
