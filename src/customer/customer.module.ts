import { DepartmensModule } from 'src/departmens/departmens.module';
import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffsService } from 'src/staffs/staffs.service';
import { StaffsModule } from 'src/staffs/staffs.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SendMailService } from 'src/send-mail/send-mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]),StaffsModule,DepartmensModule,NotificationModule],
  controllers: [CustomerController],
  providers: [CustomerService, SendMailService],
})
export class CustomerModule {}
