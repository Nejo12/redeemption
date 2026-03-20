import { Module } from '@nestjs/common';
import { AddressesModule } from './addresses/addresses.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { DatabaseModule } from './database/database.module';
import { MomentsModule } from './moments/moments.module';
import { RenderingModule } from './rendering/rendering.module';
import { SenderProfileModule } from './sender-profile/sender-profile.module';
import { StorageModule } from './storage/storage.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    SenderProfileModule,
    ContactsModule,
    AddressesModule,
    MomentsModule,
    StorageModule,
    TemplatesModule,
    RenderingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
