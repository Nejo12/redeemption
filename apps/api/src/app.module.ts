import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { DatabaseModule } from './database/database.module';
import { SenderProfileModule } from './sender-profile/sender-profile.module';

@Module({
  imports: [DatabaseModule, AuthModule, SenderProfileModule, ContactsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
