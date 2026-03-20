import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AddressesController } from './addresses.controller';
import { AddressesRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';

@Module({
  imports: [AuthModule],
  controllers: [AddressesController],
  providers: [AddressesRepository, AddressesService],
})
export class AddressesModule {}
