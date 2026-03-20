import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RenderingModule } from '../rendering/rendering.module';
import { StorageModule } from '../storage/storage.module';
import { MomentsController } from './moments.controller';
import { MomentsRepository } from './moments.repository';
import { MomentsService } from './moments.service';

@Module({
  imports: [AuthModule, StorageModule, RenderingModule],
  controllers: [MomentsController],
  providers: [MomentsRepository, MomentsService],
})
export class MomentsModule {}
