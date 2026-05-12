import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UploaderModule } from '../uploader/uploader.module';

@Module({
  imports: [UploaderModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
