import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { TemplatesModule } from '../templates/templates.module';
import { RenderingController } from './rendering.controller';
import { RenderingRepository } from './rendering.repository';
import { RenderingService } from './rendering.service';

@Module({
  imports: [AuthModule, StorageModule, TemplatesModule],
  controllers: [RenderingController],
  providers: [RenderingRepository, RenderingService],
})
export class RenderingModule {}
