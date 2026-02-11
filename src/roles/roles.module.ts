import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [RolesService, PermissionsGuard],
})
export class RolesModule {}
