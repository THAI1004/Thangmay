import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { StaffsService } from './src/staffs/staffs.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const staffsService = app.get(StaffsService);

  console.log('🔄 Đang cập nhật lại mật khẩu cho tài khoản admin@gmail.com về "123456789"...');
  try {
    const staff = await staffsService.findOnew('admin@gmail.com');
    if (staff) {
      await staffsService.update(staff.id, { password: '123456789' });
      console.log('✅ Đã cập nhật thành công!');
    } else {
      console.log('❌ Không tìm thấy tài khoản admin@gmail.com');
    }
  } catch (err) {
    console.error('❌ Lỗi:', err);
  }
  
  await app.close();
}
bootstrap();
