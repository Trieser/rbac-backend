import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RbacModule } from './rbac/rbac.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

ConfigModule.forRoot({
  isGlobal: true,
});


@Module({
  imports: [ConfigModule, AuthModule, UsersModule, RolesModule, PermissionsModule, RbacModule, AuditLogModule, PrismaModule],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
