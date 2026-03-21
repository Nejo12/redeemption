import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { OrdersController } from './orders.controller';
import { OrdersInternalController } from './orders.internal-controller';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [OrdersController, OrdersInternalController],
  providers: [OrdersRepository, OrdersService],
  exports: [OrdersRepository, OrdersService],
})
export class OrdersModule {}
