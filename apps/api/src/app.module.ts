import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { SenderProfileModule } from './sender-profile/sender-profile.module';

@Module({
  imports: [DatabaseModule, AuthModule, SenderProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
