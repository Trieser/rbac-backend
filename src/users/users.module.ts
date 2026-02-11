import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [UsersController],
  imports: [PrismaModule],
})
export class UsersModule {}
