import { Module } from '@nestjs/common';
import { AddressesModule } from './addresses/addresses.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { DatabaseModule } from './database/database.module';
import { SenderProfileModule } from './sender-profile/sender-profile.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    SenderProfileModule,
    ContactsModule,
    AddressesModule,
    TemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
